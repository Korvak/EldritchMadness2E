export function translate(key) {
    /**
     * 
     */
    if (typeof(key) !== "string" ) {
        console.error(`${key} cannot be translated. It must be a string in order to be translated.`);
        return undefined;
    }
    return game.i18n.localize(key);
}

export function normalize(value, min, max) {
    /**
     * 
     */
    return (value - min) / (max - min);
}

export function normalizeToRange(value, min, max, newMin, newMax) {
    /**
     * 
     */
    ( ( (value - min) / (max - min) ) * (newMax - newMin) ) + newMin;
}

export function treeDepthSearch(tree, key, value) {
    /** does a tree breadth search to find the node with the given key value pair. Searches by depth.
     * 
     * @param {Node} tree : the root of the tree. Must have a 'children' property
     * @param {string} key : the property to search
     * @param {wildcard} value : the value to check
     * 
     * @returns {Node} : returns the node that has the following key : value pair or undefined if not found
     */ 
    let result = undefined;
    if (tree[key] == value) {return tree;}
    for (let node of tree.children) {
        result = treeDepthSearch(node, key, value);
        if (result !== undefined) {return result;}
    }
    return result;
}

export function treeBreadthSearch(tree, key, value) {
    /** does a tree breadth search to find the node with the given key value pair. Searches level by level.
     * 
     * @param {Node} tree : the root of the tree. Must have a 'children' property
     * @param {string} key : the property to search
     * @param {wildcard} value : the value to check
     * 
     * @returns {Node} : returns the node that has the following key : value pair or undefined if not found
     */ 
    let queue = [tree];
    let node = undefined;
    while( queue.length > 0 ) {
        node = queue.shift();
        if (node[key] === value) {return node;}
        queue.push(...node.children);
    }
    return undefined;
}

export function getValueFromFields(data, field , separator = ".") {
    /** basically makes a.b.c return data[a][b][c]
     * 
     * @param {Object} data : an object of objects with the desired data in it
     * @param {string} field : a series of fields separated by the given separator
     * @param {string} separator : the separator character used to split the fields
     */
    try {
        let fields = field.split(separator);
        for (let i = 0; i < fields.length; i++) {data = data[fields[i]];}
        return data;
    }
    catch(error) {
        console.error(error.message); 
        return undefined;
    }
}

export function fieldToObject(field,value, start = {}, separator = ".") {
    /** transform a string separated by a character into an object of objects with the leaf having the provided value
     * this is used for the actor.update and item.update since it doesn't care about omitted values
     * and only cares about modified ones.
     * 
     * @param {string} field : the string separated by a certain character that will be converted
     * @param {wildcard} value : the value to set to the leaf of the object of objects
     * @param {Object} start : the starting object. If not provided it will be an empty one
     * @param {string} separator : the string that separates each object of the field. A '.' by default
     * 
     * @returns {Object} : returns an object of objects with a leaf with the provided value as value
     */
    let current = start;
	let fields = field.split(separator);
    let key = "";
    for (let i = 0;i < fields.length-1;i++) {
    	key = fields[i];
        current[key] = {};
        current = current[key];
    }
    current[fields[fields.length-1] ] = value;
    return start;
}

export function overwiteObjectFields(base, data) {
    /** recieves an object and the data to overwrite and overwrites recursively all the keys  present in the data with the data's values 
     * 
     * @param {Object} base : the object that will be overwritten
     * @param {Object} data : the object with the data that will be written
     * 
     * @returns {Object} : returns the base object
     */
    let value = undefined;
    for (let key of Object.keys(data) ) {
        value = data[key];
        if (typeof value === "object" && base[key] !== undefined) {
            return overwriteAllFields(base[key], value );
        }
        else {base[key] = value;}
    }
    return base;
}

export function setInputsFromData(data, inputs) {
    /** fetches the data by using the input's name and then sets the data of the inputs
     * 
     * @param {Object} data : an object of objects that contains the desired data. 
     *                          Usually corresponds to the actor/item or the system objects
     * @param {Jquery} inputs : the jquery collection of inputs to set 
     */
    inputs.each(function() {
        //first we get the corresponding field
        let element = $(this);
        let name = element.attr('name');
        let value = getValueFromFields(data, name );
        element.val( value );
    });
}

export function test() {console.log("this is a test");}