const MAIN_SCRIPT_LOADED = true;
console.log("loaded main script");

function toggleDropdown(id, event) {
    let self = $(event.target);
    let dropdownContent = self.parent().find(`.dropdown-content[for="${id}"]`);
    let icon = self.find(".dropdown-icon");
    dropdownContent.toggle();
    icon.toggleClass("fa-chevron-up fa-chevron-down");
}