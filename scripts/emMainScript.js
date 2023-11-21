const MAIN_SCRIPT_LOADED = true;
console.log("loaded main script");

function toggleDropdown(id, event) {
    let self = $(event.target);
    let dropdownContent = self.parent().find(`.dropdown-content[for="${id}"]`);
    let icon = self.find(".dropdown-icon");
    dropdownContent.toggle();
    icon.toggleClass("fa-chevron-up fa-chevron-down");
}

async function copyTextToClipboard(event) {
    try {
        // Get the text field
        let element = $(event.target);
        element.focus();
        // Alert the copied text
        console.log(navigator, navigator.clipboard);
        alert("Copied the text: " + element.text() );
        // Copy the text inside the text field
        await navigator.clipboard.writeText(element.innerText );
    }
    catch(error) {console.error(error.message);}
  }

async function copyToClipboard(event) {
    try {
        const textToCopy = $(event.target).text();
        await navigator.clipboard.writeText(textToCopy);
        console.log('Text copied to clipboard:', textToCopy);
        return;

        // Create a temporary textarea element
        const copyText = document.createElement('input');
        copyText.id = "em_clipboardInput";
        copyText.value = textToCopy;
        document.body.appendChild(copyText);

        // Select the text in the textarea
        copyText.select();
        copyText.setSelectionRange(0, 99999); // For mobile devices
        copyText.focus();
        // Copy the text inside the text field
        //await navigator.clipboard.writeText(copyText.value);
        // Execute the copy command
        document.execCommand('copy');
        // Alert the copied text
        alert("Copied the text: " + copyText.value);

        document.body.removeChild(copyText);
    }
    catch(error) {
        console.error(error.message);
    }
    finally {
        let element = document.getElementById("em_clipboardInput");
        if (element != undefined) {
            document.body.removeChild(element);
        }
    }
}
