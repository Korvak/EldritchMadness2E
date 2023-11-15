import {EmConfig} from "./module/config.js"
import TestItemSheet from "./module/sheet/TestItemSheet.js";
import TestActorSheet from "./module/sheet/TestActorSheet.js";

Hooks.once("init", function() {
    console.log("loading EM 2E");

    CONFIG.EmConfig = EmConfig;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("emItem", TestItemSheet, {makeDefault: true});
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("emActor", TestActorSheet, {makeDefault: true});

});