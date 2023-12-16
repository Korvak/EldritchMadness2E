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