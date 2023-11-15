export default class EmBaseItemSheet extends ItemSheet {

    get template() {
        return `systems/EldritchMadness/templates/sheets/items/${this.item.type}-sheet.hbs`;
    }


    getData() {
        let data = super.getData();
        //system holds all the data
        console.log("item",data);
        return data;
    }

}