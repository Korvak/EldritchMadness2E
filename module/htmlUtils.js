//#region html funcs
export function toggleDropdown(event) {
    event.preventDefault();
    let self = $(event.target);
    let id = this.dataset.id;
    let dropdownContent = self.parent().find(`.dropdown-content[for="${id}"]`);
    let icon = self.find(".dropdown-icon");
    dropdownContent.toggle();
    icon.toggleClass("fa-chevron-up fa-chevron-down");
}

export function toggleReadonly(event) {
    event.preventDefault();
    let self = $(event.target);
    self.parent().find("input").each(function() {
        $(this).prop("readonly", ! $(this).prop("readonly") );
    });
}

export function onBarValueChange(event) {
    event.preventDefault();
    let input = $(this);
    let bar = $(this).parent().find(".em_bar");
    bar.css("flex", `${input.val()}`);
}