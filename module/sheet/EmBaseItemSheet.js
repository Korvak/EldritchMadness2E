import {translate, treeBreadthSearch, fieldToObject, overwriteObjectFields, setInputsFromData, getValueFromFields} from "../utils.js"
import {toggleDropdown, toggleReadonly, renderBar, setBarValue, searchByTags , toggleBtnState } from "../htmlUtils.js"

export default class EmBaseItemSheet extends ItemSheet {

    //#region base methods

        get template() {
            return `systems/EM2E/templates/sheets/items/${this.item.type}-sheet.hbs`;
        }


        getData() {
            let data = super.getData();
            data.CONFIG = CONFIG;
            //system holds all the data
            console.log("item",data);
            return data;
        }


        activateListeners(html) {
            const self = this;
            //#region html events

                html.find(".em_field").each(function() {
                    $(this).get(0).onchange = self._saveItemFields.bind(self);
                });

            //#endregion
            
        }

    //#endregion
    //#region event methods

        async _saveItemFields(event) {
            /** fetches the data from the called element and calls this._updateItemField to update the item
            */
            event.preventDefault();
            let element = $(event.currentTarget);
            //if it's a select we instead get the selected's element data-save attribute
            let val = element.prop("tagName") == "select" ? 
                element.find(":selected").get(0).dataset.tosave
                : element.val();
            await this._updateItemField(element.attr('name'), val );
        }

    //#endregion
    //#region helper methods

        async _updateItemField(field,value) {
            /** fetches and updates an owned item field with the given value
             * @param {string} field : the name of the field to modify
             * @param {wildcard} value : the value to use to update the field
            */
            try {
                //we transform the field into an object of objects for saving
                let toSave = fieldToObject(field, value);
                //we remove the header since it's useless
                if (toSave["item"] != undefined) {toSave = toSave["item"];}
                await this.item.update(toSave);
                return true;
            }
            catch(error) {
                console.error(error.message);
                return false;
            }
        }

        getItemData() {
            return this.getData().item.system;
        }

    //#endregion
    
}