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

async function loadBodyPart(actorId, event) {
    let actor = Actor.get(actorId);
    console.log(actor);
}
