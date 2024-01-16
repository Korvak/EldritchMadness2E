import { EmGlobalConfig } from "./globalConfig.js";
import { EmActorConfig } from "./actorConfig.js";

export const EmSettings = {
    EM2E : {
        //loot actors
        defaultLootActor : {
            name : "SETTINGS.defaultLootActor.name",
            hint : "SETTINGS.defaultLootActor.label",
            scope : "world",
            config : true,
            type : String,
            default : "lootBag",
            choices : {},
            onchange : value => {
                console.warn(value);
            }
        },
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
                scope : "world",
                config : true,
                type : String,
                default : "vestigial",
                choices : getBodyParts(),
                onchange : value => {
                    console.warn(value);
                }
            }

        //#endregion
    }
};

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


