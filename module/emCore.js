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

export async function encaseItem({itemId, actorId = "", actorName = "", actorType = ""}) {
    /** gets an items and add a copy of it as a child of the actor.items collection.
     *  
     *  @param {string} itemId : the Foundry Id of the item to encase.
     *  @param {Optional | string} actorId : the Foundry Id of the actor to add the item to.
     *  @param {Optional | string} actorName : the name of the actor to create in case the actorId is empty.
     *  @param {Optional | string} actorType : the type of actor to create in case the actorId is empty.
     * 
     *  @returns {Actor} : returns the Foundry actor with the item contained in their actor.items collection.
     */
    try {
        //first we fetch the item
        let actor = undefined;
        itemId = itemId.replace("Item.", ""); //just in case it's a uuid which is made of the {type}.{id}
        let item = await Item.get(itemId); //we get the item data
        //we fetch or create the actor
        if (actorId.length > 0) {
            actor = await Actor.get(actorId);
        }
        else if (actorType.length > 0 ) {
            actor = await Actor.create({
                'name' : actorName,
                'type' : actorType
            }); 
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

export async function createLootActor(canvas, coords, itemId, lootActorType) {
    /**
     * 
     */
    try {
        //first we fetch the item
        itemId = itemId.replace("Item.", ""); //just in case it's a uuid which is made of the {type}.{id}
        let item = await Item.get(itemId); //we get the item data
        console.warn(item, item.sheet);
        //then we create the actor
        let loot = await Actor.create({
            'name' : 'loot bag',
            'type' : lootActorType
        });
        //now we add the item to the actor
        let copy = await Item.create({//to do so, we create a copy of the item and add it to the actor
            'name' : item.name,
            'type' : item.type
        }, {parent : loot});
        //now we add the data of the item to the copy
        await copy.update({
            'system' : item.system
        });
        //finally we can position the loot actor
        let scene = canvas.scene;
        console.warn(scene);
        await scene.createEmbeddedDocument("Token", {
            'name' : loot.name,
            'actorId' : loot._id,
            'x' : coords.x,
            'y' : coords.y
        });
    }
    catch(error) {
        console.error(error.message);
    }
    


}