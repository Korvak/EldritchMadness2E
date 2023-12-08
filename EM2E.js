import {EmConfig} from "./module/config.js"
import {normalize, translate} from "./module/utils.js";
import EmBaseActorSheet from "./module/sheet/EmBaseActorSheet.js";
import EmBaseItemSheet from "./module/sheet/EmBaseItemSheet.js";

//#region handlebars functions

  //#region handlebars start

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

  //#endregion

  async function preloadHandlebarsTemplates() {
      const templatePaths = [
        //#region actor partials
          "systems/EM2E/templates/partials/actors/navbar-partial.hbs",
          "systems/EM2E/templates/partials/actors/actorInfo-partial.hbs",
          //#region actor data partials
            "systems/EM2E/templates/partials/actors/dataPartials/actorData-partial.hbs",
            "systems/EM2E/templates/partials/actors/dataPartials/passportData-partial.hbs",
            "systems/EM2E/templates/partials/actors/dataPartials/bestiaryData-partial.hbs",
            "systems/EM2E/templates/partials/actors/dataPartials/reportData-partial.hbs",
          //#endregion
          "systems/EM2E/templates/partials/actors/actorMedicalInfo-partial.hbs",
          "systems/EM2E/templates/partials/actors/actorOptions-partial.hbs",
          "systems/EM2E/templates/partials/actors/actorAttributes-partial.hbs",
        //#endregion
        //#region item partials
          "systems/EM2E/templates/partials/items/baseItem-partial.hbs",
          "systems/EM2E/templates/partials/items/destroyable-partial.hbs",
          "systems/EM2E/templates/partials/items/repairable-partial.hbs",
          "systems/EM2E/templates/partials/items/equippable-partial.hbs",
          "systems/EM2E/templates/partials/items/upgradable-partial.hbs",
          "systems/EM2E/templates/sheets/items/bodypart-sheet.hbs",
        //#endregion
    ];

    return loadTemplates(templatePaths);
  }

  function registerHandlebars() {
    
      //#region Foundry helpers

        Handlebars.registerHelper('i18n', function(key) {
          return translate(key);
        });

        Handlebars.registerHelper('hasRole', function(role) {
            role = EmConfig.ROLES[role];
            return game.user.role == role;
        }); 

      //#endregion
      //#region html helpers

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

      //#endregion
      //#region math operation helpers

        Handlebars.registerHelper('norm' , function(value, min, max) {
          return normalize(value,min,max);
        });

        Handlebars.registerHelper('sum' , function(a , b) {
          try {
            return a + b;
          }
          catch(error) {
            console.error(error.message);
            return NaN;
          }
        });

      //#endregion
      //#region conditional helpers

        Handlebars.registerHelper('contains', function(item,value) {
          if (Array.isArray(item) || typeof item == 'string') {
            return item.includes(value);
          }
          else {
            return item[value] !== undefined;
          }
        });

        Handlebars.registerHelper('and', function(a,b) {
          return a && b;
        });

        Handlebars.registerHelper('gt', function(a,b) {
          return a > b;
        });

      //#endregion
      //#region set operation helpers

        Handlebars.registerHelper('set', function(item, key, value) {
          item[key] = value;
        });

        Handlebars.registerHelper('fetch',function(item, key) {
            try {
              console.log(item, key, typeof item, typeof key);
              switch(typeof item) {
                case "function" : {return item(...key);}
                case "object" : {return item[key];}
                default : {return item[key];}
              }
            }
            catch(error) {
              console.error(error.message); 
              return undefined;
            }
        });

        Handlebars.registerHelper('concat',function(a, b) {
          return `${a}${b}`;
        });

      //#endregion
  }

//#endregion


  function registerSheets() {
      //#region register item sheets
        Items.unregisterSheet("core", ItemSheet);
        Items.registerSheet("EM2E", EmBaseItemSheet, {makeDefault: true});
        //#endregion

        //#region register actor sheets
        Actors.unregisterSheet("core", ActorSheet);
        Actors.registerSheet(
          "EM2E", 
          EmBaseActorSheet, 
          //types : [your-actor-types],
          {makeDefault: true}
        );
      //#endregion
  }





Hooks.once("init", async function() {
    //starting messages
    console.log("loading EM 2E");
    //we insert our Config into the Global Config object
    CONFIG.EmConfig = EmConfig;

    registerSheets();
    registerHandlebars();
    preloadHandlebarsTemplates();
    
    //#region register Countries 

      for(let key of EmConfig.COUNTRIES) {
          let countryItem = undefined;
          let countryID = EmConfig.COUNTRIES[key];
          if (countryID !== undefined && countryID.length > 0 ) {
              EmConfig.COUNTRIES[key] = await Item.get(countryID);
          }
      }
    


    //#endregion


    
    
});

Hooks.once("ready", function() {

});