export function translate(key) {
    if (typeof(key) !== "string" ) {
        console.error(`${key} cannot be translated. It must be a string in order to be translated.`);
        return undefined;
    }
    return game.i18n.localize(key);
}