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