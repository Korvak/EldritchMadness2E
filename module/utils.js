export function translate(key) {
    if (typeof(key) !== "string" ) {
        console.error(`${key} cannot be translated. It must be a string in order to be translated.`);
        return undefined;
    }
    return game.i18n.localize(key);
}

export function normalize(value, min, max) {
    return (value - min) / (max - min);
}

export function normalizeToRange(value, min, max, newMin, newMax) {
    ( ( (value - min) / (max - min) ) * (newMax - newMin) ) + newMin;
}

export function treeDepthSearch(tree, key, value) {
    let result = undefined;
    if (tree[key] == value) {return tree;}
    for (let node of tree.children) {
        result = treeDepthSearch(node, key, value);
        if (result !== undefined) {return result;}
    }
    return result;
}

export function treeBreadthSearch(tree, key, value) {
    let queue = [tree];
    let node = undefined;
    while( queue.length > 0 ) {
        node = queue.shift();
        if (node[key] === value) {return node;}
        queue.push(...node.children);
    }
    return undefined;
}



export function test() {console.log("this is a test");}