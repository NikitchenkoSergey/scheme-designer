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


        /**
         * convert max-width/max-height values that may be percentages into a number
         * @param styleValue
         * @param node
         * @param parentProperty
         * @returns {number}
         */
        public static parseMaxStyle(styleValue: number | string, node: HTMLElement, parentProperty: string): number {
            let valueInPixels;
            if (typeof styleValue === 'string') {
                valueInPixels = parseInt(styleValue, 10);

                if (styleValue.indexOf('%') !== -1) {
                    // percentage * size in dimension
                    valueInPixels = valueInPixels / 100 * (node.parentNode as any)[parentProperty];
                }
            } else {
                valueInPixels = styleValue;
            }

        return valueInPixels;
    }

        /**
         * Returns if the given value contains an effective constraint.
         * @param value
         * @returns {boolean}
         */
        public static isConstrainedValue(value: any): boolean {
            return value !== undefined && value !== null && value !== 'none';
        }

        /**
         * Get constraint dimention
         * @see http://www.nathanaeljones.com/blog/2013/reading-max-width-cross-browser
         * @param domNode
         * @param maxStyle
         * @param percentageProperty
         * @returns {null|number}
         */
        public static getConstraintDimension(domNode: HTMLElement, maxStyle: string, percentageProperty: string): null|number {
            let view = document.defaultView;
            let parentNode = domNode.parentNode as HTMLElement;
            let constrainedNode = (view.getComputedStyle(domNode) as any)[maxStyle];
            let constrainedContainer = (view.getComputedStyle(parentNode) as any)[maxStyle];
            let hasCNode = this.isConstrainedValue(constrainedNode);
            let hasCContainer = this.isConstrainedValue(constrainedContainer);
            let infinity = Number.POSITIVE_INFINITY;

            if (hasCNode || hasCContainer) {
                return Math.min(
                    hasCNode ? this.parseMaxStyle(constrainedNode, domNode, percentageProperty) : infinity,
                    hasCContainer ? this.parseMaxStyle(constrainedContainer, parentNode, percentageProperty) : infinity);
            }

        return null;
    }

        /**
         * Number or undefined if no constraint
         * @param domNode
         * @returns {number|string}
         */
        public static getConstraintWidth(domNode: HTMLElement) {
            return this.getConstraintDimension(domNode, 'max-width', 'clientWidth');
        }

        /**
         * Number or undefined if no constraint
         * @param domNode
         * @returns {number|string}
         */
        public static getConstraintHeight(domNode: HTMLElement) {
            return this.getConstraintDimension(domNode, 'max-height', 'clientHeight');
        }

        /**
         * Get max width
         * @param domNode
         * @returns {number}
         */
        public static getMaximumWidth(domNode: HTMLElement): number {
            let container = domNode.parentNode as HTMLElement;
            if (!container) {
                return domNode.clientWidth;
            }

            let paddingLeft = parseInt(this.getStyle(container, 'padding-left'), 10);
            let paddingRight = parseInt(this.getStyle(container, 'padding-right'), 10);
            let w = container.clientWidth - paddingLeft - paddingRight;
            let cw = this.getConstraintWidth(domNode);
            return !cw ? w : Math.min(w, cw);
        }

        /**
         * Get max height
         * @param domNode
         * @returns {number}
         */
        public static getMaximumHeight(domNode: HTMLElement): number {
            let container = domNode.parentNode as HTMLElement;
            if (!container) {
                return domNode.clientHeight;
            }

            let paddingTop = parseInt(this.getStyle(container, 'padding-top'), 10);
            let paddingBottom = parseInt(this.getStyle(container, 'padding-bottom'), 10);
            let h = container.clientHeight - paddingTop - paddingBottom;
            let ch = this.getConstraintHeight(domNode);
            return !ch ? h : Math.min(h, ch);
        }

        /**
         * Get style
         * @param element
         * @param {string} property
         * @returns {string}
         */
        public static getStyle(element: any, property: string): string {
            return element.currentStyle ?
                element.currentStyle[property] :
                document.defaultView.getComputedStyle(element, null).getPropertyValue(property);
        };


        /**
         * Touch supported
         * @returns {boolean}
         */
        public static touchSupported(): boolean
        {
            return 'ontouchstart' in window;
        }
    }
}
