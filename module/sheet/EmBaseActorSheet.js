import {translate, treeBreadthSearch, fieldToObject, overwiteObjectFields, setInputsFromData, getValueFromFields} from "../utils.js"
import {toggleDropdown, toggleReadonly, renderBar, setBarValue, searchByTags } from "../htmlUtils.js"

export default class EmBaseActorSheet extends ActorSheet {

    //#region base methods

    constructor(...args) {
        super(...args);
        //we set some data for ourselves
        console.log("constructor args",args);
        console.log("actor", this.getData() );
        console.log("actorItems", this.getData().items);
        //allows calling async function and almost everything works out
        if(this.bodypartsCount() < 1) {this._createDefaultAnatomy();}
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, 
            {
                width: 530,
                height : 450,
                classes : ["em_actorSheet"]
        });
    }

    get template() {
        console.log("actor", this.getData() );
        console.log("actorItems", this.getData().items);
        return `systems/EldritchMadness/templates/sheets/actors/baseActor-sheet.hbs`;
    }

    getTemplates(templateName) {
        switch(templateName) {
            case "bodypart" : {return "systems/EldritchMadness/templates/sheets/items/bodypart-sheet.hbs";}
            default : {return "";}
        }
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
                html.find(".em_searchbar").each(function() {
                    $(this).get(0).onkeyup = searchByTags;
                });
                //dropdown functionality
                html.find(".dropdown-btn").each(function() {
                    $(this).find(".dropdown-icon").contextmenu(function(event) {
                        event.preventDefault();
                        $(this).parents(".dropdown-btn").contextmenu();
                    });
                    $(this).get(0).oncontextmenu = toggleDropdown;
                });
                //bars setup and inital set data
                let valueBars = html.find(".em_barContainer");
                valueBars.change(renderBar);
                valueBars.change();
                // on modify fields save themselves
                html.find(".em_field").change(this._saveOwnedItemFields.bind(this));
                html.find(".em_inline-field").change(this._saveActorFields.bind(this));
            //#endregion
            //#region info page events
                
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
            //#endregion
        //#endregion
        html.ready(this._onStart.bind(this) );

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
                peel : false
            });
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

            _setActiveFlipbbookPage(page) {
                try {
                    page = parseInt(page);
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

            _getPageContent(page) {
                return this.element.find(`form #flipbook .em_page[data-page=${page}]`);
            }

        //#endregion
    //#endregion
    //#region event methods 

        async _saveOwnedItemFields(event) {
            event.preventDefault();
            let element = $(event.currentTarget);
            let container = element.parents(".em_itemContainer");
            let id = container.find(".em_itemIdContainer").get(0).dataset.id;
            await this.updateOwnedItem(id, element.attr('name'), element.val() );
        }

        async _saveActorFields(event) {
            /** fetches the data from the called element and calls this._updateActorField to update the actor
            */
            event.preventDefault();
            let element = $(event.currentTarget);
            await this._updateActorField(element.attr('name'), element.val() );
        }

    //#endregion
    
    //#region helper methods

        getActorData() {
            return this.getData().actor.system;
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
                //we remove the header since it's useless
                if (toSave["actor"] != undefined) {toSave = toSave["actor"];}
                await this.actor.update(toSave);
                return true;
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
             * 
             */
            let item = this.getOwnedItem(id);
            if (item == undefined) {return false;}
            let renderedItem = await Item.create({
                "name" : item.name,
                "type" : item.type
            });
            await renderedItem.sheet.render(true);
            //we have to wait for a bit for the itemSheet to be created
            setTimeout(function() {
                let element = $(`div[id$=${renderedItem.id}]`);
                let closeBtn = element.find(".header-button.control.close");
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

            removeOwnedItem(itemId) {
                let index = this.getIndexOfOwnedItem(itemId);
                try {
                    this._getAllOwnedItems().splice(index,1);
                    //we should save here?
                    console.warn("maybe you should save the items when removing an owned item?")
                    return index;
                }
                catch(error) {console.error(error.message); return -1;}
            }

            async createOwnedItem(itemData) {
                try {
                    await Item.create(itemData, {parent : this.actor});
                    return this._getAllOwnedItems().length - 1;
                }
                catch(error) {
                    console.error(error.message);
                    return -1;
                }
            }

            async updateOwnedItem(itemId, field, value) {
                /** fetches and updates an owned item field with the given value
                 * @param {string} itemId : the Foundry ID of the item to fetch
                 * @param {string} field : the name of the field to modify
                 * @param {wildcard} value : the value to use to update the field
                 */
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
                /**
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
                console.log("start change tree node name");
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
                await this.actor.update({
                    data : {
                        anatomy : {
                            tree : this.getAnatomy().tree
                        },
                        flipbook : this.getActorData().flipbook
                    }
                });
            }

        //#endregion

        getAnatomy() {
            return this.getActorData().anatomy;
        }

        bodypartsCount() {return Object.keys(this.getBodyparts() ).length;}

        getBodyparts() {
            return this.getOwnedItems({tags : ["bodypart"]});
        }

        getbodyRoot() {
            let anatomy = this.getAnatomy();
            switch(anatomy.viewType) {
                case "tree" : {
                    return this.getOwnedItem(anatomy.tree.id);
                }
                case "chart" : {return undefined;}
                default : {return undefined;}
            }
        }

        async addAnatomy({name ,attachedTo, partType, extraData = {} }) {
            /**
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
            let bodypart = await Item.create({
                "name" : name,
                "type" : "bodypart",
                },
                {parent : this.actor} //this adds it to the actor items instead of the item global collection
            );
            let bodypartData = bodypart.system;
            //sets the data
            bodypartData.partType = partType;
            bodypartData.attachedTo = attachedTo;
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
            //we trigger a re-render
            await this.actor.update({
                data : { //data is the same as calling system
                    anatomy : anatomy,
                    flipbook : this.getActorData().flipbook
                }
            });
            //if we don't call the update, it won't change the values
            await bodypart.update({
                'system' : {
                    'partType' : partType,
                    'attachedTo' : attachedTo
                }
            });
            //finally we return the element data
            return bodypart;
        }

        async _deleteAnatomyNode(node) {
            //deletes an anatomy tree node references in the parts collection along with all its children
            await this.getOwnedItem(node.id).delete(); //we delete the item in the items collection
            let nodeElement = this.element.find(`#${node.id}`);
            nodeElement.remove();
            for (let child of node.children) {
                await this._deleteAnatomyNode(child);
            }
        }

        async deleteAnatomy(id) {
            try {
                let bodypart = this.getOwnedItem(id);
                if (bodypart === undefined) {return false;}
                let bodypartData = bodypart.system;
                let anatomy = this.getAnatomy();
                if (id === anatomy.tree.id) {
                    console.error("cannot delete the anatomy root.");
                    return;
                }
                let element = undefined;
                //we check if it's attached to a parent or is the root
                if (bodypartData.attachedTo === undefined || bodypartData.attachedTo === null) {
                    element = treeBreadthSearch(anatomy.tree, "id" , bodypart._id);
                }
                else {
                    //first we remove it in the tree by removing it from the parent
                    let parent = treeBreadthSearch(anatomy.tree, "id", bodypartData.attachedTo);
                    console.log(parent, id);
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
                await this.actor.update({
                    data : {
                        anatomy : anatomy,
                        //since saving triggers a reopening of the book, we save this
                        flipbook : this.getActorData().flipbook 
                    }
                });
                
            }
            catch(error) {console.error(error.message);}
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
                setInputsFromData(data, element );
                //we set the attachedTo to the node name instead, if it's not the root
                if (typeof bodypart.system.attachedTo == "string" 
                        && game.user.role < 3 //4 is GM, 3 is Assistant GM
                ) 
                {
                    let item = this.getOwnedItem(bodypart.system.attachedTo);
                    html.find("#em_bodypart_attached").val(item.name);
                }
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