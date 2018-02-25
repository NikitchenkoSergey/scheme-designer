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

        /**
         * Clone object
         * @param obj
         */
        public static clone(obj: Object): Object
        {
            return JSON.parse(JSON.stringify(obj));
        };


        /**
         * Check than point in rect
         * @param coordinates
         * @param boundingRect
         * @returns {boolean}
         */
        public static pointInRect(coordinates: Coordinates, boundingRect: BoundingRect): boolean
        {
            let result = false;

            if (boundingRect.left <= coordinates.x && boundingRect.right >= coordinates.x
                && boundingRect.top <= coordinates.y && boundingRect.bottom >= coordinates.y) {
                result = true;
            }

            return result;
        }

        /**
         * Rect intersect rect
         * @param boundingRect1
         * @param boundingRect2
         * @returns {boolean}
         */
        public static rectIntersectRect(boundingRect1: BoundingRect, boundingRect2: BoundingRect): boolean
        {
            return !(
            boundingRect1.top > boundingRect2.bottom
            || boundingRect1.bottom < boundingRect2.top
            || boundingRect1.right < boundingRect2.left
            || boundingRect1.left > boundingRect2.right
            );
        }

        /**
         * Find objects by coordinates
         * @param boundingRect
         * @param objects
         * @returns {SchemeObject[]}
         */
        public static filterObjectsByBoundingRect(boundingRect: BoundingRect, objects: SchemeObject[]): SchemeObject[]
        {
            let result: SchemeObject[] = [];


            for (let schemeObject of objects) {
                let objectBoundingRect = schemeObject.getBoundingRect();

                let isPart = this.rectIntersectRect(objectBoundingRect, boundingRect);

                if (isPart) {
                    result.push(schemeObject);
                }
            }

            return result;
        }
    }
}