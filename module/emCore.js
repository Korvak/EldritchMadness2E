import {EmConfig} from "./config.js"

export function translate(key) {
    /** translate a localization key in the form of a string by using the Foundry in-built localization system.
     * @param {string} key : the string to translate. 
     * 
     * @returns {string} : the translated string.
     */
    if (typeof(key) !== "string" ) {
        console.error(`${key} cannot be translated. It must be a string in order to be translated.`);
        return undefined;
    }
    return game.i18n.localize(key);
}

export async function getFolderByName(name) {
    /**
     * 
     */
    let folders = game.folders;
    for (let folder of folders) { //we cycle all folders and check if the name matches
        if (folder.name === name) { return await Folder.get(folder._id); } //if it does we use the id to return the element
    }
    return undefined;
}

export async function encaseItem(itemId, actorData = {id : "", name : "", type : "", data : {}, parent : undefined }) {
    /** gets an items and add a copy of it as a child of the actor.items collection.
     *  
     *  @param {string} itemId : the Foundry Id of the item to encase.
     *  @param {Object} actorData   : an object containing the data required to create the actor in case the id is absent.
     *      - in case we want to create a new actor we set the actorData properties to these
     *      @param {string} name : the name of the actor to create.
     *      @param {string} type : the type of the actor to create.
     *      @param {Object} data : the extra data fields to add. Name and type will be overwritten.
     *      @param {string} parent : the parent of the actor to create.
     *      - in case we want to encase the item into an existing actor we provide the id
     *      @param {string} id : the id of the actor to fetch.
     * 
     * 
     *  @returns {Actor} : returns the Foundry actor with the item contained in their actor.items collection.
     */
    try {
        //first we fetch the item
        let actor = undefined;
        itemId = itemId.replace("Item.", ""); //just in case it's a uuid which is made of the {type}.{id}
        let item = await Item.get(itemId); //we get the item data
        //we fetch or create the actor
        if (actorData.id != undefined && actorData.id.length > 0) {
            actor = await Actor.get(actorData.id);
        }
        else if (actorData.type != undefined && actorData.type.length > 0 ) {
            let data = actorData.data;
            data.name = actorData.name;
            data.type = actorData.type;
            actor = await Actor.create(data, {'parent' : actorData.parent}); 
        }
        else {
            console.error(`cannot encase ${itemId}. ActorId reference doesn't exist.`);
            return undefined;
        }
        //we create a copy of the item and parent it to the actor
        //now we add the item to the actor
        let copy = await Item.create({//to do so, we create a copy of the item and add it to the actor
            'name' : item.name,
            'type' : item.type
        }, {parent : actor});
        //now we add the data of the item to the copy
        await copy.update({
            'system' : item.system
        });
        //finally we return the actor
        return actor;
    }
    catch(error) {
        console.error(error.message);
        return undefined;
    }
}

export async function createToken(actor, coords, scene) {
    /** creates a token from a given actor | thanks for Zhell for showing me how to 
     *  @param {Actor} actor : the foundry actor from which we create the token
     *  @param {Object(x,y)} coords : the x and y canvas coordinates where we place the actor token
     *  @param {Scene} scene : the foundry canvas scene where we place the token
     * 
     *  @returns {Token} : an instance of a Foundry token object
     */
    if (!actor instanceof Actor || !scene instanceof Scene) {
        console.error(`${actor} or ${scene} are not instances of Foundry the Actor or Scene class.`);
        return undefined;
    }
    try {
        let tokenDoc = await actor.getTokenDocument();
        let tokendata = tokenDoc.toObject();
        //we set the coordinates
        tokendata.x = coords.x;
        tokendata.y = coords.y;
        //we create the token
        return await TokenDocument.create(tokendata, {parent: scene});
    }
    catch(error) {
        console.error(error.message);
        return undefined;
    }
}

export async function getCountryByName(name) {
    /** returns the country with the given name by searching the contents of the country folder.
     *  @param {string} name : the name of the country actor to find.
     * 
     *  @returns {country} : an actor of country type.
     */
    let folder = await Folder.get(EmConfig.FOLDERS["COUNTRIES"].id);
    if (folder == undefined) {
        console.error("country folder doesn't exist or is mismatched in the config.");
        return undefined;
    }
    //checks the actor name and not the system.name.
    for (let country of folder.content) {
        if (country.name == name) {return country;}
    } //in not found returns undefined
    return undefined;
}