import TestItemSheet from "./module/sheet/TestItemSheet.js";

Hooks.once("init", function() {
    console.log("loading EM 2E");

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("emItem", TestItemSheet, {makeDefault: true});
});