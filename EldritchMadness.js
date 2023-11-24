import {EmConfig} from "./module/config.js"
import {normalize, translate} from "./module/utils.js";
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

function _generateTree(id, ulClasses, ulAttrs, items, options) {
  //forces each tree element to follow a predefined structure
  //each element should have an id and must have a children attribute
  id = id != "" ? `for="${id}"` : "";
  let result = `<ul ${id} ${ulAttrs}  class="${ulClasses}" >`;
  for (let item of items) {
    result += options.fn(item);
    // Check if the current item has children
    if (item.children != undefined && item.children.length > 0) {
      // Recursively call the function for children
      result += _generateTree(item.id, ulClasses, ulAttrs, item.children, options);
    }
  }
  result += '</ul>';
  return result;
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

    //#region condtional helpers
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

    Handlebars.registerHelper('TreeExplorer', function(id, ulClasses, ulAttrs, items, options) {
        // Define a recursive function to generate the tree structure
        try{
          if (items === undefined || item === null) {items = [];}
          return new Handlebars.SafeString(_generateTree(id, ulClasses, ulAttrs, items, options));
        }
        catch(error) {console.error(error.message);}
        
    });

    preloadHandlebarsTemplates();
    //#endregion
});