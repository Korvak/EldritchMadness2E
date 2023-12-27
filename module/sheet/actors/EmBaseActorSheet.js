import {treeBreadthSearch, fieldToObject, overwriteObjectFields, getValueFromFields} from "../../../utils.js"
import {
    toggleDropdown, setInputsFromData, selectOptionsFromData, toggleReadonly, 
    renderBar, setBarValue, searchByTags , toggleBtnState 
} from "../../../htmlUtils.js"
import {translate} from "../../../emCore.js"


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
            //#region html events
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