import {EmConfig} from "./module/config.js"
import {translate} from "./module/utils.js";
import EmBaseActorSheet from "./module/sheet/EmBaseActorSheet.js";
import EmBaseItemSheet from "./module/sheet/EmBaseItemSheet.js";

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    //#region actor partials
    "systems/EldritchMadness/templates/partials/actors/navbar-partial.hbs",
    "systems/EldritchMadness/templates/partials/actors/actorInfo-partial.hbs",
    "systems/EldritchMadness/templates/partials/actors/actorMedicalInfo-partial.hbs"
    //#endregion
  ];

  return loadTemplates(templatePaths);
}


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

    preloadHandlebarsTemplates();
    //#endregion
});