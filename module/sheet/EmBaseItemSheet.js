export default class EmBaseItemSheet extends ItemSheet {

    //#region base methods
    get template() {
        return `systems/EM2E/templates/sheets/items/${this.item.type}-sheet.hbs`;
    }


    getData() {
        let data = super.getData();
        //system holds all the data
        console.log("item",data);
        return data;
    }

    //#endregion

    //#region helper methods

    getItemData() {
        return this.getData().item.system;
    }

    //#endregion
}