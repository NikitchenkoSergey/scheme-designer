namespace SchemeDesigner {
    /**
     * Tools
     */
    export class Tools {

        /**
         * Number for id generator
         * @type {number}
         */
        protected static idNumber: number = 0;

        /**
         * Object configurator
         * @param obj
         * @param params
         */
        public static configure(obj: any, params: any): void
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
        public static capitalizeFirstLetter(string: string): string
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
         * @param rotation - rotation of rect
         * @returns {boolean}
         */
        public static pointInRect(coordinates: Coordinates, boundingRect: BoundingRect, rotation?: number): boolean
        {
            let result = false;

            let x = coordinates.x;
            let y = coordinates.y;

            // move point by rotation
            if (rotation) {
                rotation = -rotation;
                let rectCenterX = (boundingRect.left + boundingRect.right) / 2;
                let rectCenterY = (boundingRect.top + boundingRect.bottom) / 2;

                let rotatedPoint = Tools.rotatePointByAxis(coordinates, {x: rectCenterX, y: rectCenterY}, rotation);
                x = rotatedPoint.x;
                y = rotatedPoint.y;
            }


            if (boundingRect.left <= x && boundingRect.right >= x
                && boundingRect.top <= y && boundingRect.bottom >= y) {
                result = true;
            }

            return result;
        }

        /**
         * Rotate point by axis
         * @param point
         * @param axis
         * @param rotation
         * @returns {Coordinates}
         */
        public static rotatePointByAxis(point: Coordinates, axis: Coordinates, rotation: number): Coordinates
        {
            rotation = rotation * Math.PI / 180;

            let x = axis.x + (point.x - axis.x) * Math.cos(rotation) - (point.y - axis.y) * Math.sin(rotation);
            let y = axis.y + (point.x - axis.x) * Math.sin(rotation) + (point.y - axis.y) * Math.cos(rotation);

            return {x: x, y: y};
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
                let objectBoundingRect = schemeObject.getOuterBoundingRect();

                let isPart = this.rectIntersectRect(objectBoundingRect, boundingRect);

                if (isPart) {
                    result.push(schemeObject);
                }
            }

            return result;
        }

        /**
         * Filter by bounding rect objects in layers
         * @param boundingRect
         * @param objectsByLayers
         * @returns {SchemeObjectsByLayers}
         */
        public static filterLayersObjectsByBoundingRect(boundingRect: BoundingRect, objectsByLayers: SchemeObjectsByLayers): SchemeObjectsByLayers
        {
            let result: SchemeObjectsByLayers = {};
            for (let layerId in objectsByLayers) {
                let objects = objectsByLayers[layerId];
                result[layerId] = Tools.filterObjectsByBoundingRect(boundingRect, objects);
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
         * Generate unique id
         * @returns {number}
         */
        public static generateUniqueId(): number
        {
            this.idNumber++;

            return this.idNumber;
        }


        /**
         * Touch supported
         * @returns {boolean}
         */
        public static touchSupported(): boolean
        {
            return 'ontouchstart' in window;
        }


        /**
         * Sorting object
         * @param obj
         * @returns {{}}
         */
        public static sortObject(obj: Object): Object
        {
            let keys = Object.keys(obj),
                len = keys.length;

            keys.sort();

            let result = {};

            for (let i = 0; i < len; i++) {
                let k = keys[i];
                (result as any)[k] = (obj as any)[k];
            }

            return result;
        }

        /**
         * Get random string
         * @returns {string}
         */
        public static getRandomString(): string
        {
            return Math.random().toString(36).substr(2, 9);
        }

        /**
         * Disable selection on element
         * @param element
         */
        public static disableElementSelection(element: HTMLElement): void
        {
            let styles = [
                '-webkit-touch-callout',
                '-webkit-user-select',
                '-khtml-user-select',
                '-moz-user-select',
                '-ms-user-select',
                'user-select',
                'outline'
            ];
            for (let styleName of styles) {
                (element.style as any)[styleName] = 'none';
            }
        }

        /**
         * Get pointer from event
         * @param e
         * @param clientProp
         * @returns {number}
         */
        public static getPointer(e: MouseEvent | TouchEvent, clientProp: string): number
        {
            let touchProp = e.type === 'touchend' ? 'changedTouches' : 'touches';

            let event = (e as any);

            // touch event
            if (event[touchProp] && event[touchProp][0]) {
                if (event[touchProp].length == 2) {
                    return (event[touchProp][0][clientProp] + event[touchProp][1][clientProp]) / 2;
                }

                return event[touchProp][0][clientProp];
            }

            return event[clientProp];
        }
    }
}
