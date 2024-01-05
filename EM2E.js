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

  async function createFolders() {
      /** checks if the folders already exist in the adventure or if they have to be created
       * 
       */
      //we fetch the list of folders to check from the config
      let folder = undefined;
      console.error("here");
      for (let configFolder of EmConfig.FOLDERS) {
          folder = await getFolderByName(configFolder.name);
          if (folder === undefined) { //if missing we create it
              Folder.create({
                  name : configFolder.name,
                  type : configFolder.type
              });
          }
      }




  }

//#region Hook events

  Hooks.on("dropCanvasData", async function (canvas, data) {
    console.warn(data);
    switch(data.type) {
      case "Item" : {
          //we encase the element in a loot actor
          //let folder = await Folder.get(EmConfig.LOOT_FOLDER);
          let folder = undefined;
          let actor = await encaseItem({
              itemId : data.uuid,
              actorName : "lootbag",
              actorType : EmConfig.DEFAULT_LOOT_ACTOR
            }, {parent : folder});
          //then we create the token
          let token = await createToken(actor, {x: data.x , y : data.y}, canvas.scene);
          //then we recall the event but using the actor
          data.type = "Actor";
          data.uuid = `Actor.${actor._id}`;
          Hooks.call("dropCanvasData" , canvas, data);
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

      //register the countries
      for(let key of Object.keys(EmConfig.COUNTRIES) ) {
        let countryID = EmConfig.COUNTRIES[key];
        if (countryID !== undefined && countryID.length > 0 ) {
            EmConfig.COUNTRIES[key] = await Item.get(countryID);
        }
      }
      //checks and create the folders
      await createFolders();
      let comp_name = "world.loot";
      let compendium = await game.packs.get(comp_name);
      console.warn(compendium);

      let folderName = "lootbags";
      let folder = await game.folders.filter( (folder) => {folder.name == folderName; console.log(folder);});
      console.warn("folder", await getFolderByName("lootbags"));



      console.log("finished loading countries", EmConfig.COUNTRIES);
  });

//#endregion 