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
//#region UI


EmConfig.BAR_COLORS = {
    ITEM : {
        HP : {
            PRIMARY : "red",
            TEMP : "green"
        }
    }
}


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

//should be deprecated
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
    DEFAULT_NAME : "em.actor.anatomy.default_anatomy_name",
    DEFAULT_PART_TYPE : "vestigial",
    ROOT_PART_TYPE : "torso",
    PART_TYPES : [
        {
            name : "torso",
            label : "em.actor.anatomy.partTypes.torso"
        },
        {
            name : "arm",
            label : "em.actor.anatomy.partTypes.arm"
        },
        {
            name : "leg",
            label : "em.actor.anatomy.partTypes.leg"
        },
        {
            name : "organ",
            label : "em.actor.anatomy.partTypes.organ"
        },
        {
            name : "vestigial",
            label : "em.actor.anatomy.partTypes.vestigial"
        }
    ],
    FOLDER_ID : "8kzDEEDLhS6aCSbj",
    DEFAULT_GROWTH_STAGE_DESC : "em."
};

EmConfig.flipbook = {
    wMargin : 25,
    hMargin : 37
};


//#endregion

//#region itemSheet


//#endregion