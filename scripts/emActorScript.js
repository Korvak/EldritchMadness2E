const ACTOR_SCRIPT_LOADED = true;
console.log("loaded actor script");

function em_actor_changePage(event,page) {
    try {
        event.preventDefault();
        let element = $(event.target);
        const flipbook = element.parents("#flipbook");
        if (page !== flipbook.turn('page') ) {
            flipbook.prop("controlled", true);
            flipbook.turn('page', page);
        }
    }
    catch(error) {
        console.error(error.message);
    }
}


function loadBodyPart(event, actorId = null) {
    try {
        //first we fetch the data
        let element = $(event.target);
        let sheet = element.parents(".em_actorSheet");
        if (typeof actorId !== "string") {
            actorId = sheet.attr("id");
            actorId = actorId.substring(actorId.lastIndexOf("-") + 1 );
        }
        let actor = Actor.get(actorId);
        //now we have to fetch the bodypart data
        let bodypart = actor.system.anatomy.parts[element.attr("id")];
        console.log(bodypart);
        //#region load the data into the page
        setBodypartData(sheet.find("#flipbook"), actor, element.attr("id"), bodypart );
    }
    catch(error) {console.error(error.message);}
}

function setBodypartData(sheet, actor, bodypartId, bodypart) {
    sheet.find("#em_actor_bodypart_id").text(bodypartId);
    sheet.find("#em_actor_bodypart_name").val(bodypart.name);
    //set the hp bar
    let durability = bodypart.durability;
    let hp = normalize(durability.value, durability.min, durability.max);
    sheet.find("#em_actor_bodypart_hp").css("flex", `${hp}`);
    //set the attached to and body type
    sheet.find("#em_actor_bodypart_type").val(bodypart.partType);
    sheet.find("#em_actor_bodypart_attached").val(bodypart.attachedTo);
    
}
