import {treeBreadthSearch, fieldToObject, overwriteObjectFields, getValueFromFields} from "../utils.js"
import {
    toggleDropdown, setInputsFromData, selectOptionsFromData, toggleReadonly, 
    renderBar, setBarValue, searchByTags , toggleBtnState 
} from "../htmlUtils.js"
import {translate} from "../emCore.js"


export default class EmBaseActorSheet extends ActorSheet {

    //#region base methods

    constructor(...args) {
        super(...args);
        //we set some data for ourselves
        console.log("constructor args",args);
        console.log("actor", this.getData() );
        console.log("actorItems", this.getData().items);
        //makes sure that the flipbook animation is always performed on open, even when starting the application
        this.getActorData().flipbook.anim = true;
        //allows calling async function and almost everything works out
        if(this.bodypartsCount() < 1) {this._createDefaultAnatomy();}
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, 
            {
                width: 582,
                height : 476,
                classes : ["em_actorSheet"]
        });
    }

    get template() {
        console.log("actor", this.getData() );
        console.log("actorItems", this.getData().items);
        return `systems/EM2E/templates/sheets/actors/baseActor-sheet.hbs`;
    }

    getData() {
        let data = super.getData();
        //system holds all the data
        data.CONFIG = CONFIG;
        return data;
    }

    activateListeners(html) {
        /** super important !!! where we bind all the events that are not in the flipbook
         * 
         */
        const self = this;
        //#region flipbook events
        let flipbook = html.find("#flipbook");
        //bind the resize event
        this.element.find(".window-resizable-handle").on(
            "click.stopDrag", this._onStopDrag.bind(this)
        );
        //stop the first and last page turning
        let stopFlipbookTurning = function(event,flipbook,page) {
            if (page == 1 || page == flipbook.turn("pages") ) {event.preventDefault();}
        }
        //event binding
        //start is for stopping the animation
        flipbook.on("start", function(event, pageObject, corner) {
            if (!$(this).prop("controlled")) {
                let options = self.getActorData().options;
                stopFlipbookTurning(event,$(this), pageObject.next);
                let forbidden = (corner=='tl' || corner=='tr' || !options.turning );
                if (forbidden || !options.peel ) { //we only allow bottom page turning
                    event.preventDefault();
                }
                $(this).prop("forbiddenTurn", forbidden);
            }
        });
        //turning is for stopping the actual page change
        flipbook.on("turning", function(event, page, view) {
            if (!$(this).prop("controlled")) {
                stopFlipbookTurning(event,$(this), page);
                if ($(this).prop("forbiddenTurn") == true) {event.preventDefault();}
                else if (page != 1 && page != $(this).turn("pages") ) {
                    self._setActiveFlipbbookPage(page);
                }
            }
        });
        flipbook.on("turned", function(event,page,view) {
            $(this).prop("controlled", false);
            if (page != 1 && page != $(this).turn("pages") ) {
                self._setActiveFlipbbookPage(page);
            }
        });

        //tab navigation
        html.find(".em_navbar .em_tabBtn").click(function(event) {
            try {
                event.preventDefault();
                let element = $(this);
                let page = this.dataset.page;
                //const flipbook = element.parents("#flipbook");
                if (page !== flipbook.turn('page') ) {
                    //we disable the old one
                    let oldSelected = element.parent().find('.em_tabBtn[current="true"]');
                    oldSelected.attr("current", "false");
                    //we set it as active
                    element.attr("current", "true");
                    //we turn the page
                    flipbook.prop("controlled", true);
                    flipbook.turn('page', page);
                }
            }
            catch(error) {
                console.error(error.message);
            }
        });

        //#endregion
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
            //#region info page events
                html.find(".em_tagIcon").each(function() {
                    $(this).get(0).onclick = self._htmlRemoveActorTag.bind(self);
                });
                html.find("#em_addTagIconBtn").click( this._htmlAddActorTag.bind(this) );
            //#endregion
            //#region anatomy page events
                html.find(".em_anatomyNode").click(this._displayBodypartHtml.bind(this));
                html.find(".em_anatomyDeleteIcon").click(this._deleteAnatomyHtml.bind(this));
                //$(".em_anatomyDeleteIcon").click(this._deleteAnatomyHtml.bind(this));
            //#endregion
            //#region bodypart events
                html.find("#em_bodypart_id").click(this._renderBodypartHtml.bind(this));
                let createNewBodypart = async function(event) {await this._addAndDisplayAnatomy(event);};
                html.find("#em_bodypart_createBtn").click(createNewBodypart.bind(this) );
                //we set it so that if we change the name of the bodypart, it also changes the name of the tree
                html.find("#em_bodypart_name").change(this._changeBodypartName.bind(this) );
                //we call the reparent function when the attachedTo changes
                html.find("#em_bodypart_attached").get(0).onchange =  this._reparentBodypart.bind(this);
            //#endregion
        //#endregion
        html.ready(this._onStart.bind(this) );
        this.element.find("a.header-button.control.close").click( this._onClose.bind(this) );

        super.activateListeners(html);
    }

    //#endregion
    //#region start method

        _onStart() {
            let html = this.element.find("form");
            //first we start turn.js
            let flipbook = html.find("#flipbook");
            flipbook.prop("controlled", false);
            flipbook.turn({
                width: html.width() - CONFIG.EmConfig.flipbook.wMargin,
                height: html.height() - CONFIG.EmConfig.flipbook.hMargin,
                autoCenter: true,
                display : "double",
                peel : false,
                page : this.getActorData().flipbook.anim ? 1 : this.getActorData().flipbook.currentPage
            });
            console.warn("current page",this.getActorData().flipbook.currentPage);
            //#region flipbook start animation
                if ( this.getActorData().flipbook.anim ) {
                    //we hide the navbar because it's floating
                    let navbar = html.find(".em_navbar");
                    let bgElement = this.element.find(".window-content");
                    let oldBg = bgElement.css("background-image");
                    navbar.css("visibility","hidden");
                    bgElement.css("background-image", "none");
                    //we turn the first page
                    setTimeout(() => { this._onStopDrag(); }, 50);
                    let page = this.getActorData().flipbook.currentPage;
                    
                    setTimeout(() => { flipbook.turn('page', page); },500);
                    setTimeout(() => {
                        navbar.css("visibility","visible");
                        bgElement.css("background-image", oldBg);
                    } , 850);
                    //is set to false after performing the animation once, so that in case of re-render it doesn't do it again
                    this.getActorData().flipbook.anim = false;
                }
            //#endregion


            //we set the default data if needs loading
            this._displayBodypart(this.getAnatomy().tree.id);
        }


        async _createDefaultAnatomy() {
            //we do it like this in case we want to modify things etc...
            await this.addAnatomy({
                name : "root",
                attachedTo : undefined, 
                partType : CONFIG.EmConfig.anatomy.ROOT_PART_TYPE
            });
        }

        async _bindOrCreateCoins() {

        }

        //#region event methods

            _onStopDrag() {
                try {
                    let html = this.element.find("form");
                    let flipbook = html.find("#flipbook");
                    flipbook.turn('size', 
                        html.width() - CONFIG.EmConfig.flipbook.wMargin,
                        html.height() - CONFIG.EmConfig.flipbook.hMargin
                    );
                    flipbook.turn("resize");
                }
                catch(error) {console.error(error.message);}
            }

            _setActiveFlipbbookPage(page, move = false) {
                try {
                    page = parseInt(page);
                    if (move) {
                        let flipbook = this.element.find("form #flipbook");
                        if (page !== flipbook.turn('page') ) {
                            flipbook.prop("controlled", true);
                            flipbook.turn('page', page);
                        }
                    }
                    //if odd then it goes to the next page since our tab btns are only even
                    page = page % 2 == 0 ? page : page - 1;
                    this.getActorData().flipbook.currentPage = page;
                    let navbar = this.element.find("form .em_navbar");
                    navbar.find('.em_tabBtn[current="true"]').attr("current", "false");
                    navbar.find(`.em_tabBtn[data-page="${page}"]`).attr("current", "true"); 
                    return true;
                }
                catch(error) {
                    console.error(error.message);
                    return false;
                }              
            }

            async _bookmarkCurrentPage() {
                /** saves the page in case it's different from the last saved page
                 * 
                 */
                let flipbook = this.getActorData().flipbook;
                console.warn("bookmarking");
                if (flipbook.currentPage != flipbook.lastSavedPage) {
                    flipbook.lastSavedPage = flipbook.currentPage;
                    await this.actor.update({
                        system : {
                            flipbook : flipbook  
                        } 
                    });
                }
            }

            _getPageContent(page) {
                return this.element.find(`form #flipbook .em_page[data-page=${page}]`);
            }

        //#endregion
    //#endregion
    //#region event methods 

        async _onClose(event) {
            //makes it so that the flipbook performs the opening animation whenever closed and reopened
            this.getActorData().flipbook.anim = true;
            //since bookmark can save the data, we call bookmark after even though we don't need to save flipbook.anim
            await this._bookmarkCurrentPage();
        }

        async _saveOwnedItemFields(event) {
            /** fetches the data from the called element and calls this.updateOwnedItem to update the actor's item data */
            event.preventDefault();
            let element = $(event.currentTarget);
            let container = element.parents(".em_itemContainer");
            let id = container.find(".em_itemIdContainer").get(0).dataset.id;
            console.log(element.prop("tagName"));
            //if it's a select we instead get the selected's element data-save attribute
            let val = element.prop("tagName") == "SELECT" ? 
                element.find(":selected").get(0).dataset.tosave
                : element.val();
            await this.updateOwnedItem(id, element.attr('name'), val );
        }

        async _saveActorFields(event) {
            /** fetches the data from the called element and calls this._updateActorField to update the actor */
            event.preventDefault();
            let element = $(event.currentTarget);
            //if it's a select we instead get the selected's element data-save attribute
            let val = element.prop("tagName") == "SELECT" ? 
                element.find(":selected").get(0).dataset.tosave
                : element.val();
            await this._updateActorField(element.attr('name'), val );
        }

        async _removeActorCollectionFieldElement(event) {

        }

    //#endregion   
    //#region helper methods

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

        async renderItem(id) {
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



        //#region inventory methods
            _getAllOwnedItems() {
                return this.actor.items;
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
    //#region anatomy

        //#region event methods

            async _renderBodypartHtml(event) {
                let element = event.currentTarget;
                await this.renderOwnedItem(element.dataset.id);
            }   
            
            _displayBodypartHtml(event) {
                //displays a bodypart in the actorSheet by fetching the bodypart id from the dataset
                let element = $(event.currentTarget);
                let id = element.get(0).dataset.id;
                this._displayBodypart(id);
            }

            async _addAndDisplayAnatomy(event) {
                let element = $(event.currentTarget);
                let bodypart = await this.addAnatomy({
                    name : `${translate(CONFIG.EmConfig.anatomy.DEFAULT_NAME)}_${this.bodypartsCount()}`,
                    attachedTo : element.get(0).dataset.id,
                    partType : CONFIG.EmConfig.anatomy.DEFAULT_PART_TYPE
                });
                if (bodypart !== undefined) {this._displayBodypart(bodypart._id);}
            }

            async _deleteAnatomyHtml(event) {
                event.preventDefault();
                let element = $(event.currentTarget);
                await this.deleteAnatomy(element.parent().get(0).dataset.id);
            }

            async _changeBodypartName(event) {
                //first we get the input
                let element = this.element.find("#em_bodypart_name");
                //then we need the id of the bodypart
                let container = element.parents(".em_itemContainer");
                let id = container.find(".em_itemIdContainer").get(0).dataset.id;
                //then we get the anatomy node
                let node = treeBreadthSearch(this.getActorData().anatomy.tree, 'id', id);
                //we set the node name
                node.name = element.val();
                //then we save the data
                await this._saveActorData({
                    system : {
                       anatomy : {
                            tree : this.getAnatomy().tree
                        } 
                    }
                });
            }

            async _reparentBodypart(event) {
                event.preventDefault();
                let element = $(event.currentTarget);
                let container = element.parents(".em_itemContainer");
                let id = container.find(".em_itemIdContainer").get(0).dataset.id;
                let to = element.find(":selected").get(0).dataset.tosave;
                await this.reparentAnatomyNode(id, to);
            }


        //#endregion

        getAnatomy() {
            /** returns the actor anatomy object. */
            return this.getActorData().anatomy;
        }
   
        bodypartsCount() {
            /** returs the number of bodyparts belonging to the actor*/
            return Object.keys(this.getBodyparts() ).length;
        }

        getBodyparts() {
            /** returns a collection of all the bodypart items belonging to the actor*/
            return this.getOwnedItems({tags : ["bodypart"]});
        }

        getRoot() {
            /** returns the root of the anatomy based on the viewType selected.
             * @returns {string} : returns the id of the bodypart that is the root of the view type
            */
            let anatomy = this.getAnatomy();
            switch(anatomy.viewType) {
                case "tree" : { //we return the id of the tree root node
                    return this.getOwnedItem(anatomy.tree.id);
                }
                case "chart" : {return undefined;}
                default : {return undefined;}
            }
        }

        async addAnatomy({name ,attachedTo, partType, extraData = {} }) {
            /** creates a bodypart item and adds it to the actor items and creates it's corresponding node in the anatomy tree
             * @param {string} name : the name of the new bodypart
             * @param {ID} attachedTo : the string ID of the bodypart item it will be attached to
             * @param {partType} partType : the type of the part of the new bodypart
             * 
             * @returns {ItemSheet} : returns the bodypart itemSheet data.
             */
            if (attachedTo === undefined && this.bodypartsCount() > 0) {
                console.error( translate(CONFIG.EmConfig.ERRORS.MISSING_ANATOMY_PARENT_ERROR) );
                return undefined;
            }
            let anatomy = this.getAnatomy();
            //We create the bodypart and data to it
            let bodypart = await this.createOwnedItem(name, 'bodypart', 
            {
                'system' : {
                    'partType' : partType,
                    'attachedTo' : attachedTo
                }
            });
            //we get the data
            let bodypartData = bodypart.system;
            //then we add it to the view types
            if (typeof attachedTo === "string") {
                let parent = treeBreadthSearch(anatomy.tree, "id", bodypartData.attachedTo);
                parent.children.push({ //we create a new TreeNode item and add it to the parent
                    id : bodypart._id,
                    name : bodypart.name,
                    children : []
                });
            }
            //since we get it from the items and we create an item, then it must 2 if it's not the root
            else if (this.bodypartsCount() == 1) { //if it's the first element, then we allow it to be detached.
                anatomy.tree["id"] = bodypart._id;
                anatomy.tree["name"] = name;
                anatomy.tree["children"] = [];
            }
            //we save the anatomy
            await this._saveActorData({
                system : {
                    anatomy : anatomy
                }
            });
            
            //finally we return the element data
            return bodypart;
        }

        async _deleteAnatomyNode(node) {
            /** a recursive function that deletes an anatomy tree node references in the parts collection along with all its children
             * @param {AnatomyNode} node : an anatomy node with an Id and a children collection of Node objects.
             */
            //we delete the item in the items collection
            await this.removeOwnedItem(node.id);
            let nodeElement = this.element.find(`#${node.id}`);
            nodeElement.remove();
            for (let child of node.children) {
                await this._deleteAnatomyNode(child);
            }
        }

        async deleteAnatomy(id) {
            /** deletes an anatomy part by removing it and its children from the anatomy tree and by removing them from the actor.items
             * @param {string} id : a string representing the id of the anatomy node object.
             * 
             * @returns {boolean} : wether the operation succeeded or not
             */
            try {
                //first we check if we are allowed to do operations on it
                if (id === this.getRoot()._id) {
                    console.error("cannot delete the anatomy root.");
                    return false;
                }
                //then we fetch the bodypart and check if it exists
                let bodypart = this.getOwnedItem(id);
                if (bodypart === undefined) {return false;}
                let bodypartData = bodypart.system;
                let anatomy = this.getAnatomy();
                
                let element = undefined;
                //we check if it's attached to a parent or it's parentless
                if (bodypartData.attachedTo === undefined || bodypartData.attachedTo === null) {
                    element = treeBreadthSearch(anatomy.tree, "id" , bodypart._id);
                }
                else {
                    //first we remove it in the tree by removing it from the parent
                    let parent = treeBreadthSearch(anatomy.tree, "id", bodypartData.attachedTo);
                    //we remove the element from the parent's children
                    for (let i = 0;i < parent.children.length;i++) {
                        if (parent.children[i].id == bodypart._id) {
                            element = parent.children[i];
                            parent.children.splice(i,1);
                            break;
                        }
                    }
                }
                //we remove the element and it's children from the parts array
                await this._deleteAnatomyNode(element);
                //after we removed the bodyparts from the part collection, we update the anatomy tree

                //then we save everything
                await this._saveActorData({
                    system : {
                        anatomy : anatomy
                    }
                }); 
                return true;
            }
            catch(error) {
                console.error(error.message);
                return false;
            }
        }

        async reparentAnatomyNode(id, to) {
            /** reparents an existing node to another node in the anatomy tree
             * @param {string} id : the bodypart id to reparent
             * @param {string} to : the bodypart id of the new parent
             */
            try {
                //first we check if we are allowed to do operations on it
                if (id === this.getRoot() ) { //getRoot returns a string ID
                    console.error("cannot reparent the anatomy root.");
                    return false;
                }
                else if (id === to) {
                    console.error("cannot reparent a node to itself");
                    return false;
                }
                //first we fetch the bodypart from it's id
                let bodypart = this.getOwnedItem(id);
                if (bodypart === undefined) {return false;}
                //in case it's already attached to the parentTo then we are done
                if (bodypart.system.attachedTo == to) {return true;}
                //then check if the new parent exists
                let parentTo = this.getOwnedItem(to); //this is an item
                if (parentTo === undefined) {return false;}
                //then we get data we require
                let bodypartData = bodypart.system;
                let anatomy = this.getAnatomy();
                //now we must get the parent node and the parentToNode
                let parentNode = treeBreadthSearch(anatomy.tree, "id", bodypartData.attachedTo);
                let parentToNode = treeBreadthSearch(anatomy.tree, "id", parentTo._id);
                //we get the element and it's index
                let index = parentNode.children.findIndex(node => node.id == bodypart._id);
                if (index < 0 || index >= parentNode.children.length) {
                    //in case it didnt' find it, then it fails miserably
                    console.error(`cannot remove ${id} from the ${parentNode.id} node since it doesn't exist as it's child.`);
                    return false;
                }
                let element = parentNode.children[index]; //we need this since it's the node we want to add to the parentTo
                //now we check if we can reparent it since we cannot reparent a node to one of it's children
                if (treeBreadthSearch(element, "id", parentToNode.id) !== undefined ) {
                    console.error("cannot reparent a node to one of its children.");
                    return false;
                }
                //otherwise we remove the element from the parent
                parentNode.children.splice(index,1);
                //we reparent it
                parentToNode.children.push(element);
                //then we save the bodypart attached to
                bodypartData.attachedTo = to;
                bodypart.update({
                    data : {
                        attachedTo : to
                    }
                });
                //finally we save the actor data
                this._saveActorData({
                    system : {
                        anatomy : anatomy
                    }
                });
                return true;
            }
            catch(error) {
                console.error(error.message);
                return false;
            }
        }

        _displayBodypart(id) {
            /** visually loads the bodypart if the data exists
             * 
             * @param {string} id : the id of the bodypart item contained in the anatomy.parts collection
             * 
             * @returns {boolean} : wether the data was found or not
             */
            try {
                let element = undefined;
                let bodypart = this.getOwnedItem(id); //this is the Item Sheet
                if (bodypart === undefined || bodypart === null) {return false;}
                let data = {'item' : bodypart};
                let html = this.element.find("#em_bodypart_dataContainer");
                //#region header
                element = this.element.find("#em_bodypart_id");
                if (element.length > 0) {
                    element.text(id);
                    element.get(0).dataset.id = id;
                }
                element = this.element.find("#em_bodypart_createBtn");
                if (element.length > 0) {
                    element.get(0).dataset.id = id;
                    element.find("#em_bodypart_createIcon").get(0).dataset.id = id;
                }
                //#endregion
                //set the values
                element = html.find(".em_field");
                setInputsFromData(data, html.find("input.em_field") );
                selectOptionsFromData(data, html.find("select.em_field") );
                //we select the attachedTo part 
                let attachedSelect = html.find("#em_bodypart_attached");
                //we have to show all options or else it will end up hiding all options while scrolling
                attachedSelect.find("option").show(); 
                //we hide the bodypart's option
                attachedSelect.find(`#attach_${bodypart._id}`).hide();
                //attachedSelect.find(":selected").prop("selected", false); //we unselect the last selected if there is any
                //attachedSelect.find(`#attach_${bodypart.system.attachedTo}`).prop("selected", true);
                //set health | durability
                element = html.find("#em_item_durabilityBar");
                setBarValue( element,
                    {
                        'val' : bodypart.system.durability.value,
                        'max' : bodypart.system.durability.max
                    }, 
                    {
                        'val' : bodypart.system.durability.temp,
                        'max' : bodypart.system.durability.maxTemp
                    }
                );
                //stil uninplemented
                this._displayBodypartConditions(id);
                return true;
            }
            catch(error) {
                console.error(error.message); 
                return false;
            }
        }


        _displayBodypartConditions(id) {
            //fetches all the conditions related to the bodypart id
            //returns 
        }

    //#endregion


}