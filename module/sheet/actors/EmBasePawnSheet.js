import EmBaseActorSheet from "./EmBaseActorSheet.js"
import {treeBreadthSearch} from "../../libraries/utils.js"
import {setInputsFromData, selectOptionsFromData, setBarValue} from "../../libraries/htmlUtils.js"
import {translate} from "../../libraries/emCore.js"
import { getSetting } from "../../configs/settings.js"
import { EmLogger, Logger } from "../../libraries/emLogger.js"
import { EmGlobalConfig } from "../../configs/globalConfig.js"

export default class EmBasePawnSheet extends EmBaseActorSheet {
    
    //#region base methods

        constructor(...args) {
            super(...args);
            //allows calling async function and almost everything works out
            if(this.bodypartsCount() < 1) {this._createDefaultAnatomy();}
        }

        get template() {
            return `systems/EM2E/templates/sheets/pawns/${this.actor.type}-sheet.hbs`;
        }

        activateListeners(html) {
            //#region anatomy page events
                //this works for every pawn or child of the pawn class
                html.find(".em_anatomyNode").click(this._displayBodypartHtml.bind(this));
                html.find(".em_anatomyDeleteIcon").click(this._deleteAnatomyHtml.bind(this));
                //$(".em_anatomyDeleteIcon").click(this._deleteAnatomyHtml.bind(this));
            //#endregion
            //#region bodypart events
                //this may be specific to the character sheet
                html.find("#em_bodypart_id").click(this._renderBodypartHtml.bind(this));
                let createNewBodypart = async function(event) {await this._addAndDisplayAnatomy(event);};
                html.find("#em_bodypart_createBtn").click(createNewBodypart.bind(this) );
                //we set it so that if we change the name of the bodypart, it also changes the name of the tree
                html.find("#em_bodypart_name").change(this._changeBodypartName.bind(this) );
                //we call the reparent function when the attachedTo changes
                html.find("#em_bodypart_attached").change( this._reparentBodypart.bind(this) );
            //#endregion
            //at the end of the function we call the parent's function
            this._activateTestListeners(html);
            super.activateListeners(html);
        }


    //#endregion
    //#region event methods

        async _onClose(event) {await super._onClose(event);}

        async _onStopDrag(event) {await super._onStopDrag(event);}

    //#endregion
    //#region util methods

        _getActorAdditionalSaveData() {
            /** returns a json object with all the data to add when saving the actor data
             * @returns {object} : returns a json to merge, it includes the must have data to save everytime the actor is saved
             */
            return super._getActorAdditionalSaveData();
        }

    //#endregion
    //#region start methods
        
        async _createDefaultAnatomy() {
            // creates the default anatomy when missing
            await this.addBodypart({
                name : "root",
                attachedTo : undefined, 
                partType : await getSetting( "defaultRootType" )
            });
        }

        async _onStart() {
            await super._onStart();
            let html = this.element.find("form");
            //we set the default data if needs loading
            this._displayBodypart(this.getAnatomy().tree.id);
        }

        _getSheetMethods() {
            /** called in getData returns an object with all the function callable from the ActorSheet by using the fetch handlebar
             *  @returns {Object} : returns a dictionary key : function 
             */
            let funcs = super._getSheetMethods();
            //we add the function we want here
            return funcs;
        }

    //#endregion
    //#region anatomy

        //#region UI

            //#region events


            //#endregion

            async displayBodypart(id) {
                let bodypart = await this.getBodypart(id);
                //we check if the bodypart exists
                if (bodypart === undefined || bodypart === null) {
                    EmLogger.log({
                        msg : "ERRORS.MISSING_COLLECTION_ITEM_ERROR",
                        level : Logger.LEVELS.WARNING,
                        args : ["bodyparts", id]
                    });
                    return false;
                }
                //if it does we try to fetch the partial and display it
                let partial = await this.renderItemPartial(bodypart);
                //we fetch the partial view container
                let html = this.element.find( 
                    await getSetting("bodypartUiContainer")
                );
                //then add the html content of the partial to the container
                html.append( $(partial) );
                return true;
            }

        //#endregion
        //#region fetch

            getAnatomy() {
                return this.getActorData().anatomy;
            }

            getRoot() {
                /** returns the root of the anatomy based on the viewType selected.
                 * @returns {string} : returns the id of the bodypart that is the root of the view type
                */
                let anatomy = this.getAnatomy();
                switch(anatomy.viewType) {
                    case "tree" : { //we return the id of the tree root node
                        return this.getBodypart(anatomy.tree.id);
                    }
                    case "chart" : {return undefined;}
                    default : {return undefined;}
                }
            }

            bodypartsCount() {
                return Object.keys(this.getBodyparts()).length;
            }

            getBodyparts() {
                return this.getActorData().anatomy.bodyparts;
            }



        //#endregion
        //#region CRUD

            //#region CRUD helper methods

                async _deleteAnatomyNode(node) {
                    /** a recursive function that deletes an anatomy tree node references in the bodyparts collection along with all its children
                     * @param {AnatomyNode} node : an anatomy node with an Id and a children collection of Node objects.
                     */
                    //we delete the item in the bodyparts collection
                    await this._updateActorCollection(
                        "actor.system.anatomy.bodyparts",
                        {
                            key : node.id,
                            value : undefined
                        },
                        EmGlobalConfig.OPERATIONS.CRUD.DELETE
                    );
                    //we delete the html node
                    let nodeElement = this.element.find(`#${node.id}`);
                    nodeElement.remove();
                    //we delete all children
                    for (let child of node.children) {
                        await this._deleteAnatomyNode(child);
                    }
                }

            //#endregion


            async getBodypart(id) {
                return await this.getBodyparts()[id];
            }

            async addBodypart({name ,attachedTo, partType, extraData = {}, display = false}) {
                /** creates a bodypart item and adds it to the bodyparts collection 
                 * and creates it's corresponding node in the anatomy tree
                 * @param {string} name : the name of the new bodypart
                 * @param {ID} attachedTo : the string ID of the bodypart item it will be attached to
                 * @param {partType} partType : the type of the part of the new bodypart
                 * 
                 * @returns {ItemSheet} : returns the bodypart itemSheet data.
                 */
                if (attachedTo === undefined && this.bodypartsCount() > 0) {
                    EmLogger.log({
                        msg : "ERRORS.ANATOMY.MISSING_ANATOMY_PARENT_ERROR",
                        level : Logger.LEVELS.ERROR,
                        args : [name, this.actor._id]
                    });
                    return undefined;
                }
                //since bodyparts are contained in the bodyparts object we use this method
                let bodypart = await this.createItemInObject({
                    field : "actor.system.anatomy.bodyparts",
                    name : name,
                    type : "bodypart",
                    itemData : extraData
                });
                let anatomy = this.getAnatomy();
                let bodypartData = bodypart.system;
                //once created we have to insert it into the anatomy tree
                if (typeof attachedTo === "string") {
                    let parent = treeBreadthSearch(anatomy.tree, "id", bodypartData.attachedTo);
                    parent.children.push({ //we create a new TreeNode item and add it to the parent
                        id : bodypart._id,
                        name : bodypart.name,
                        children : []
                    });
                }
                //since we get it from the items and we create an item, then it must 2 if it's not the root
                else if (this.bodypartsCount() == 1) { //if it's the first element, then we allow it to be detached.
                    anatomy.tree["id"] = bodypart._id;
                    anatomy.tree["name"] = name;
                    anatomy.tree["children"] = [];
                }
                //we save the anatomy
                await this._saveActorData({
                    system : {
                        anatomy : anatomy
                    }
                });
                if (display) { //then we display the created bodypart in the pawn sheet
                    await this.displayBodypart(bodypart._id);
                }
                //finally we return the element data
                return bodypart;
            }

            //pending
            async deleteBodypart(id) {
                /** deletes an anatomy part by removing it and its children from the anatomy tree and by removing them from the actor.items
                 * @param {string} id : a string representing the id of the anatomy node object.
                 * 
                 * @returns {boolean} : wether the operation succeeded or not
                 */
                try {
                    if (id === this.getRoot()._id) {//we cannot delete the root
                        EmLogger.log({
                            msg : "ERRORS.ANATOMY.ROOT_DELETION_EXCEPTION",
                            level : Logger.LEVELS.WARNING,
                            args : [id]
                        });
                        return false;
                    }
                    let bodypart = await this.getBodypart(id);
                    if (bodypart === undefined) { //in case it doesn't exist we return false and log and error
                        EmLogger.log({
                            msg : "ERRORS.MISSING_COLLECTION_ITEM_ERROR",
                            level : Logger.LEVELS.WARNING,
                            args : ["bodypart", id]
                        });
                        return false;
                    }
                    let bodypartData = bodypart.system;
                    let element = undefined;
                    //#region detach from parent and get node
                        //we check if it's attached to a parent or it's parentless
                        if (bodypartData.attachedTo === undefined || bodypartData.attachedTo === null) {
                            element = treeBreadthSearch(anatomy.tree, "id" , bodypart._id);
                        }
                        else {
                            //first we remove it in the tree by removing it from the parent
                            let parent = treeBreadthSearch(anatomy.tree, "id", bodypartData.attachedTo);
                            //we remove the element from the parent's children
                            for (let i = 0;i < parent.children.length;i++) {
                                if (parent.children[i].id == bodypart._id) {
                                    element = parent.children[i];
                                    parent.children.splice(i,1);
                                    break;
                                }
                            }
                        }
                    //#endregion
                    //we remove the element and it's children from the parts array
                    await this._deleteAnatomyNode(element);
                    //after we removed the bodyparts from the part collection, we update the anatomy tree

                    //then we save everything
                    await this._saveActorData({
                        system : {
                            anatomy : anatomy
                        }
                    }); 
                    return true;
                }
                catch(error) {
                    EmLogger.log({
                        msg : error.message,
                        level : Logger.LEVELS.ERROR
                    });
                    return false;
                }
            }

        //#endregion
        
        async reparentAnatomyNode(id, to) {
            /** reparents an existing node to another node in the anatomy tree
             * @param {string} id : the bodypart id to reparent
             * @param {string} to : the bodypart id of the new parent
             */
            try {
                //first we check if we are allowed to do operations on it
                if (id === this.getRoot()._id ) { //getRoot returns a string ID
                    EmLogger.log({
                        msg : "ERRORS.ANATOMY.REPARENT_ANATOMY_ROOT_EXCEPTION",
                        level : Logger.LEVELS.WARNING
                    });
                    return false;
                }
                else if (id === to) {
                    EmLogger.log({
                        msg : "ERRORS.ANATOMY.REPARENT_ANATOMY_TO_ITSELF_EXCEPTION",
                        level : Logger.LEVELS.WARNING
                    });
                    return false;
                }
                //first we fetch the bodypart from it's id
                let bodypart = this.getBodypart(id);
                if (bodypart === undefined) {return false;}
                //in case it's already attached to the parentTo then we are done
                if (bodypart.system.attachedTo == to) {return true;}
                //then check if the new parent exists
                let parentTo = this.getBodypart(to); //this is an item
                if (parentTo === undefined) {return false;}
                //then we get data we require
                let bodypartData = bodypart.system;
                let anatomy = this.getAnatomy();
                //now we must get the parent node and the parentToNode
                let parentNode = treeBreadthSearch(anatomy.tree, "id", bodypartData.attachedTo);
                let parentToNode = treeBreadthSearch(anatomy.tree, "id", parentTo._id);
                //we get the element and it's index
                let index = parentNode.children.findIndex(node => node.id == bodypart._id);
                //in case it didnt' find it, then it fails miserably
                if (index < 0 || index >= parentNode.children.length) {
                    EmLogger.log({
                        msg : "ERRORS.ANATOMY.ANATOMY_PARENT_MISMATCH_REMOVAL",
                        level : Logger.LEVELS.WARNING,
                        args : [id, parentNode.id]
                    });
                    return false;
                }
                let element = parentNode.children[index]; //we need this since it's the node we want to add to the parentTo
                //now we check if we can reparent it since we cannot reparent a node to one of it's children
                if (treeBreadthSearch(element, "id", parentToNode.id) !== undefined ) {
                    EmLogger.log({
                        msg : "ERRORS.ANATOMY.REPARENT_PARENT_TO_CHILD_EXCEPTION",
                        level : Logger.LEVELS.WARNING
                    });
                    return false;
                }
                //otherwise we remove the element from the parent
                parentNode.children.splice(index,1);
                //we reparent it
                parentToNode.children.push(element);
                //then we save the bodypart attached to
                bodypartData.attachedTo = to;
                bodypart.update({
                    data : {
                        attachedTo : to
                    }
                });
                //finally we save the actor data
                this._saveActorData({
                    system : {
                        anatomy : anatomy
                    }
                });
                return true;
            }
            catch(error) {
                EmLogger.log({
                    msg : error.message,
                    level : Logger.LEVELS.ERROR
                });
                return false;
            }
        }
        

    //#endregion
    //#region test

        _displayBodypart(id) {
            console.warn("displaying bodypart");
            let bodypart = this._getBodypart(id);
            if (!bodypart) {return false;}
            let partial = this.renderItemPartial(bodypart);
            //html part
            let html = this.element.find("#em_bodypart_dataContainer");
            html.append( $(partial) );
            return true;
        }

        _activateTestListeners(html) {
            const self = this;
            html.find("#create-test").click(async function() {
                await self._createTest();
            });
            html.find("#display-test").click()
        }

    //#endregion

}