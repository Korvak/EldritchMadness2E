import {test, normalize, normalizeToRange, treeBreadthSearch} from "../utils.js"
import {toggleDropdown, toggleReadonly, onBarValueChange} from "../htmlUtils.js"

export default class EmBaseActorSheet extends ActorSheet {

    //#region base methods

    constructor(...args) {
        super(...args);
        //we set some data for ourselves
        console.log("actor", this.getData() );
        console.log("actorItems", this.getData().items);
        if(this.anatomyLength() < 1) {this._createDefaultAnatomy();}
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
        return `systems/EldritchMadness/templates/sheets/actors/${this.actor.type}-sheet.hbs`;
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
            }
        });
        flipbook.on("turned", function(event,page,view) {
            $(this).prop("controlled", false);
            /* we will instead do html events that are always bound
            self._pagesActivationBinding(html);
            */
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
        //set in the partial itself since it lost the event 
        //#endregion
        //#region html events
            //#region base events
            html.find(".em_readonlyIcon").each(function() {
                $(this).get(0).onclick = toggleReadonly;
            });
            html.find(".dropdown-btn").each(function() {
                $(this).find(".dropdown-icon").click(function(event) {
                    event.preventDefault();
                    $(this).parents(".dropdown-btn").click();
                });
                $(this).get(0).onclick = toggleDropdown;
            });
            html.find(".em_barValue").change(onBarValueChange);
            //#endregion
            //#region anatomy page events
            $(".em_anatomyNode").contextmenu(this._displayBodypartHtml.bind(this));
            //#endregion
            $("#em_bodypart_id").click(this._renderBodypartHtml.bind(this));
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
        let navbar = html.find(".em_actor_navbar");
        navbar.css("visibility","hidden");
        //we turn the first page
        setTimeout(() => { this._onStopDrag(); }, 50);
        setTimeout(() => { flipbook.turn('next'); },500);
        setTimeout(() => {navbar.css("visibility","visible");} , 750);
        //we set the default data if needs loading
        //if(this.anatomyLength() < 1) {await this._createDefaultAnatomy();}
        if (this.getbodyRoot() !== undefined) {this._displayBodypart(this.getbodyRoot().id);}
    }


    async _createDefaultAnatomy() {
        //we do it like this in case we want to modify things etc...
        await this.addAnatomy({
            name : "root",
            attachedTo : undefined, 
            partType : "torso"
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

    //#endregion
    //#endregion
    //#region helper methods

    getActorData() {
        return this.getData().actor.system;
    }


    //#region inventory methods
    _getAllOwnedItems() {
        return this.getData().items;
    }

    getOwnedItems({tags : [], Ids : []}) {
        let results = [];
        let itemData = undefined;
        if (tags.length + Ids.length == 0) {return results;}
        tags = new Set(tags);
        Ids = new Set(Ids);
        for (let item of this._getAllOwnedItems() ) {
            itemData = item.getData().system;
            if ( itemData.tags.filter(x => tags.has(x) )
                  || Ids.has(item.id) 
                ) 
            {
                results.push(item);
            }
        }
        return results;
    }

    getOwnedItem(itemId) {
        for (let item of this._getAllOwnedItems() ) {
            if (item.id == itemId) {return item;}
        }
        return undefined;
    } 

    addOwnedItem(item) {
        let ownedItems = this._getAllOwnedItems();
        ownedItems.push(item);
        return ownedItems.length - 1;
    }

    removeOwnedItem(itemId) {
        let item = null;
        let ownedItems = this._getAllOwnedItems();
        for (let i = 0; i < ownedItems.length;i++) {
            item = ownedItems[i];
            if (item.id == itemId) {
                ownedItems.splice(i, 1);
                return i;
            }
        }
        return -1;
    }

    async createOwnedItem(itemData) {
        try {
            let item = await Item.create(itemData);
            return this.addOwnedItem(item);
        }
        catch(error) {
            console.error(error.message);
            return -1;
        }
    }
    //#endregion


    //#endregion

    //#region anatomy
    getAnatomy() {
        return this.getActorData().anatomy;
    }

    anatomyLength() {return Object.keys(this.getAnatomy().parts).length;}

    getbodyRoot() {
        let anatomy = this.getAnatomy();
        switch(anatomy.viewType) {
            case "tree" : {
                return this.getBodypart(anatomy.tree.id);
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
        let anatomy = this.getAnatomy();
        let bodypart = await Item.create({
            "name" : name,
            "type" : "bodypart",
        });
        let bodypartData = bodypart.system;
        //sets the data
        console.log(bodypart.id);
        bodypartData.partType = partType;
        bodypartData.attachedTo = attachedTo;
        //then we add it to the view types
        if (typeof attachedTo === "string") {
            let parent = treeBreadthSearch(anatomy.tree, "id", attachedTo);
            parent.children.push({ //we create a new TreeNode item and add it to the parent
                id : bodypart.id,
                children : []
            });
        }
        else if (this.anatomyLength() < 1) { //if it's the first element, then we allow it to be detached.
            anatomy.tree["id"] = bodypart.id;
            anatomy.tree["name"] = name;
            anatomy.tree["children"] = [];
        }
        //then we add it to the actor anatomy
        anatomy.parts[bodypart.id] = bodypart;
        //we trigger a re-render
        await this.render(true);
        //finally we return the element data
        return bodypart;
    }


    getBodypart(id) {
        //returns the item object of bodypart type of the corresponding ID
        return this.getActorData().anatomy.parts[id];
    }

    _displayBodypartHtml(event) {
        //displays a bodypart in the actorSheet by fetching the bodypart id from the dataset
        let element = $(event.target);
        let id = element.get(0).dataset.id;
        this._displayBodypart(id);
    }

    _displayBodypart(id) {
        /** visually loads the bodypart if the data exists
         * 
         * @param {string} id : the id of the bodypart item contained in the anatomy.parts collection
         * 
         * @returns {boolean} : wether the data was found or not
         */
        try {
            //first we fetch the data
            let element = undefined;
            let bodypart = this.getBodypart(id); //this is the Item Sheet
            let bodypartData = bodypart.system; //this is the data in system
            if (bodypart === undefined || bodypart === null || bodypartData === undefined || bodypartData === null) {return false;}
            //Set the id
            //#region header
            element = this.element.find("#em_bodypart_id");
            if (element.length > 0) {
                element.text(id);
                element.get(0).dataset.id = id;
            }
            element = this.element.find("#em_bodypart_createBtn");
            if (element.length > 0) {
                element.get(0).dataset.id = id;
            }
            //#endregion
            //#region data fields
            this.element.find("#em_bodypart_name").val(bodypart.name);
            this.element.find("#em_bodypart_type").val(bodypartData.partType);
            this.element.find("#em_bodypart_attached").val(bodypartData.attachedTo);
            //set health
            element = this.element.find("#em_bodypart_hp");
            let dur = bodypartData.durability;
            element.val(normalize(dur.value, dur.min, dur.max) );
            element.change();
            //#endregion
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

    _renderBodypartHtml(event) {
        let element = event.target;
        this._renderBodypart(element.dataset.id);
    }

    _renderBodypart(id) {
        let bodypart = this.getBodypart(id);
        bodypart.sheet.render(true);
    }

    //#endregion


}