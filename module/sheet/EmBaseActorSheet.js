export default class EmBaseActorSheet extends ActorSheet {

    //#region base methods

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
        //html.find(".changeFirst").click(this._changeFirst.bind(this));
        let htmlContainer = html.parent().parent();
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
            stopFlipbookTurning(event,flipbook, pageObject.next);
            let forbidden = corner=='tl' || corner=='tr';
            if (forbidden) { //we only allow bottom page turning
                event.preventDefault();
            }
            flipbook.prop("forbiddenTurn", forbidden);
        });
        //turning is for stopping the actual page change
        flipbook.on("turning", function(event, page, view) {
            stopFlipbookTurning(event,flipbook, page);
            if (flipbook.prop("forbiddenTurn") == true) {event.preventDefault();}
        });
        //#endregion


        super.activateListeners(html);
    }

    //#endregion
    //#region start method

    _onStart(html) {
        let htmlContainer = html.parent().parent();
        //first we start turn.js
        let flipbook = html.find("#flipbook");
        flipbook.turn({
            width: html.width() - CONFIG.EmConfig.flipbook.wMargin,
            height: html.height() - CONFIG.EmConfig.flipbook.hMargin,
            autoCenter: true,
            display : "double"
        });
        //we turn the first page
        setTimeout(() => { htmlContainer.find(".window-resizable-handle").click(); }, 50);
        setTimeout(() => { flipbook.turn('next'); },500);
        
        
    }
    //#region event methods

    _onStopDrag(html) {
        try {
            let flipbook = html.find("#flipbook");
            flipbook.turn("size", 
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

    getAllOwnedItems() {
        return this.getData().items;
    }

    getOwnedItems({tags : [], Ids : []}) {
        let results = [];
        let itemData = undefined;
        if (tags.length + Ids.length == 0) {return results;}
        tags = new Set(tags);
        Ids = new Set(Ids);
        for (let item of this.getAllOwnedItems() ) {
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
        for (let item of this.getAllOwnedItems() ) {
            if (item.id == itemId) {return item;}
        }
        return undefined;
    } 

    addOwnedItem(item) {
        let ownedItems = this.getAllOwnedItems();
        ownedItems.push(item);
        return ownedItems.length - 1;
    }

    removeOwnedItem(itemId) {
        let item = null;
        let ownedItems = this.getAllOwnedItems();
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