import {EmBasePawnSheet} from "./EmBasePawnSheet.js"

export default class EmBaseCharacterSheet extends EmBasePawnSheet {

        //#region base methods

            constructor(...args) {
                super(...args);
                //makes sure that the flipbook animation is always performed on open, even when starting the application
                this.getActorData().flipbook.anim = true;
            }
        
            static get defaultOptions() {
                return mergeObject(super.defaultOptions, 
                    {
                        width: 582,
                        height : 476,
                        classes : ["em_actorSheet"]
                });
            }
        
            get template() {
                console.log("actor", this.getData() );
                console.log("actorItems", this.getData().items);
                return `systems/EM2E/templates/sheets/actors/baseActor-sheet.hbs`;
            }
    
        //#endregion
}