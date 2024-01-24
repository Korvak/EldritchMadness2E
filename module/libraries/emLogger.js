class Logger {

    LEVELS = {
        DEBUG : "DEBUG",
        WARNING : "WARNING",
        ERROR : "ERROR",
        CRITICAL : "CRITICAL"
    }

    log({msg = "", level = Logger.LEVELS.DEBUG, args = []}) {
        /** logs the errors and may store them in a separate file or Db
         *  for now it logs them in the console.
         */
        switch (level) {
            case Logger.LEVELS.DEBUG : {return this.#_DebugLog(msg, args);}
            case Logger.LEVELS.WARNING : {return this.#_WarnLog(msg, args);}
            case Logger.LEVELS.ERROR : {return this.#_ErrorLog(msg, args);}
            case Logger.LEVELS.CRITICAL : {return this.#_CriticalLog(msg, args);}
            default : {return this.#_ErrorLog(msg, args);}
        }
    }

    #_Translate(msg , args = []) {
        /** attempts to translate the message
         *  @param {string} msg : the message to translate
         */
        try {
            //uses the Foundry in-built localization module.
            let translation =  game.i18n.localize(msg);
            return String.format(translation, ...args);
        }
        catch(error) {
            //in case of error, it gets ignored
            return msg;
        }
    }

    #_DebugLog(msg, args) {
        /** For Debugging purposes only. Should do nothing in a production environment 
         * 
         */
        console.log( this.#_Translate(msg, args) );
    }

    #_WarnLog(msg, args) {
        console.warn( this.#_Translate(msg, args) );
    }

    #_ErrorLog(msg, args) {
        console.error( this.#_Translate(msg, args) );
    }

    #_CriticalLog(msg, args) {
        try {
            let translated = this.#_Translate(msg, args);
            console.error( translated );
            //attempts an alert but does nothing if it fails
            alert( translated );
        }
        catch(error) {}
    }

}


//this should basically be a Service
export const EmLogger = new Logger();