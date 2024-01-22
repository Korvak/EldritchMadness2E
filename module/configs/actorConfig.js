export const EmActorConfig = {
    //#region UI

        flipbook : {
            wMargin : 25,
            hMargin : 37
        },
        
        COLORS : {
            BARS : {
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
        },

    //#endregion
    //#region country data
        COUNTRIES : {},
        GOVERNMENTS : {
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
        },
    //#endregion
    //#region skills

        BACKGROUNDS : {
            none : {
                name : "None",
                desc : "",
                stats : []
            }
        },
        


    //#endregion
    //#region anatomy

        SEX : {
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
        },
        PARTS : {
            torso : "em.actors.partypes.torso",
            arm : "em.actors.partypes.arm",
            leg : "em.actors.partypes.leg",
            organ : "em.actors.partypes.organ",
            vestigial : "em.actors.partypes.vestigial"
        },
        MEDICAL_CONDITION_TYPES : {
            "buff" : "em.actors.conditions.buff",
            "debuff" : "em.actors.conditions.debuff",
            "injury" : "em.actors.conditions.injury",
            "psyche" : "em.actors.conditions.psyche",
            "illness" : "em.actors.conditions.illness"
        },
    //#endregion
};