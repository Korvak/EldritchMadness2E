import {EmConfig} from "./module/config.js"
import {normalize} from "./module/utils.js";
import {translate, getFolderByName, encaseItem, createToken} from "./module/emCore.js"
//#region actor class imports
import EmBaseActorSheet from "./module/sheet/actors/EmBaseActorSheet.js";
import EmBasePawnSheet from "./module/sheet/actors/EmBasePawnSheet.js";
import EmBaseCharacterSheet from "./module/sheet/actors/EmBaseCharacterSheet.js";
//#endregion
//#region item class imports
import EmBaseItemSheet from "./module/sheet/items/EmBaseItemSheet.js";
//#endregion

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
          "systems/EM2E/templates/partials/actors/attributes-partial.hbs",
          "systems/EM2E/templates/partials/actors/inventory-partial.hbs",
        //#endregion
        //#region char partials
          "systems/EM2E/templates/partials/chars/navbar-partial.hbs",
          "systems/EM2E/templates/partials/chars/actorInfo-partial.hbs",
          //#region char data partials
            "systems/EM2E/templates/partials/chars/dataPartials/actorData-partial.hbs",
            "systems/EM2E/templates/partials/chars/dataPartials/passportData-partial.hbs",
            "systems/EM2E/templates/partials/chars/dataPartials/bestiaryData-partial.hbs",
            "systems/EM2E/templates/partials/chars/dataPartials/blueprintData-partial.hbs",
          //#endregion
          "systems/EM2E/templates/partials/chars/actorMedicalInfo-partial.hbs",
          "systems/EM2E/templates/partials/chars/actorInventory-partial.hbs",
          "systems/EM2E/templates/partials/chars/actorOptions-partial.hbs",
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
            return game.user.role >= role;
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
      //#region set and get operation helpers

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
        //returns the user
        Handlebars.registerHelper('getUser', function(field = undefined) {
            if (field == 'character') {return {actor : game.user.character};}
            else {return game.user;}
        });
        //gets all the partials
        Handlebars.registerHelper('renderPartial', function(partialName, context) {
          const partial = Handlebars.partials[partialName];
          if (partial) {
              return new Handlebars.SafeString(partial(context));
          }
          return '';
      });


      //#endregion
  }

//#endregion
//#region helper functions

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
            {
              //types : [your-actor-types],
              makeDefault: true
            }
          );
          Actors.registerSheet(
            "EM2E", 
            EmBaseCharacterSheet, 
            {
              types : [
                "testActor"
              ],
              makeDefault : true
            }
          );
        //#endregion
    }


    async function checkCountries() {
        /** it checks if at least a country exists
         * 
         */
        let folder = await Folder.get(EmConfig.FOLDERS["COUNTRIES"].id); //await getFolderByName(EmConfig.FOLDERS["LOOTBAGS"].name);
        for(let country of folder.content) {
            if (country.type != "country") {console.error("the country folder must only contain country actors.");}
        }
    }

    async function checkFolders() {
        /** checks if the folders already exist in the adventure or if not it creates it
         * 
         */
        //we fetch the list of folders to check from the config
        let folder = undefined;
        //cycles all folders in the config and checks if they exist
        for (let configFolder of Object.values(EmConfig.FOLDERS) ) {
            folder = await getFolderByName(configFolder.name);
            if (folder === undefined) { //if missing we create it
                folder = await Folder.create({
                    name : configFolder.name,
                    type : configFolder.type
                });
            }
            //then we set the id
            configFolder.id = folder._id;
        }
    }

    async function createLootbagOnDrop(canvas, data) {
        //we encase the element in a loot actor
        let folder = await Folder.get(EmConfig.FOLDERS["LOOTBAGS"].id); //await getFolderByName(EmConfig.FOLDERS["LOOTBAGS"].name);
        console.warn(folder);
        let actor = await encaseItem(
            data.uuid,
            {
              name : 'lootbag',
              type : EmConfig.DEFAULT_LOOT_ACTOR,
              data : {
                folder : folder
              }
            }
          );
        //then we create the token
        let token = await createToken(actor, {x: data.x , y : data.y}, canvas.scene);
        //then we recall the event but using the actor
        data.type = "Actor";
        data.uuid = `Actor.${actor._id}`;
        Hooks.call("dropCanvasData" , canvas, data);
        return;
    }

//#endregion



//#region Hook events

  Hooks.on("dropCanvasData", async function (canvas, data) {
    console.warn(data);
    switch(data.type) {
      case "Item" : {
          await createLootbagOnDrop(canvas, data);
          break;
      }
    }

  });

//#endregion

//#region start

  Hooks.once("init", async function() {
      //starting messages
      console.log("loading EM 2E");
      //we insert our Config into the Global Config object
      CONFIG.EmConfig = EmConfig;

      registerSheets();
      registerHandlebars();
      preloadHandlebarsTemplates();
  });

  Hooks.once("ready", async function() {
      //checks and create the folders
      await checkFolders();
      //checks if any country exists and sets the main countries in the config
      await checkCountries();

  });

//#endregion 