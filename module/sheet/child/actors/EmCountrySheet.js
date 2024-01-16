import EmBaseActorSheet from "../../actors/EmBaseActorSheet.js"
import {getCountryByName} from "../../../emCore.js"

export default class EmCountrySheet extends EmBaseActorSheet {
    /** since a country has its own functionality and logic, it deserves another sheet class
     * 
     */

    constructor(...args) {
        super(...args);
        this.singletonCheck();
    }

    async singletonCheck() {
        /** singleton check based on the name.
         * 
         */
        const self = this.getData();
        //now we check if the actor already exists in the country folder and it's not them.
        let country = await getCountryByName(self.actor.name);
        if (country != undefined && country._id != self.actor._id) { //then it violates the singleton rule
            //we notify the user and then delete the actor
            alert(`Countries are singletons with unique names.\nPlease change or remove ${country._id} if you want to create another country named : ${country.name}`);
            this.render(false); //closes the sheet 
            //then we delete the element
            const actor = await Actor.get(self.actor._id);
            await actor.delete();
        }
    }


}