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
};