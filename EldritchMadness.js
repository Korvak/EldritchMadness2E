import {EmConfig} from "./module/config.js"
import {translate} from "./module/utils.js";
import EmBaseActorSheet from "./module/sheet/EmBaseActorSheet.js";
import EmBaseItemSheet from "./module/sheet/EmBaseItemSheet.js";

Hooks.once("init", function() {
    //starting messages
    console.log("loading EM 2E");

    CONFIG.EmConfig = EmConfig;

    //#region register item sheets
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("emItem", EmBaseItemSheet, {makeDefault: true});
    //#endregion

    //#region register actor sheets
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("emActor", EmBaseActorSheet, {makeDefault: true});
    //#endregion

    //#region register handlebars
    Handlebars.registerHelper('i18n', function(key) {
        return translate(key);
      });
    //#endregion
});