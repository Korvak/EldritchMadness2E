export const EmConfig = {};


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
}

EmConfig.MEDICAL_CONDITION_TYPES = {
    "injury" : "em.actors.conditions.injury",
    "psyche" : "em.actors.conditions.psyche",
    "illness" : "em.actors.conditions.illness"
}