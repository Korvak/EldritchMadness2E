const MAIN_SCRIPT_LOADED = true;
console.log("loaded main script");

//#region util funcs

function normalize(value, min, max) {
    return (value - min) / (max - min);
}

//#endregion
//#region html funcs
function toggleDropdown(id, event) {
    let self = $(event.target);
    let dropdownContent = self.parent().find(`.dropdown-content[for="${id}"]`);
    let icon = self.find(".dropdown-icon");
    dropdownContent.toggle();
    icon.toggleClass("fa-chevron-up fa-chevron-down");
}

function toggleReadonly(event) {
    let self = $(event.target);
    self.parent().find("input").each(function() {
        $(this).prop("readonly", ! $(this).prop("readonly") );
    });
}

function test() {console.log("this is a test");}
//#endregion