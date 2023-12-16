//#region set other data

    //#region functions
    
        function _array_remove(array, func) {
            /** removes the first element in the array found through the function and returns it's index
             *  @param {Array} array : the array collection from which to remove the element
             *  @param {function} func : the find function. Returns a boolean
             * 
             *  @returns {wildcard} : the element removed or undefined if not found
             */
            let index = -1;
            let element = undefined;
            //we loop to find the element through the function given
            for (let i = 0; i < array.length; i++) {
                element = array[i];
                if (func(element) ) {
                    index = i; //we set the index
                    break; //we exit the loop
                }
            }
            //if the element was found, we remove it
            array.splice(index, 1); //if index = -1 then it does nothing
            return element; //returns the element or undefined
        }

        function _array_removeAll(array, func) {
            /** removes the first element in the array found through the function and returns it's index
             *  @param {Array} array : the array collection from which to remove the element
             *  @param {function} func : the find function. Returns a boolean
             * 
             *  @returns {Array} : the new array with all the elements removed
             */
            //then we first using a reverse function and get a new array
            return array.filter( (element) => {
                return !func(element);
            });
        }

    //#endregion

    //#region set data

        //we set the data
        Array.remove = _array_remove;
        Array.removeAll = _array_removeAll;

    //#endregion
//#endregion
//#region algo functions

    export function normalize(value, min, max) {
        /** returns the value normalized between the min and max
         *  @param {number} value : the value to normalize
         *  @param {number} min : the min value of the normalization range
         *  @param {number} max : the max value of the normalization range
         * 
         *  @returns {number} : returns the normalized value: a number between 0 and 1 included 
         */
        return (value - min) / (max - min);
    }

    export function normalizeToRange(value, min, max, newMin, newMax) {
        /** returns the value normalized between the new min and max
         *  @param {number} value : the value to normalize
         *  @param {number} min : the min possible value of the value
         *  @param {number} max : the max possible value of the value
         *  @param {number} newMin : the min value of the new normalization range to apply
         *  @param {number} max : the max value of the new normalization range to apply
         * 
         *  @returns {number} : returns the normalized value: a number between 0 and 1 included 
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

//#endregion
//#region data fetch functions

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

    export function overwriteObjectFields(base, data) {
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
                return overwriteObjectFields(base[key], value );
            }
            else {base[key] = value;}
        }
        return base;
    }

//#endregion



export function test() {console.log("this is a test");}