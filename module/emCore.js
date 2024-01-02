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
    }
    catch(error) {
        console.error(error.message);
    }
    


}