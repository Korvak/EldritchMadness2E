import { EmGlobalConfig } from "./globalConfig.js";
import { EmActorConfig } from "./actorConfig.js";

export const EmSettings = {
    EM2E : {
        //loot actors
        defaultLootActor : {
            name : "SETTINGS.defaultLootActor.name",
            hint : "SETTINGS.defaultLootActor.label",
            cssClasses : [], //non Foundry default
            scope : "world",
            config : true,
            type : String,
            default : "lootBag",
            cssClasses : [],
            choices : {},
            onchange : value => {
                console.warn(value);
            }
        },
        //#region art & crafts skills

            artAndCraftSkills : {
                name : "SETTINGS.SKILLS.artAndCraftSkills.name",
                hint : "SETTINGS.SKILLS.artAndCraftSkills.label",
                cssClasses : ["setting-array"], //non Foundry default
                scope : "world",
                config : true,
                type : Array,
                default : [
                    "acting",
                    "barber",
                    "cobbler",
                    "cooking",
                    "dancer",
                    "fine art",
                    "forgery",
                    "singing",
                    "painting",
                    "photograghy",
                    "pottery",
                    "sculpting",
                    "writing",
                    "woodwork"
                ],
                onchange : function(value) {
                    alert(value);
                    console.warn(value);
                }
            },
            actorBackgrounds : {
                name : "SETTINGS.SKILLS.actorBackgrounds.name",
                hint : "SETTINGS.SKILLS.actorBackgrounds.label",
                cssClasses : ["setting-backgroundList"], //non Foundry default
                scope : "world",
                config : true,
                type : Array,
                default : [],
                onchange : value => {
                    console.warn(value);
                }
            },

        //#endregion
        //#region anatomy

            defaultAnatomyPartName : {
                name : "SETTINGS.ANATOMY.defaultAnatomyPartName.name",
                hint : "SETTINGS.ANATOMY.defaultAnatomyPartName.label",
                scope : "world",
                config : true,
                type : String,
                default : "bodypart",
                onchange : value => {
                    console.warn(value);
                }
            },
            defaultRootType : {
                name : "SETTINGS.ANATOMY.defaultRootType.name",
                hint : "SETTINGS.ANATOMY.defaultRootType.label",
                cssClasses : [], //non Foundry default
                scope : "world",
                config : true,
                type : String,
                default : "torso",
                choices : getBodyParts(),
                onchange : value => {
                    console.warn(value);
                }
            },
            defaultAnatomyPartType : {
                name : "SETTINGS.ANATOMY.defaultAnatomyPartType.name",
                hint : "SETTINGS.ANATOMY.defaultAnatomyPartType.label",
                cssClasses : [], //non Foundry default
                scope : "world",
                config : true,
                type : String,
                default : "vestigial",
                choices : getBodyParts(),
                onchange : value => {
                    console.warn(value);
                }
            },

        //#endregion
        //#region UI

            flipbookWMargin : {
                name : "SETTINGS.UI.flipbookWMargin.name",
                hint : "SETTINGS.UI.flipbookWMargin.label",
                cssClasses : [], //non Foundry default
                scope : "client",
                config : true,
                type : Number,
                default : 25,
                range : {
                    min : 0,
                    max : 100,
                    step : 1
                },
                onchange : value => {
                    console.warn(value);
                }
            },
            flipbookHMargin : {
                name : "SETTINGS.UI.flipbookHMargin.name",
                hint : "SETTINGS.UI.flipbookHMargin.label",
                cssClasses : [], //non Foundry default
                scope : "client",
                config : true,
                type : Number,
                default : 37,
                range : {
                    min : 0,
                    max : 100,
                    step : 1
                },
                onchange : value => {
                    console.warn(value);
                }
            },
        //#endregion
    
    }
};

//#region settings menu UI functions

    export function createArraySettingUI () {
        //we add a select that displays all the array options
        let element = $('<select class="em_noShadow w3-center em_halfSection" style="flex : 100%;"></select>');
        let input = $(this).find("input");
        //we add all the values as options to the select
        for (let item of input.val().split(",")) {
        element.append($(`<option>${item}</option>`));
        }
        $(this).append(element);
        //then we add a button and an input to add other options to the array
        element = $('<div class="em_inputContainer w3-transparent" style="flex : 100%;"></div>');
        let insertIcon = $('<i class="em_inputIcon w3-transparent fa-solid fa-plus" style="min-width:1em;">');
        insertIcon.click(function() {
            //adds the data to the list input and clears the insert input
            let insertInput = $(this).parent().find("input");
            //we treat the data as an array
            let values = input.val().split(",");
            values.push(insertInput.val());
            input.val( values.join(","));
            insertInput.val(""); 
        });
        element.append( 
        $('<input class="em_input w3-border-0 w3-transparent em_noShadow" type="text">') 
        );
        element.append(insertIcon);
        //we add the div to the container
        $(this).append(element);
        //finally we move the hint to the bottom
        element = $(this).find("p");
        element.remove();
        $(this).append(element);
    }


//#endregion


//#region helper functions

    function getSheetActors() {
        /** returns all the sheet actors read from the config
         *  @returns {Object(string : string)} : returns an object "name" : "label" of all the existing sheet classes
         */
        let result = {};
        let actorClasses = Object.keys(CONFIG.Actor.sheetClasses);
        for (let actor of actorClasses) {
            result[actor] = actor;
        }
        return result;
    }

    function getBodyParts() {
        /** returns the bodyparts in a manageable list */
        let result = EmActorConfig.PARTS;
        for(let part in EmActorConfig.PARTS) {
            result[part] = `SETTINGS.ANATOMY.PARTS.${part}`;
        }
        return result;
    }

//#endregion


export async function buildSettings(...params) {
    /** some settings require the system to build or register some data.
     *  so we have to build the data before calling registerSettings.
     */
    //#region settings that require registering Sheets

        EmSettings["EM2E"]["defaultLootActor"]["choices"] = getSheetActors();

    //#endregion
}


