export const EmSettings = {
    EM2E : {
        defaultLootActor : {
            name : "SETTINGS.defaultLootActor.name",
            hint : "SETTINGS.defaultLootActor.label",
            scope : "world",
            config : true,
            type : String,
            default : "lootBag",
            choices : {
                "a" : "lootbag",
                "b" : "alfa"
            },
            onchange : value => {
                console.warn(value);
            }
        }
    }
};

