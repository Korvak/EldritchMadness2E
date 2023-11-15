export default class TestActorSheet extends ActorSheet {
 
    get template() {
        return `systems/EldritchMadness/templates/sheets/actors/testActor-sheet.hbs`;
    }

    getData() {
        let data = super.getData();
        //system holds all the data
        console.log("actor",data);
        console.log("actorItems", data.items);
        console.log("actorItem", data.items[0].system.desc);

        return data;
    }

    activateListeners(html) {
        html.find(".changeFirst").click(this._changeFirst.bind(this));

        super.activateListeners(html);
    }

    _changeFirst(event) {
        event.preventDefault();
        console.log(this);
        console.log("actor" , this.actor);
        console.log(this.actor.items);
        let counter = 0;
        for(let item of this.actor.items) {
            console.log(item);
            item.system.desc = "a changed custom test item";
            if (counter == 0) {
                item.sheet.render(true);
            }
            counter++;
        }
        //this.actor.items[0].system.desc = "a modified test item";
    }
}