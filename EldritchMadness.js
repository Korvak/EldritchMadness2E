import {EmConfig} from "./module/config.js"
import {normalize, translate} from "./module/utils.js";
import EmBaseActorSheet from "./module/sheet/EmBaseActorSheet.js";
import EmBaseItemSheet from "./module/sheet/EmBaseItemSheet.js";

async function preloadHandlebarsTemplates() {
  const templatePaths = [
    //#region actor partials
    "systems/EldritchMadness/templates/partials/actors/navbar-partial.hbs",
    "systems/EldritchMadness/templates/partials/actors/actorInfo-partial.hbs",
    "systems/EldritchMadness/templates/partials/actors/actorMedicalInfo-partial.hbs",
    //#endregion
    //#region item partials
    "systems/EldritchMadness/templates/partials/items/baseItem-partial.hbs",
    "systems/EldritchMadness/templates/partials/items/destroyable-partial.hbs",
    "systems/EldritchMadness/templates/partials/items/repairable-partial.hbs",
    "systems/EldritchMadness/templates/partials/items/equippable-partial.hbs",
    "systems/EldritchMadness/templates/partials/items/upgradable-partial.hbs",
    "systems/EldritchMadness/templates/sheets/items/bodypart-sheet.hbs",
    //#endregion
  ];

  return loadTemplates(templatePaths);
}

function _makeTree(ul,node,options) {
  let result = options.fn(node);
  if (node.children !== undefined && node.children.length > 0) {
    let ulAttrs = ul.attrs != undefined ? ul.attrs : '';
    let ulClasses = ul.classes != undefined ? `class="${ul.classes}"` : '';
    result += `<ul for="${node.id}" ${ulAttrs} ${ulClasses}>`;
    for (let child of node.children) {
      result += _makeTree(ul, child, options);
    }
    result+= '</ul>';
  }
  return result;
}



Hooks.once("init", function() {
    //starting messages
    console.log("loading EM 2E");
    //we insert our Config into the Global Config object
    CONFIG.EmConfig = EmConfig;

    //#region register item sheets
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("EldritchMadness", EmBaseItemSheet, {makeDefault: true});
    //#endregion

    //#region register actor sheets
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet(
      "EldritchMadness", 
      EmBaseActorSheet, 
      //types : [your-actor-types],
      {makeDefault: true}
    );
    //#endregion

    //#region register handlebars
    Handlebars.registerHelper('i18n', function(key) {
        return translate(key);
    });

    //#region condtional helpers
    Handlebars.registerHelper('and', function(a,b) {
      return a && b;
    });

    Handlebars.registerHelper('gt', function(a,b) {
      return a > b;
    });

    //#endregion

    Handlebars.registerHelper('norm' , function(value, min, max) {
      return normalize(value,min,max);
    });

    Handlebars.registerHelper('set', function(item, key, value) {
        item[key] = value;
    });

    Handlebars.registerHelper('fetch', function(item, key) {
        try {return item[key];}
        catch(error) {console.error(error.message); return undefined;}
    });

    Handlebars.registerHelper('hasRole', function(role) {
        role = EmConfig.roles[role];
        return game.user.role == role;
    }); 

    Handlebars.registerHelper('TreeExplorer', function(ulClasses, ulAttrs, item, options) {
        // Define a recursive function to generate the tree structure
        try{
          return new Handlebars.SafeString(
            _makeTree({
              "classes" : ulClasses,
              "attrs" : ulAttrs
            }, item, options));
        }
        catch(error) {console.error(error.message);}
    });

    preloadHandlebarsTemplates();
    //#endregion
});