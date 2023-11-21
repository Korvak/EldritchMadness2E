export const EmConfig = {};

//#region base settings

EmConfig.roles = {
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
}


//#endregion


//#region actorSheet
EmConfig.anatomy = {
    default : {
        
    },
    "bodypart" : {
        "templates" : [
            "baseItem",
            "repairable",
            "upgradable"
        ],
        "tags" : ["bodypart"],
        "description" : "em.items.bodypart.DEFAULT_DESC",
        "partType" : "torso",
        "targetDifficultyMult" : 1.0,
        "allowedEquippables" : [],
        "equipped" : {
            "upper" : null,
            "lower" : null
        },
        "bodySync" : {
            "hpLink" : {
                "linked" : true,
                "linkedToStat" : "hp",
                "linkDmgConvRate" : 1.0,
                "maxLinkDmg" : 0.5,
                "linkTotDmg" : 0.0
            }
        },
        "attachedTo" : null
    },
};

EmConfig.flipbook = {
    wMargin : 10,
    hMargin : 25
};

EmConfig.MEDICAL_CONDITION_TYPES = {
    "buff" : "em.actors.conditions.buff",
    "debuff" : "em.actors.conditions.debuff",
    "injury" : "em.actors.conditions.injury",
    "psyche" : "em.actors.conditions.psyche",
    "illness" : "em.actors.conditions.illness"
};
//#endregion

//#region loading and errors
EmConfig.ERRORS = {
    MISSING_ANATOMY_TYPE_ERROR : "errors.missingAnatomyType"
};

EmConfig.LOADED = {
    
}

//#endregion