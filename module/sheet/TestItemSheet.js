export default class TestItemSheet extends ItemSheet {

    get template() {
        return `systems/EldritchMadness/templates/sheets/items/testItem-sheet.hbs`;
    }

    getData() {
        let data = super.getData();
        //system holds all the data
        console.log("item",data);
        return data;
    }
}