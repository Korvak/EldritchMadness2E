import EmBasePawnSheet from "./EmBasePawnSheet.js"
import { findModule } from "../../configs/settings.js";

export default class EmBaseCharacterSheet extends EmBasePawnSheet {

        //#region base methods

            constructor(...args) {
                super(...args);
                //makes sure that the flipbook animation is always performed on open, even when starting the application
                console.warn("called constructor");
                this.getActorData().flipbook.anim = true;
            }
        
            static get defaultOptions() {
                return mergeObject(super.defaultOptions, 
                    {
                        width: 582,
                        height : 476,
                        classes : ["em_actorSheet"]
                });
            }
        
            get template() {
                //there is only one character sheet for all types : human, beast and robot
                return `systems/EM2E/templates/sheets/chars/baseChar-sheet.hbs`;
            }

            activateListeners(html) {
                /** super important !!! where we bind all the events that are not in the flipbook
                 * 
                 */
                const self = this;
                //#region flipbook events
                let flipbook = html.find("#flipbook");
                //bind the resize event
                this.element.find(".window-resizable-handle").on(
                    "click.stopDrag", this._onStopDrag.bind(this)
                );
                //stop the first and last page turning
                let stopFlipbookTurning = function(event,flipbook,page) {
                    if (page == 1 || page == flipbook.turn("pages") ) {event.preventDefault();}
                }
                //event binding
                //start is for stopping the animation
                flipbook.on("start", function(event, pageObject, corner) {
                    if (!$(this).prop("controlled")) {
                        let options = self.getActorData().options;
                        stopFlipbookTurning(event,$(this), pageObject.next);
                        let forbidden = (corner=='tl' || corner=='tr' || !options.turning );
                        if (forbidden || !options.peel ) { //we only allow bottom page turning
                            event.preventDefault();
                        }
                        $(this).prop("forbiddenTurn", forbidden);
                    }
                });
                //turning is for stopping the actual page change
                flipbook.on("turning", function(event, page, view) {
                    if (!$(this).prop("controlled")) {
                        stopFlipbookTurning(event,$(this), page);
                        if ($(this).prop("forbiddenTurn") == true) {event.preventDefault();}
                        else if (page != 1 && page != $(this).turn("pages") ) {
                            self._setActiveFlipbbookPage(page);
                        }
                    }
                });
                flipbook.on("turned", function(event,page,view) {
                    $(this).prop("controlled", false);
                    if (page != 1 && page != $(this).turn("pages") ) {
                        self._setActiveFlipbbookPage(page);
                    }
                });
        
                //tab navigation
                html.find(".em_navbar .em_tabBtn").click(function(event) {
                    try {
                        event.preventDefault();
                        let element = $(this);
                        let page = this.dataset.page;
                        //const flipbook = element.parents("#flipbook");
                        if (page !== flipbook.turn('page') ) {
                            //we disable the old one
                            let oldSelected = element.parent().find('.em_tabBtn[current="true"]');
                            oldSelected.attr("current", "false");
                            //we set it as active
                            element.attr("current", "true");
                            //we turn the page
                            flipbook.prop("controlled", true);
                            flipbook.turn('page', page);
                        }
                    }
                    catch(error) {
                        console.error(error.message);
                    }
                });
        
                //#endregion
                //by calling this we call the pawn and actor event listeners binding



                super.activateListeners(html);
            }
    
        //#endregion
        //#region start methods 
        
            _getSheetMethods() {
                /** called in getData returns an object with all the function callable from the ActorSheet by using the fetch handlebar
                 *  @returns {Object} : returns a dictionary key : function 
                 */
                let funcs = super._getSheetMethods();
                //we add the function we want here
                return funcs;
            }

            async _onStart() {
                let html = this.element.find("form");
                //#region before logic
                    //first we start turn.js
                    let margin = {
                        width : await game.settings.get( findModule("flipbookWMargin"), "flipbookWMargin" ),
                        height : await game.settings.get( findModule("flipbookHMargin"), "flipbookHMargin" )
                    };
                    margin.width = html.width() - margin.width;
                    margin.height = html.height() - margin.height;

                    let flipbook = html.find("#flipbook");
                    flipbook.prop("controlled", false);
                    flipbook.turn({
                        width: html.width() - margin.width,
                        height: html.height() - margin.height,
                        autoCenter: true,
                        display : "double",
                        peel : false,
                        page : this.getActorData().flipbook.anim ? 1 : this.getActorData().flipbook.currentPage
                    });
                    console.warn("current page",this.getActorData().flipbook.currentPage);
                    //#region flipbook start animation
                    if ( this.getActorData().flipbook.anim ) {
                        //we hide the navbar because it's floating
                        let navbar = html.find(".em_navbar");
                        let bgElement = this.element.find(".window-content");
                        let oldBg = bgElement.css("background-image");
                        navbar.css("visibility","hidden");
                        bgElement.css("background-image", "none");
                        //we turn the first page
                        setTimeout(() => { this._onStopDrag(); }, 50);
                        let page = this.getActorData().flipbook.currentPage;
                        
                        setTimeout(() => { flipbook.turn('page', page); },500);
                        setTimeout(() => {
                            navbar.css("visibility","visible");
                            bgElement.css("background-image", oldBg);
                        } , 850);
                        //is set to false after performing the animation once, so that in case of re-render it doesn't do it again
                        this.getActorData().flipbook.anim = false;
                    }
                //#endregion
                //#endregion
                await super._onStart();
                //after logic
            }

        //#endregion
        //#region util methods

            _getActorAdditionalSaveData() {
                /** returns a json object with all the data to add when saving the actor data
                 * @returns {object} : returns a json to merge, it includes the must have data to save everytime the actor is saved
                 */
                console.warn(this.getActorData().flipbook.currentPage);
                return {
                    system : {
                        flipbook : this.getActorData().flipbook
                    }
                }
            }

        //#endregion
        //#region event methods

            async _onClose(event) {
                /** called every time the close sheet button is pressed. The method is bound in the activateListeners method.
                 * 
                 */
                await super._onClose(event); //we call the parent event 
                //makes it so that the flipbook performs the opening animation whenever closed and reopened
                this.getActorData().flipbook.anim = true;
                //since bookmark can save the data, we call bookmark after even though we don't need to save flipbook.anim
                await this._bookmarkCurrentPage();
            }

            async _onStopDrag(event) {
                await super._onStopDrag(event);
                try {
                    let html = this.element.find("form");
                    let flipbook = html.find("#flipbook");
                    flipbook.turn('size', 
                        html.width() - CONFIG.EmConfig.flipbook.wMargin,
                        html.height() - CONFIG.EmConfig.flipbook.hMargin
                    );
                    flipbook.turn("resize");
                }
                catch(error) {console.error(error.message);}
            }
            
            //#region flipbook event methods

                _setActiveFlipbbookPage(page, move = false) {
                    try {
                        page = parseInt(page);
                        if (move) {
                            let flipbook = this.element.find("form #flipbook");
                            if (page !== flipbook.turn('page') ) {
                                flipbook.prop("controlled", true);
                                flipbook.turn('page', page);
                            }
                        }
                        //if odd then it goes to the next page since our tab btns are only even
                        page = page % 2 == 0 ? page : page - 1;
                        this.getActorData().flipbook.currentPage = page;
                        let navbar = this.element.find("form .em_navbar");
                        navbar.find('.em_tabBtn[current="true"]').attr("current", "false");
                        navbar.find(`.em_tabBtn[data-page="${page}"]`).attr("current", "true"); 
                        return true;
                    }
                    catch(error) {
                        console.error(error.message);
                        return false;
                    }              
                }

                async _bookmarkCurrentPage() {
                    /** saves the page in case it's different from the last saved page
                     * 
                     */
                    let flipbook = this.getActorData().flipbook;
                    console.warn("bookmarking");
                    if (flipbook.currentPage != flipbook.lastSavedPage) {
                        flipbook.lastSavedPage = flipbook.currentPage;
                        await this.actor.update({
                            system : {
                                flipbook : flipbook  
                            } 
                        });
                    }
                }

                _getPageContent(page) {
                    return this.element.find(`form #flipbook .em_page[data-page=${page}]`);
                }

            //#endregion


        //#endregion
        //#region sheet methods

            getInventoryItems(...params) {return super.getInventoryItems(...params);}

            getInventoryItemsTags(...params) {return super.getInventoryItemsTags(...params);}

        //#endregion
}