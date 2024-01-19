//#region imports
  //#region configs
    import {EmConfig} from "./module/config.js"  //deprecated
    import { EmSettings, buildSettings, createArraySettingUI } from "./module/settings.js";
    import {EmGlobalConfig} from "./module/globalConfig.js";
    import { EmActorConfig } from "./module/actorConfig.js";
    import { EmItemConfig } from "./module/itemConfig.js";
  //#endregion
  //#region util functions
    import {normalize} from "./module/utils.js";
    import {translate, getFolderByName, encaseItem, createToken, getCountryByName} from "./module/emCore.js"
  //#endregion
  //#region actor class imports
    import EmBaseActorSheet from "./module/sheet/actors/EmBaseActorSheet.js";
    import EmBasePawnSheet from "./module/sheet/actors/EmBasePawnSheet.js";
    import EmBaseCharacterSheet from "./module/sheet/actors/EmBaseCharacterSheet.js";
    //child actor class imports
      import EmCountrySheet from "./module/sheet/child/actors/EmCountrySheet.js";
    //#endregion
  //#region item class imports
    import EmBaseItemSheet from "./module/sheet/items/EmBaseItemSheet.js";
  //#endregion
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
          console.warn("i18n is deprecated, please use localize instead.");
          return translate(key);
        });
        Handlebars.registerHelper('localize', function(key) {
          return translate(key);
        });

        Handlebars.registerHelper('hasRole', function(role) {
            role = EmGlobalConfig.ROLES[role];
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
        
        //gets all the partials
        Handlebars.registerHelper('renderPartial', function(partialName, context) {
          const partial = Handlebars.partials[partialName];
          if (partial) {
              return new Handlebars.SafeString(partial(context));
          }
          return '';
        });

      //#endregion
      //#region em utils
        //returns the user
        Handlebars.registerHelper('getUser', function(field = undefined) {
            if (field == 'character') {
              let char = game.user.character;
              return char != undefined ? {actor : char} : undefined;
            }
            else {return game.user;}
        });
        //returns the country/countries
        Handlebars.registerHelper('getCountry', function(name = undefined) {
            if (name != undefined) {
              return EmGlobalConfig[name];
            }
            else {return EmGlobalConfig.COUNTRIES;}
        });

      //#endregion
  }

//#endregion
//#region helper functions

    function registerSheets() {
      //registers all the item sheets binding them to their respective type
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
          //register the country
          Actors.registerSheet(
            "EM2E", 
            EmCountrySheet, 
            {
              types : [
                "country"
              ],
              makeDefault : true
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

    async function registerSettings() {
        /** loads the settings from a list and registers them and register the setting sub menus
         *  refer to the documentation for the structure explanation.
         */
        for (let module in EmSettings ) {
            //we cycle the systems / tabs
            for (let settingName in EmSettings[module] ) {
                //we cycle each setting and register it
                try { //we register the setting in a try catch in case some settings are badly formatted
                  await game.settings.register(module, settingName, EmSettings[module][settingName]);
                }
                catch(error) {console.error(error.message);}
            }
        }
    }

    async function checkCountries() {
        /** checks if the country folder is structured correctly and inserts the countries in the config list.
         * 
         */
        let folder = await Folder.get(EmGlobalConfig.FOLDERS["COUNTRIES"].id); //await getFolderByName(EmGlobalConfig.FOLDERS["LOOTBAGS"].name);
        let countries = folder.contents.filter(country => country.type == "country");
        //launches error if 
        if (folder.contents.length > countries.length) {
          alert(`the ${EmGlobalConfig.FOLDERS["COUNTRIES"].name} folder should only contain actor of type 'country'.`);
        }
        //launches error if no countries
        if (countries.length < 1) {
          alert(`the ${EmGlobalConfig.FOLDERS["COUNTRIES"].name} folder should contain at least one actor of type 'country'.`);
        }
        //doesn't matter the first error but not having countries will not set the countries config list
        //here we set all the countries in the config in a name : country dictionary structure since if you have the id you can get it easily
        for (let country of countries) {
          EmActorConfig.COUNTRIES[country.name] = country;
        }
    }

    async function checkFolders() {
        /** checks if the folders already exist in the adventure or if not it creates it
         * 
         */
        //we fetch the list of folders to check from the config
        let folder = undefined;
        //cycles all folders in the config and checks if they exist
        for (let configFolder of Object.values(EmGlobalConfig.FOLDERS) ) {
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
        let folder = await Folder.get(EmGlobalConfig.FOLDERS["LOOTBAGS"].id); //await getFolderByName(EmGlobalConfig.FOLDERS["LOOTBAGS"].name);
        let lootActorType = await game.settings.get("EM2E","defaultLootActor");
        let actor = await encaseItem(
            data.uuid,
            {
              name : 'lootbag',
              type : lootActorType,
              data : {
                folder : folder,
                permission : {
                  default : 2
                }
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

  Hooks.on('renderSettingsConfig', function(app, html, options) {
    /** we style the settings page to our needs
     *  
     */
    try {
      const systemTab = $(app.form).find('.tab[data-tab=system]'); //our system tab
      //#region assign classes to the settings
          //we initialize the empty variable
          let input = undefined;
          let element = undefined;
          let setting = undefined;
          let settingData = undefined;
          //we cycle the settings and set the css classes to the html objects
          for (let category in EmSettings) { //we cycle the setting categories
              for (let settingName in EmSettings[category]) { //we cycle the settings by name
                  settingData = EmSettings[category][settingName];
                  //we skip if it doesn't need to add classes or it doesn't have the property
                  if (settingData.cssClasses == undefined || settingData.cssClasses.length < 1) {continue;}
                  //we get the jquery element
                  setting = systemTab.find(`.form-group[data-setting-id="${category}.${settingName}"]`);
                  setting.addClass(settingData.cssClasses.join(" ")); //we add all the css classes of the config
              }
          }
      //#endregion
      //#region style setting classes
          //this is for manipulating the data, the styling is inside the setting.css file
          //the structure of the settings html is described in Doc_Foundry_UI
          //#region setting-array
              setting = systemTab.find(".setting-array"); //this is the div that contains the setting html elements
              setting.each(createArraySettingUI); //the function is in another library to prevent code clutter
          //#endregion
              
          


      //#endregion
    }
    catch(error) {
        console.error(error.message);
    }
  });

//#endregion

//#region start

  Hooks.once("init", async function() {
      //starting messages
      console.log("loading Eldritch Madness 2nd Edition");
      //we insert our Config into the Global Config object
      CONFIG.EmGlobalConfig = EmGlobalConfig;
      CONFIG.EmActorConfig = EmActorConfig;
      CONFIG.EmItemConfig = EmItemConfig;
      CONFIG.EmConfig = EmConfig; //deprecated
      console.warn("EmConfig is deprecated.");

      registerSheets();
      registerHandlebars();
      preloadHandlebarsTemplates();
  });

  Hooks.once("ready", async function() {
      //must be called before registering the settings or some settings may be malformed
      await buildSettings();
      //for now since we have data that depends on the data that is registered in the init hook we register the settings here.
      await registerSettings();
      //checks and create the folders
      await checkFolders();
      //checks if any country exists and sets the main countries in the config
      await checkCountries();

      // Set a new value for the setting
      //await game.settings.set("EM2E", "loot", "test");
  });

//#endregion 