//#region html funcs
export function toggleDropdown(event) {
    event.preventDefault();
    //let self = $(event.currentTarget);
    let id = this.dataset.id;
    let dropdownContent = $(this).parent().find(`.dropdown-content[for="${id}"]`);
    let icon = $(this).find(".dropdown-icon");
    dropdownContent.toggle();
    icon.toggleClass("fa-chevron-up fa-chevron-down");
}

export function toggleReadonly(event) {
    event.preventDefault();
    let self = $(event.currentTarget);
    self.parent().find(".em_input").each(function() {
        $(this).prop("readonly", ! $(this).prop("readonly") );
        $(this).prop("disabled", ! $(this).prop("disabled") );
    });
}

const SEARCH_MODE = {
    "contains" : "*=",
    "startsWith" : "^=",
    "endsWith" : "$=",
    "equals" : "=",
    "default ": "="
}

export function searchByTags(event) {
    event.preventDefault();
    let element = $(this);
    //then we get the container linked to the searchbar
    let parent = element.parent();
    //in case the input it's in a container, then we get the next parent
    if (parent.hasClass("em_inputContainer") ) {parent = parent.parent();}
    let container = parent.find(`[for=${this.dataset.id}]`);
    //we get the search character which can be *=, = , ^=
    let searchChar = SEARCH_MODE[this.dataset.search];
    //if doesn't exists then we get the default
    searchChar = searchChar == undefined ? SEARCH_MODE["default"] : searchChar;
    //then we get the container linked to the searchbar
    //first we show all the elements in the container
    container.children().show();
    if (element.val().length > 0) {
        //then we hide all the elements that don't follow our search rule
        container.find(`>:not([data-search${searchChar}${element.val()}])`).hide();
    }
    
}


//#region bar value

const BAR_CLASS = {
    CONTAINER : "em_barContainer",
    BAR : "em_bar",
    TXT : "em_barTxt"
}

export function renderBar(event) {
    event.preventDefault();
    let value = {
        val : parseInt(this.dataset.value),
        max : parseInt(this.dataset.valuemax)
    };
    let temp = {
        val : parseInt(this.dataset.temp),
        max : parseInt( this.dataset.tempmax)
    };
    setBarValue($(this), value, temp);
}


export function setBarValue(element, value, temp = {val : 0, max : 0}) {
    /**
     * @param {JqueryObject} element : the jquery object that must have a em_barContainer class
     * @param {{val : number, max : number}} value : the main value that must be set with the temp
     * @param {{val : number, max : number}} temp : the temp value that can be null
     */
    if (!element.hasClass(BAR_CLASS.CONTAINER) ) {
        console.error(`${element} must be of class ${BAR_CLASS.CONTAINER}`);
        return;
    }
    //we make sure the data is within the max
    value.val = Math.min(value.val , value.max);
    temp.val = Math.min(temp.val , temp.max);
    //we first set the text
    let text = `${value.val}/${value.max} ${temp.val > 0 ? "+"+temp.val : ""}`;
    element.find(`.${BAR_CLASS.TXT}`).text(text);
    //then we set the bar background and value
    let bar = element.find(`.${BAR_CLASS.BAR}`);
    if (bar == undefined || bar.length < 1) {
        console.error(`${element} does not contain a child of type ${BAR_CLASS.BAR}`);
        return
    }
    let barData = bar.get(0).dataset;
    //#region calculations
    //we use normalization formulas but since our min is 0 then we ignore it
    //we first calculate the width depending on if the temp is on or not, then we normalize differently
    let tempMax = value.max + temp.val; //we just use temp.val instead of temp.max that only gets applied if temp.val > 0
    let tot = value.val + temp.val;
    let width = tot / tempMax;
    width= Math.round( width * 100);
    //now we calculate how much the value is of the total
    let valPercent = value.val / tot;
    valPercent = Math.round( valPercent * 100);
    //#endregion
    //now we set the element data
    bar.css({
        width : `${width}%`,
        background : `linear-gradient(90deg, ${barData.primarycolor} ${valPercent}%, ${barData.secondarycolor} 0%)`
    });
    //#region update the element data
    let elementData = element.get(0).dataset;
    elementData.value = value.val;
    elementData.valuemax = value.max;
    //dataset naming is actually case insensitive so we should use snake case instead of camel or pascal case
    elementData.temp = temp.val;
    elementData.tempmax = temp.max;
    //#endregion
}

//#endregion