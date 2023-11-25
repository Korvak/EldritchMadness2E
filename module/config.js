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
    MISSING_ANATOMY_TYPE_ERROR : "errors.missingAnatomyType",
    MISSING_ANATOMY_PARENT_ERROR : "errors.missingAnatomyParent"
};

EmConfig.GRADES = {
    A : "em.grades.A",
    B : "em.grades.B",
    C : "em.grades.C",
    D : "em.grades.D",
    E : "em.grades.E",
    F : "em.grades.F"
}

//#endregion

//#region actorSheet

EmConfig.tabs = {
    testActor : {
        info : 2,
        combat : 4,
        health : 6,
        inventory : 8,
        options : 10
    },
    DEFAULT : {
        info : 2,
        combat : 4,
        health : 6,
        inventory : 8,
        options : 10
    }
}

EmConfig.anatomy = {
    DEFAULT_NAME : "bodypart",
    DEFAULT_PARTTYPE : "torso",
    PARTTYPES : [
        "torso",
        "arm",
        "leg",
        "organ",
        "vestigial"
    ],
    FOLDER_ID : "8kzDEEDLhS6aCSbj"
};

EmConfig.flipbook = {
    wMargin : 10,
    hMargin : 45
};


//#endregion

