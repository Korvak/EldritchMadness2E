export const EmGlobalConfig = {
    //#region system data
        PATHS : {
            COUNTRY_IMG : "/systems/EM2E/resources/images/countries/",
            IMG : "/systems/EM2E/resources/images/"
        },
        FOLDERS : {
            "LOOTBAGS" : {
                id : "",
                name : "lootbags",
                type : "Actor"
            },
            "COUNTRIES" : {
                id : "",
                name : "countries",
                type : "Actor"
            },
            "BODYPARTS" : {
                id : "",
                name : "bodyparts",
                type : "Item"
            }
        },
    //#endregion
    //#region system permissions

        ROLES : {
            "GM" : 4,
            "gm" : 4,
            "KEEPER" : 4,
            "ASSISTANT KEEPER" : 3,
            "TRUSTED INVESTIGATOR" : 2,
            "INVESTIGATOR" : 1,
            "keeper" : 4,
            "assistant keeper" : 3,
            "trusted investigator" : 2,
            "investigator" : 1,
            "4" : 4,
            "3" : 3,
            "2" : 2,
            "1" : 1,
            "0" : 0,
            4 : 4,
            3 : 3,
            2 : 2,
            1 : 1,
            0 : 0,
        },

    //#endregion
    //#region enums
        //here should be all the neutral enums that do not logically belong to either the actor or item
        


    //#endregion
    
    MEDICAL_CONDITION_TYPES : {
        "buff" : "em.actors.conditions.buff",
        "debuff" : "em.actors.conditions.debuff",
        "injury" : "em.actors.conditions.injury",
        "psyche" : "em.actors.conditions.psyche",
        "illness" : "em.actors.conditions.illness"
    },

    ERRORS : {
        MISSING_ANATOMY_TYPE_ERROR : "errors.missingAnatomyType",
        MISSING_ANATOMY_PARENT_ERROR : "errors.missingAnatomyParent"
    },
};