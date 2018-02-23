namespace SchemeDesigner {
    /**
     * Tools
     */
    export class Tools {

        /**
         * Object configurator
         * @param obj
         * @param params
         */
        public static configure(obj: any, params: any)
        {
            if (params) {
                for (let paramName in params) {
                    let value = params[paramName];
                    let setter = 'set' + Tools.capitalizeFirstLetter(paramName);
                    if (typeof obj[setter] === 'function') {
                        obj[setter].apply(obj, [value]);
                    }
                }
            }
        }

        /**
         * First latter to uppercase
         * @param string
         * @returns {string}
         */
        public static capitalizeFirstLetter(string: string)
        {
            return string.charAt(0).toUpperCase() + string.slice(1);
        }
    }
}