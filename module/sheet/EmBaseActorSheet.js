export default class EmBaseActorSheet extends ActorSheet {

    //#region base methods

    constructor(...args) {
        super(...args);
        //we set some data for ourselves
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
        console.log("actor",data);
        console.log("actorItems", data.items);
        data.CONFIG = CONFIG;
        return data;
    }


    activateListeners(html) {
        /** super important !!! where we bind all the events that are not in the flipbook
         * 
         */
        //html.find(".changeFirst").click(this._changeFirst.bind(this));
        let htmlContainer = html.parent().parent();
        const self = this;
        let onready = function() {this._onStart(htmlContainer);};
        html.ready(onready.bind(this) );

        //#region flipbook events
        let flipbook = html.find("#flipbook");
        let onStopDrag = function() {this._onStopDrag(html);};
        //bind the resize event
        htmlContainer.find(".window-resizable-handle").on("click.stopDrag", onStopDrag.bind(this));
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
        html.find(".em_actor_navbar .em_actor_tabBtn").click(function(event) {
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
        
        super.activateListeners(html);
    }

    //#endregion
    //#region start method

    _onStart(html) {
        let htmlContainer = html.parent().parent();
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
        setTimeout(() => { htmlContainer.find(".window-resizable-handle").click(); }, 50);
        setTimeout(() => { flipbook.turn('next'); },500);
        setTimeout(() => {navbar.css("visibility","visible");} , 750);
    }

    _pagesActivationBinding(html) {
        //instead of doing it in the activateListeners, we have to call this each time a page is turned
        //in case the event listeners get unbounded.
    }

    //#region event methods

    _onStopDrag(html) {
        try {
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
    async _createAnatomy() {
        console.log("creating anatomy of", this.actor.type);
        let data = this.getActorData();
        let anatomy = data.anatomy;
        if (anatomy == undefined || anatomy.length == 0) { //in case there is no anatomy or it's empty
            //we read the anatomy from the config and if absent, it will use the default one
            let configAnatomy = CONFIG.EmConfig.anatomy[this.actor.type];
            anatomy = configAnatomy != undefined ? configAnatomy : CONFIG.EmConfig.anatomy.default;
        }
        console.log(`set anatomy of ${this.actor.id} of class ${this.actor.type} to :`,anatomy);
    }

    getAnatomy() {
        return this.getActorData().anatomy;
    }

    async addAnatomy({name ,attachedTo, partType }) {
        let bodypart = await Item.create({
            "name" : name,
            "type" : "bodypart",
        });
        let bodypartData = bodypart.getItemData();
        bodypartData.partType = partType;
        bodypartData.attachedTo = attachedTo;
        //now we add it to the items

        //then we add it to the actor anatomy
        
    }

    //#endregion


}