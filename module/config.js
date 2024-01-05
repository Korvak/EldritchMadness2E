export const EmConfig = {
};

//#region base settings

    EmConfig.PATHS = {
        COUNTRY_IMG : "/systems/EM2E/resources/images/countries/",
        IMG : "/systems/EM2E/resources/images/"
    }

    EmConfig.ROLES = {
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

    EmConfig.FOLDERS = [
        {
            name : "lootbags",
            type : "Actor"
        },
        {
            name : "test",
            type : "Actor"
        }
    ];

    EmConfig.MEDICAL_CONDITION_TYPES = {
        "buff" : "em.actors.conditions.buff",
        "debuff" : "em.actors.conditions.debuff",
        "injury" : "em.actors.conditions.injury",
        "psyche" : "em.actors.conditions.psyche",
        "illness" : "em.actors.conditions.illness"
    };

//#endregion

//#region countries

    EmConfig.COUNTRIES = {
        bera   : "I7dEgQTUtMTARVGp",
        berket : "Ed8Q4F2kOVIFILRI",
        drukar : "6DAE8oJpr0chKsdc",
        valan  : "rFBrd1GUMdG1kR9U",
        vostol : "G6ZLCeVFJNAjHUJ3",
        wreria : "2hK2ED1yz9nhfY2x"
    }

    EmConfig.GOVERNMENTS = {
        kingdom   : {
            name : "em.countries.governments.kingdom.name",
            preposition : "em.countries.governments.kingdom.preposition"
        },
        monarchy   : {
            name : "em.countries.governments.monarchy.name",
            preposition : "em.countries.governments.monarchy.preposition"
        },
        coalition   : {
            name : "em.countries.governments.coalition.name",
            preposition : "em.countries.governments.coalition.preposition"
        },
        federation : {
            name : "em.countries.governments.federation.name",
            preposition : "em.countries.governments.federation.preposition"
        },
        republic   : {
            name : "em.countries.governments.republic.name",
            preposition : "em.countries.governments.republic.preposition"
        },
        democracy   : {
            name : "em.countries.governments.democracy.name",
            preposition : "em.countries.governments.democracy.preposition"
        },
        oligarchy   : {
            name : "em.countries.governments.oligarchy.name",
            preposition : "em.countries.governments.oligarchy.preposition"
        },
        empire   : {
            name : "em.countries.governments.empire.name",
            preposition : "em.countries.governments.empire.preposition"
        }
    }


//#endregion

//#region UI


    EmConfig.BAR_COLORS = {
        ITEM : {
            HP : {
                PRIMARY : "red",
                TEMP : "green"
            }
        },
        ACTOR : {
            HP : {
                PRIMARY : "red",
                TEMP : "green"
            },
            SAN : {
                PRIMARY : "#68468C",
                TEMP : "#886FAC"
            },
            MP : {
                PRIMARY : "#1E90FF",
                TEMP : "#82CAFF"
            },
            LUCK : {
                PRIMARY : "#FFB200",
                TEMP : "#FFD966"
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

    EmConfig.SEX = {
        M : {
            short : "em.actors.sex.M.short",
            label : "em.actors.sex.M.label"
        },
        F : {
            short : "em.actors.sex.F.short",
            label : "em.actors.sex.F.label"
        },
        N : {
            short : "em.actors.sex.N.short",
            label : "em.actors.sex.N.label"
        }
    }

    EmConfig.anatomy = {
        DEFAULT_NAME : "em.actors.anatomy.default_anatomy_name",
        DEFAULT_PART_TYPE : "vestigial",
        ROOT_PART_TYPE : "torso",
        PART_TYPES : [
            {
                name : "torso",
                label : "em.actors.anatomy.partTypes.torso"
            },
            {
                name : "arm",
                label : "em.actors.anatomy.partTypes.arm"
            },
            {
                name : "leg",
                label : "em.actors.anatomy.partTypes.leg"
            },
            {
                name : "organ",
                label : "em.actors.anatomy.partTypes.organ"
            },
            {
                name : "vestigial",
                label : "em.actors.anatomy.partTypes.vestigial"
            }
        ],
        FOLDER_ID : "8kzDEEDLhS6aCSbj",
        DEFAULT_GROWTH_STAGE_DESC : "em."
    };

    EmConfig.flipbook = {
        wMargin : 25,
        hMargin : 37
    };

    EmConfig.SKILLS = {
        ARTS_AND_CRAFTS : [
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
        ]
    };

    EmConfig.BACKGROUNDS = {
        none : {
            name : "None",
            desc : "",
            stats : []
        }
    }

//#endregion

//#region itemSheet

    EmConfig.DEFAULT_LOOT_ACTOR = "lootBag";

//#endregion