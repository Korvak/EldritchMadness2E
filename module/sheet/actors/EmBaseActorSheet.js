import {fieldToObject, overwriteObjectFields, getValueFromFields} from "../../../utils.js"
import {
    toggleDropdown, toggleReadonly, 
    renderBar, searchByTags , toggleBtnState 
} from "../../../htmlUtils.js"


export default class EmBaseActorSheet extends ActorSheet {

    //#region base methods

        constructor(...args) {
            super(...args);
            //we set some data for ourselves
            console.log("constructor args",args);
            console.log("actor", this.getData() );
            console.log("actorItems", this.getData().items);
        }

        get template() {
            return `systems/EM2E/templates/sheets/actors/baseActor-sheet.hbs`;
        }
    
        getData() {
            let data = super.getData();
            //system holds all the data
            data.CONFIG = CONFIG;
            data.SHEET_FUNCS = this._getSheetFuncs();
            return data;
        }

        activateListeners(html) {
            /** super important !!! where we bind all the events that are not in the flipbook
             * 
             */
            const self = this;
            //#region base events
                //readonly input toggle
                html.find(".em_readonlyIcon").each(function() {
                    $(this).get(0).onclick = toggleReadonly;
                });
                //toggle btns setup
                html.find(".em_toggleBtn").each(function() {
                    $(this).get(0).onclick = toggleBtnState;
                });
                //search bar
                html.find(".em_searchbarTag").each(function() {
                    //onchange finds the linked searchbar and triggers it
                    //onchange is called when the toggleBtnState is activated.
                    $(this).get(0).onchange = function(event) {
                        let parent = $(this).parents(".em_tagContainer[tagsFor]");
                        if (parent.length > 0) {
                            //if the parent is bound that they must be in the same container
                            //so it gets the parent of the tag container and searches for the searchbar
                            //then it triggers its' keyup event.
                            let container = parent.parent();
                            let searchbar = container.find(`.em_searchbar[data-id=${parent.attr("tagsFor")}]`);
                            searchbar.keyup();
                        }
                    };
                });
                //searchbar setup
                html.find(".em_searchbar").each(function() {
                    $(this).get(0).onkeyup = searchByTags;
                });
                //dropdown functionality
                html.find(".dropdown-btn").each(function() {
                    $(this).find(".dropdown-icon").contextmenu(function(event) {
                        event.preventDefault();
                        $(this).parents(".dropdown-btn").contextmenu(event);
                    });
                    $(this).get(0).oncontextmenu = toggleDropdown;
                });
                //bars setup and inital set data
                let valueBars = html.find(".em_barContainer");
                valueBars.change(renderBar);
                valueBars.change();
                // on modify fields save themselves
                html.find(".em_field").each(function() {
                    $(this).get(0).onchange = self._saveOwnedItemFields.bind(self);
                });
                html.find(".em_inline-field").each(function() {
                    $(this).get(0).onchange = self._saveActorFields.bind(self);
                });
            //#endregion
            //on ready functions
            html.ready(this._onStart.bind(this) );
            this.element.find("a.header-button.control.close").click( this._onClose.bind(this) );
            //we call the parent function
            super.activateListeners(html);
        }

    //#endregion
    //#region start method

        _onStart() {
            /** empty for now
             * 
             */
        }

        _getSheetFuncs() {
            /** called in getData returns an object with all the function callable from the ActorSheet by using the fetch handlebar
             *  @returns {Object} : returns a dictionary key : function 
             */
            return {
                inventory : this.getInventoryItems,
                inventoryTags : this.getInventoryItemsTags
            };
        }


    //#endregion
    //#region event methods

        async _onClose(event) {}



    //#endregion
    //#region event methods

        getActorData() {
            return this.getData().actor.system;
        }

        _getActorAdditionalSaveData() {
            /** returns a json object with all the data to add when saving the actor data
             * @returns {object} : returns a json to merge, it includes the must have data to save everytime the actor is saved
             */
            return {
                system : {
                    flipbook : this.getActorData().flipbook
                }
            }
        }

        async renderItem(id) {
            /** renders an item that exists in a collection by calling it's sheet.render method
             *  @param {string} id : the Foundry id of the item
             */
            try {
                let item = await Item.get(id);
                item.sheet.render(true);
            }
            catch(error) {console.error(error.message)};
        }

        async renderOwnedItem(id) {
            /** creates a new item sheet then opens it and when closed will destroy it
             * @param {string} id : the id of the owned item to fetch and display
             */
            let item = this.getOwnedItem(id);
            if (item == undefined) {return false;}
            //we create the rendered item
            let renderedItem = await Item.create({
                "name" : item.name,
                "type" : item.type
            });
            //we pass the data to the owned item
            await renderedItem.update({
                system : item.system
            });
            //we render the created itemsheet
            await renderedItem.sheet.render(true);
            //we have to wait for a bit for the itemSheet to be created
            setTimeout(function() {
                let element = $(`div[id$=${renderedItem.id}]`);
                //on close it deletes the itemSheet created
                let closeBtn = element.find("a.header-button.control.close");
                closeBtn.click( async function() {
                    await renderedItem.delete();
                });
            }, 50);
        }

    //#endregion
    //#region data and inventory methods

        async _saveActorData(data) {
            /** saves the actor data and adds the must save data too
             * @param {object} data : the actor data to save in the form of a json object
             * 
             * @returns {boolean} : wether the save has succeeded or not
             */
            try {
                console.warn("starting to save data", data);
                //adds the must save data to the save data non destructively
                overwriteObjectFields(data, this._getActorAdditionalSaveData() );
                console.warn("saving data" , data);
                await this.actor.update(data);
                return true;
            }
            catch(error) {
                console.error(error.message);
                return false;
            }
            
        }

        async _updateActorField(field,value) {
            /** fetches and updates an owned item field with the given value
             * @param {string} itemId : the Foundry ID of the item to fetch
             * @param {string} field : the name of the field to modify
             * @param {wildcard} value : the value to use to update the field
            */
            try {
                //we transform the field into an object of objects for saving
                let toSave = fieldToObject(field, value);
                //we add the flipbook to save the current page
                toSave[flipbook] = this.getActorData().flipbook; 
                //we remove the header since it's useless
                if (toSave["actor"] != undefined) {toSave = toSave["actor"];}
                await this._saveActorData(toSave);
                return true;
            }
            catch(error) {
                console.error(error.message);
                return false;
            }
        }

        async _updateActorCollection(field, value, method = 'add') {
            /** fetches a collection from the action fields and depending on the method passed either adds or removes the value given
             * @param {string} field : the path name of the field separated by '.'
             * @param {wildcard} value : the value to either remove or add 
             * @param {enum(string)} method : either 'add' or 'remove'.
             * 
             * @returns {boolean} : wether the element was successfuly added or removed 
             */
            try {
                //we fetch the field
                let collection = getValueFromFields(this.getData() , field);
                if (!Array.isArray(collection) ) {return false;}
                //checks the method, in case nothing happened then it exists the function
                switch(method.toLowerCase() ) {
                    case 'add' : {
                        collection.push(value); 
                        break;
                    }
                    case 'remove' : {
                        if( Array.remove(collection, (x) => {x === value;}) === undefined) {return false;}
                        break; //otherwise everything is fine and we leave the switch
                    }
                    default : {return false;}
                }
                //finally we call the update actor field
                return await this._updateActorField(field, collection);
            }
            catch(error) {
                console.error(error.message);
                return false;
            }
        }

            //#region inventory methods
                    _getAllOwnedItems() {
                        return this.actor.items;
                    }
        
                    getInventoryItems(...params) {
                        /** returns a collection of all the visible inventory items
                         *  @param {Array} params : needs to be there to be used by the fetch function
                         * 
                         *  @returns {Array} : returns an array of all the visible inventory items
                         */
                        return this.getOwnedItems({tags : ["visible"]});
                    }
        
                    getInventoryItemsTags(...params) {
                        /** returns a collection of all the unique tags of the inventory items
                         *  @param {Array} params : needs to be there to be used by the fetch function
                         * 
                         *  @returns {Set} : returns the set of all unique tags of the inventory items
                         */
                        let tags = new Set();
                        //we only get the visible items
                        let items = this.getInventoryItems();
                        //we use a Set to only get the unique instances of the tags
                        for (let item of items) {
                            for (let tag of item.tags) { tags.add(tag); }
                        }
                        return tags;
                    }
        
                    getOwnedItems({tags = [], Ids = []}) {
                        let results = [];
                        let itemData = undefined;
                        if (tags.length + Ids.length == 0) {return results;}
                        tags = new Set(tags);
                        Ids = new Set(Ids);
                        for (let item of this._getAllOwnedItems() ) {
                            itemData = item.system;
                            if ( itemData.tags.filter(x => tags.has(x) )
                                || Ids.has(item._id)
                                )
                            {
                                results.push(item);
                            }
                        }
                        return results;
                    }
        
                    getOwnedItem(itemId) {
                        return this.actor.items.get(itemId);
                    }
        
                    getIndexOfOwnedItem(itemId) {
                        let item = undefined;
                        let ownedItems = this._getAllOwnedItems();
                        for (let i = 0;i < ownedItems.length;i++) {
                            item = ownedItems[i];
                            if (item._id == itemId) {return i;} 
                        }
                        return -1;
                    }
        
                    addOwnedItem(item) {
                        //should be deprecated since we use the Item.create method instead
                        let ownedItems = this._getAllOwnedItems();
                        ownedItems.push(item);
                        return ownedItems.length - 1;
                    }
        
                    async removeOwnedItem(itemId) {
                        /** removes an item from the Items collection
                         *  @param {string} itemId : the Foundry ID of the item
                         * 
                         *  @returns {boolean} : wether the element was removed or not.
                         */
                        try {
                            //we delete the item in the items collection
                            await this.getOwnedItem(itemId).delete();
                            return true;
                        }
                        catch(error) {
                            console.error(error.message); 
                            return false;
                        }
                    }
        
                    async createOwnedItem(name, type, itemData = {}) {
                        /** creates an item as an owned item
                         *  @param {object} itemData : a data object that must contain name and type and may contain a data value
                         * 
                         *  @returns {Item} : returns the created item.
                         */
                        try {
                            let item = await Item.create({
                                'name' : name,
                                'type' : type
                            }, {parent : this.actor});
                            if (itemData != {}) {await item.update(itemData);}
                            return item;
                        }
                        catch(error) {
                            console.error(error.message);
                            return undefined;
                        }
                    }
        
                    async updateOwnedItem(itemId, field, value) {
                        /** fetches and updates an owned item field with the given value
                         * @param {string} itemId : the Foundry ID of the item to fetch
                         * @param {string} field : the name of the field to modify
                         * @param {wildcard} value : the value to use to update the field
                         */
                        console.log("updating owned item ",itemId, field, value);
                        let item = this.getOwnedItem(itemId);
                        if (item !== undefined) {
                            try {
                                //we transform the field into an object of objects for saving
                                let toSave = fieldToObject(field, value);
                                if (toSave["item"] != undefined) {toSave = toSave["item"];}
                                await item.update(toSave);
                                return true;
                            }
                            catch(error) {
                                console.error(error.message);
                                return false;
                            }
                        }
                        return false; 
                    }
        
                    async updateOwnedItemFields(itemId, fields) {
                        /** fetches and updates an owned item fields with the given values | may be a destructive operation
                         * @param {string} itemId : the Foundry ID of the owned item to fetch
                         * @param {Dictionary(string : wildcard)} fields : A dictionary of field names : values to set
                         */
                        let item = this.getOwnedItem(itemId);
                        if (item == undefined) {return false;}
                        try {
                            //we update / set all the values
                            for (let key of Object.keys(fields) ) {item.system[key] = fields[key];}
                            await item.update({
                                'system' : fields //since it's already a dictionary key : value we just pass it
                            });
                        }
                        catch(error) {
                            console.error(error.message);
                            return false;
                        }
                        
                    }
    
            //#endregion
    
    //#endregion
    //#region info

        //#region event methods

            async _htmlRemoveActorTag(event) {
                //gets the tag name from the dataset
                let element = event.currentTarget;
                await this._updateActorCollection( 
                    $(element).attr("name"), element.dataset.name, 'remove'
                );
            }
            
            async _htmlAddActorTag(event) {
                //tied to an add icon, it fetches the input in the same container and gets the data
                let element = $(event.currentTarget);
                let input = element.parent().find("#em_addTagBtn");
                //now we add the value
                await this._updateActorCollection(input.attr("name"), input.val(), 'add');
            }

        //#endregion

    //#endregion
}