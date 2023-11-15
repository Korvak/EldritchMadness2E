import {EmConfig} from "./module/config.js"
import EmBaseActorSheet from "./module/sheet/EmBaseActorSheet.js";
import EmBaseItemSheet from "./module/sheet/EmBaseItemSheet.js";

Hooks.once("init", function() {
    console.log("loading EM 2E");

    CONFIG.EmConfig = EmConfig;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("emItem", EmBaseItemSheet, {makeDefault: true});
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("emActor", EmBaseActorSheet, {makeDefault: true});

});