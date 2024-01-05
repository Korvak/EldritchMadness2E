/**
 * 
 * in case you want to get a folder you do @param {await Folder.get(id)}
 * 
 * we can also change an item folder by doing @param {item.data.update({folder : folderID});}
 * 
 * in case you want to get a compendium it's in the game.packs collection. You can search for it and
 * to retrieve it you can do game.packs.get(compendium_name)
 */
/**
 *  in case we want to create a token from an actor given a canvas we do
 * 
 * let tokenDoc = await actor.getTokenDocument();
        let tokendata = tokenDoc.toObject();
        //we set the coordinates
        tokendata.x = data.x;
        tokendata.y = data.y;
        //we create the token
        let token = await TokenDocument.create(tokendata, {parent: canvas.scene});
 * 
 */