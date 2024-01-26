export class Logger {  

    //enum
    static LEVELS = {
        DEBUG : {
            value : "DEBUG",
            order : 0
        },
        WARNING : {
            value : "WARNING",
            order : 1
        },
        ERROR : {
            value : "ERROR",
            order : 2
        },
        CRITICAL : {
            value : "CRITICAL",
            order : 3
        }
    }

    #_MINIMUM_LOG_LEVEL = Logger.LEVELS.DEBUG;

    _setMinimumLevel(level = Logger.LEVELS.DEBUG) {
        /** only logs of this level or higher can be displayed or called
         *  @param {Enum(Logger.LEVELS)} level : the minimum level of logs to display
         */
        this.#_MINIMUM_LOG_LEVEL = level;
    }

    log({msg = "", level = Logger.LEVELS.DEBUG, args = []}) {
        /** logs the errors and may store them in a separate file or Db
         *  for now it logs them in the console.
         */
        switch (level.value) {
            case Logger.LEVELS.DEBUG.value : {return this.#_DebugLog(msg, args);}
            case Logger.LEVELS.WARNING.value : {return this.#_WarnLog(msg, args);}
            case Logger.LEVELS.ERROR.value : {return this.#_ErrorLog(msg, args);}
            case Logger.LEVELS.CRITICAL.value : {return this.#_CriticalLog(msg, args);}
            default : {return this.#_ErrorLog(msg, args);}
        }
    }

    #_Translate(msg , args = []) {
        /** attempts to translate the message
         *  @param {string} msg : the message to translate
         *  @param {Params} args : the list of parameters to format the translated string with
         *
         *  @returns {string} : the translated string formatted according to the params.
         */
        try {
            //uses the Foundry in-built localization module.
            let translation =  game.i18n.localize(msg);
            return String.format(translation, ...args);
        }
        catch(error) {
            //in case of error, it gets ignored
            if (typeof msg == "string") {
                return msg;
            }
            else {
                //otherwise if it's not a string we launch an error log
                this.log({
                    msg : "ERROR.FAILED_TRANSLATION_ERROR",
                    level : EmLogger.LEVELS.ERROR,
                    args : [msg]
                });
            }
        }
    }

    #_DebugLog(msg, args) {
        /** For Debugging purposes only. Should do nothing in a production environment 
         * 
         */
        if (Logger.LEVELS.DEBUG.order >= this.#_MINIMUM_LOG_LEVEL.order) {
            //we check if we can display the log or not through the minimum level order
            console.log( this.#_Translate(msg, args) );
        }
    }

    #_WarnLog(msg, args) {
        if (Logger.LEVELS.WARNING.order >= this.#_MINIMUM_LOG_LEVEL.order) {
            //we check if we can display the log or not through the minimum level order
            console.warn( this.#_Translate(msg, args) );
        }
    }

    #_ErrorLog(msg, args) {
        if (Logger.LEVELS.ERROR.order >= this.#_MINIMUM_LOG_LEVEL.order) {
            //we check if we can display the log or not through the minimum level order
            console.error( this.#_Translate(msg, args) );
        }
    }

    #_CriticalLog(msg, args) {
        try {
            //will always be displayed since the minimum level is CRITICAL
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