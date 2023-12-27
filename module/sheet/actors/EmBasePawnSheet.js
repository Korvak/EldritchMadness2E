import {EmBaseActorSheet} from "./EmBaseActorSheet.js"

export default class EmBasePawnSheet extends EmBaseActorSheet {
    
    //#region base methods

        constructor(...args) {
            super(...args);
            //allows calling async function and almost everything works out
            if(this.bodypartsCount() < 1) {this._createDefaultAnatomy();}
        }

        get template() {
            console.log("actor", this.getData() );
            console.log("actorItems", this.getData().items);
            return `systems/EM2E/templates/sheets/actors/baseActor-sheet.hbs`;
        }

        activateListeners(html) {
            //at the end of the function we call the parent's function
            super.activateListeners(html);
        }


    //#endregion
    //#region start method
        
        async _createDefaultAnatomy() {
            // creates the default anatomy when missing
            await this.addAnatomy({
                name : "root",
                attachedTo : undefined, 
                partType : CONFIG.EmConfig.anatomy.ROOT_PART_TYPE
            });
        }

        _onStart() {
            super._onStart();
            let html = this.element.find("form");
            //we set the default data if needs loading
            this._displayBodypart(this.getAnatomy().tree.id);
        }



    //#endregion
    //#region anatomy

        //#region event methods

            async _renderBodypartHtml(event) {
                let element = event.currentTarget;
                await this.renderOwnedItem(element.dataset.id);
            }   
            
            _displayBodypartHtml(event) {
                //displays a bodypart in the actorSheet by fetching the bodypart id from the dataset
                let element = $(event.currentTarget);
                let id = element.get(0).dataset.id;
                this._displayBodypart(id);
            }

            async _addAndDisplayAnatomy(event) {
                let element = $(event.currentTarget);
                let bodypart = await this.addAnatomy({
                    name : `${translate(CONFIG.EmConfig.anatomy.DEFAULT_NAME)}_${this.bodypartsCount()}`,
                    attachedTo : element.get(0).dataset.id,
                    partType : CONFIG.EmConfig.anatomy.DEFAULT_PART_TYPE
                });
                if (bodypart !== undefined) {this._displayBodypart(bodypart._id);}
            }

            async _deleteAnatomyHtml(event) {
                event.preventDefault();
                let element = $(event.currentTarget);
                await this.deleteAnatomy(element.parent().get(0).dataset.id);
            }

            async _changeBodypartName(event) {
                //first we get the input
                let element = this.element.find("#em_bodypart_name");
                //then we need the id of the bodypart
                let container = element.parents(".em_itemContainer");
                let id = container.find(".em_itemIdContainer").get(0).dataset.id;
                //then we get the anatomy node
                let node = treeBreadthSearch(this.getActorData().anatomy.tree, 'id', id);
                //we set the node name
                node.name = element.val();
                //then we save the data
                await this._saveActorData({
                    system : {
                    anatomy : {
                            tree : this.getAnatomy().tree
                        } 
                    }
                });
            }

            async _reparentBodypart(event) {
                event.preventDefault();
                let element = $(event.currentTarget);
                let container = element.parents(".em_itemContainer");
                let id = container.find(".em_itemIdContainer").get(0).dataset.id;
                let to = element.find(":selected").get(0).dataset.tosave;
                await this.reparentAnatomyNode(id, to);
            }


        //#endregion

        getAnatomy() {
            /** returns the actor anatomy object. */
            return this.getActorData().anatomy;
        }

        bodypartsCount() {
            /** returs the number of bodyparts belonging to the actor*/
            return Object.keys(this.getBodyparts() ).length;
        }

        getBodyparts() {
            /** returns a collection of all the bodypart items belonging to the actor*/
            return this.getOwnedItems({tags : ["bodypart"]});
        }

        getRoot() {
            /** returns the root of the anatomy based on the viewType selected.
             * @returns {string} : returns the id of the bodypart that is the root of the view type
            */
            let anatomy = this.getAnatomy();
            switch(anatomy.viewType) {
                case "tree" : { //we return the id of the tree root node
                    return this.getOwnedItem(anatomy.tree.id);
                }
                case "chart" : {return undefined;}
                default : {return undefined;}
            }
        }

        async addAnatomy({name ,attachedTo, partType, extraData = {} }) {
            /** creates a bodypart item and adds it to the actor items and creates it's corresponding node in the anatomy tree
             * @param {string} name : the name of the new bodypart
             * @param {ID} attachedTo : the string ID of the bodypart item it will be attached to
             * @param {partType} partType : the type of the part of the new bodypart
             * 
             * @returns {ItemSheet} : returns the bodypart itemSheet data.
             */
            if (attachedTo === undefined && this.bodypartsCount() > 0) {
                console.error( translate(CONFIG.EmConfig.ERRORS.MISSING_ANATOMY_PARENT_ERROR) );
                return undefined;
            }
            let anatomy = this.getAnatomy();
            //We create the bodypart and data to it
            let bodypart = await this.createOwnedItem(name, 'bodypart', 
            {
                'system' : {
                    'partType' : partType,
                    'attachedTo' : attachedTo
                }
            });
            //we get the data
            let bodypartData = bodypart.system;
            //then we add it to the view types
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
            
            //finally we return the element data
            return bodypart;
        }

        async _deleteAnatomyNode(node) {
            /** a recursive function that deletes an anatomy tree node references in the parts collection along with all its children
             * @param {AnatomyNode} node : an anatomy node with an Id and a children collection of Node objects.
             */
            //we delete the item in the items collection
            await this.removeOwnedItem(node.id);
            let nodeElement = this.element.find(`#${node.id}`);
            nodeElement.remove();
            for (let child of node.children) {
                await this._deleteAnatomyNode(child);
            }
        }

        async deleteAnatomy(id) {
            /** deletes an anatomy part by removing it and its children from the anatomy tree and by removing them from the actor.items
             * @param {string} id : a string representing the id of the anatomy node object.
             * 
             * @returns {boolean} : wether the operation succeeded or not
             */
            try {
                //first we check if we are allowed to do operations on it
                if (id === this.getRoot()._id) {
                    console.error("cannot delete the anatomy root.");
                    return false;
                }
                //then we fetch the bodypart and check if it exists
                let bodypart = this.getOwnedItem(id);
                if (bodypart === undefined) {return false;}
                let bodypartData = bodypart.system;
                let anatomy = this.getAnatomy();
                
                let element = undefined;
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
                console.error(error.message);
                return false;
            }
        }

        async reparentAnatomyNode(id, to) {
            /** reparents an existing node to another node in the anatomy tree
             * @param {string} id : the bodypart id to reparent
             * @param {string} to : the bodypart id of the new parent
             */
            try {
                //first we check if we are allowed to do operations on it
                if (id === this.getRoot() ) { //getRoot returns a string ID
                    console.error("cannot reparent the anatomy root.");
                    return false;
                }
                else if (id === to) {
                    console.error("cannot reparent a node to itself");
                    return false;
                }
                //first we fetch the bodypart from it's id
                let bodypart = this.getOwnedItem(id);
                if (bodypart === undefined) {return false;}
                //in case it's already attached to the parentTo then we are done
                if (bodypart.system.attachedTo == to) {return true;}
                //then check if the new parent exists
                let parentTo = this.getOwnedItem(to); //this is an item
                if (parentTo === undefined) {return false;}
                //then we get data we require
                let bodypartData = bodypart.system;
                let anatomy = this.getAnatomy();
                //now we must get the parent node and the parentToNode
                let parentNode = treeBreadthSearch(anatomy.tree, "id", bodypartData.attachedTo);
                let parentToNode = treeBreadthSearch(anatomy.tree, "id", parentTo._id);
                //we get the element and it's index
                let index = parentNode.children.findIndex(node => node.id == bodypart._id);
                if (index < 0 || index >= parentNode.children.length) {
                    //in case it didnt' find it, then it fails miserably
                    console.error(`cannot remove ${id} from the ${parentNode.id} node since it doesn't exist as it's child.`);
                    return false;
                }
                let element = parentNode.children[index]; //we need this since it's the node we want to add to the parentTo
                //now we check if we can reparent it since we cannot reparent a node to one of it's children
                if (treeBreadthSearch(element, "id", parentToNode.id) !== undefined ) {
                    console.error("cannot reparent a node to one of its children.");
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
                console.error(error.message);
                return false;
            }
        }

        _displayBodypart(id) {
            /** visually loads the bodypart if the data exists
             * 
             * @param {string} id : the id of the bodypart item contained in the anatomy.parts collection
             * 
             * @returns {boolean} : wether the data was found or not
             */
            try {
                let element = undefined;
                let bodypart = this.getOwnedItem(id); //this is the Item Sheet
                if (bodypart === undefined || bodypart === null) {return false;}
                let data = {'item' : bodypart};
                let html = this.element.find("#em_bodypart_dataContainer");
                //#region header
                element = this.element.find("#em_bodypart_id");
                if (element.length > 0) {
                    element.text(id);
                    element.get(0).dataset.id = id;
                }
                element = this.element.find("#em_bodypart_createBtn");
                if (element.length > 0) {
                    element.get(0).dataset.id = id;
                    element.find("#em_bodypart_createIcon").get(0).dataset.id = id;
                }
                //#endregion
                //set the values
                element = html.find(".em_field");
                setInputsFromData(data, html.find("input.em_field") );
                selectOptionsFromData(data, html.find("select.em_field") );
                //we select the attachedTo part 
                let attachedSelect = html.find("#em_bodypart_attached");
                //we have to show all options or else it will end up hiding all options while scrolling
                attachedSelect.find("option").show(); 
                //we hide the bodypart's option
                attachedSelect.find(`#attach_${bodypart._id}`).hide();
                //attachedSelect.find(":selected").prop("selected", false); //we unselect the last selected if there is any
                //attachedSelect.find(`#attach_${bodypart.system.attachedTo}`).prop("selected", true);
                //set health | durability
                element = html.find("#em_item_durabilityBar");
                setBarValue( element,
                    {
                        'val' : bodypart.system.durability.value,
                        'max' : bodypart.system.durability.max
                    }, 
                    {
                        'val' : bodypart.system.durability.temp,
                        'max' : bodypart.system.durability.maxTemp
                    }
                );
                //stil uninplemented
                this._displayBodypartConditions(id);
                return true;
            }
            catch(error) {
                console.error(error.message); 
                return false;
            }
        }

        _displayBodypartConditions(id) {
            //fetches all the conditions related to the bodypart id
            //returns 
        }

    //#endregion


}