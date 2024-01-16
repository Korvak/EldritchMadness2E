export const EmSettings = {
    EM2E : {
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
        }
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


//#endregion


export async function buildSettings(...params) {
    /** some settings require the system to build or register some data.
     *  so we have to build the data before calling registerSettings.
     */
    //#region settings that require registering Sheets

        EmSettings["EM2E"]["defaultLootActor"]["choices"] = getSheetActors();

    //#endregion
}


