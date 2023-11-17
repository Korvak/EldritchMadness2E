export default class EmBaseActorSheet extends ActorSheet {

    //#region start methods
    _startPageFlip() {
    }


    //#endregion

    //#region base methods
    constructor(...args) {
        super(...args);
        //#region call starter funcs
        this._createAnatomy();
        this._startPageFlip();
        //#endregion
        console.log(CONFIG.EmConfig.data);
    }


    get template() {
        return `systems/EldritchMadness/templates/sheets/actors/${this.actor.type}-sheet.hbs`;
    }

    getData() {
        let data = super.getData();
        //system holds all the data
        console.log("actor",data);
        console.log("actorItems", data.items);

        return data;
    }


    activateListeners(html) {
        //html.find(".changeFirst").click(this._changeFirst.bind(this));
        super.activateListeners(html);
    }

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