export default class EmBaseActorSheet extends ActorSheet {

    //#region base methods
    constructor(...args) {
        super(...args);
        //#region call starter funcs
        this._createAnatomy();
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

    getActorData() {
        return this.getData().actor.system;
    }

    activateListeners(html) {
        //html.find(".changeFirst").click(this._changeFirst.bind(this));
        super.activateListeners(html);
    }

    //#endregion

    //#region anatomy
    _createAnatomy() {
        console.log("creating anatomy of", this.actor.type);
        let data = this.getActorData();
        let anatomy = data.anatomy;
        if (anatomy == undefined && CONFIG.EmConfig.anatomy[this.actor.type] != undefined) {
            anatomy = CONFIG.EmConfig.anatomy[this.actor.type];
        }
        console.log(`set anatomy of ${this.actor.id} of class ${this.actor.type} to :`,anatomy);
    }

    getAnatomy() {
        return this.getActorData().anatomy;
    }

    addAnatomy({name ,attachedTo, partType }) {

    }

    //#endregion



}