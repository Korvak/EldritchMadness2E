export default class TestItemSheet extends ItemSheet {

    get template() {
        return `systems/EldritchMadness/templates/sheets/${this.item.data.type}-sheet.html`;
    }
}