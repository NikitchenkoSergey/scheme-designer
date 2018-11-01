namespace SchemeDesigner {
    /**
     * SchemeObject class
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    export class SchemeObject
    {
        /**
         * Object unique id
         */
        protected id: number;

        /**
         * X position
         */
        protected x: number;

        /**
         * Y position
         */
        protected y: number;

        /**
         * Width
         */
        protected width: number;

        /**
         * Height
         */
        protected height: number;

        /**
         * Is active
         */
        protected active: boolean = true;

        /**
         * Rotation
         */
        protected rotation: number = 0;

        /**
         * Is hovered
         */
        public isHovered: boolean = false;

        /**
         * Cursor style
         */
        public cursorStyle: string = 'pointer';

        /**
         * Render function
         */
        protected renderFunction: Function = function() {};

        /**
         * Click function
         */
        protected clickFunction: Function;

        /**
         * Mouse over function
         */
        protected mouseOverFunction: Function;

        /**
         * Mouse leave function
         */
        protected mouseLeaveFunction: Function;

        /**
         * Clear function
         */
        protected clearFunction: Function = function() {};

        /**
         * All params of object
         */
        protected params: any;

        /**
         * Layer id
         */
        protected layerId: string;

        /**
         * Constructor
         * @param {Object} params
         */
        constructor(params: any)
        {
            this.id = Tools.generateUniqueId();

            Tools.configure(this, params);

            this.params = params;
        }

        /**
         * Set layer id
         * @param {string} layerId
         */
        public setLayerId(layerId: string)
        {
            this.layerId = layerId;
        }

        /**
         * Get layer id
         * @return {string}
         */
        public getLayerId(): string
        {
            return this.layerId;
        }

        /**
         * Get id
         * @returns {number}
         */
        public getId(): number
        {
            return this.id;
        }

        /**
         * Get x
         * @returns {number}
         */
        public getX(): number
        {
            return this.x;
        }

        /**
         * Get y
         * @returns {number}
         */
        public getY(): number
        {
            return this.y;
        }

        /**
         * Get width
         * @returns {number}
         */
        public getWidth(): number
        {
            return this.width;
        }

        /**
         * Get height
         * @returns {number}
         */
        public getHeight(): number
        {
            return this.height;
        }

        /**
         * Get params
         * @return {any}
         */
        public getParams(): any
        {
            return this.params;
        }

        /**
         * Rendering object
         * @param scheme
         * @param view
         */
        public render(scheme: Scheme, view: View): void
        {
            this.renderFunction(this, scheme, view);
        }

        /**
         * Clear object
         * @param scheme
         * @param view
         */
        public clear(scheme: Scheme, view: View): void
        {
            this.clearFunction(this, scheme, view);
        }

        /**
         * Click on object
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         * @param view
         * @return null|boolean
         */
        public click(e: MouseEvent, schemeDesigner: Scheme, view: View): null|boolean
        {
            if (typeof this.clickFunction === 'function') {
                return this.clickFunction(this, schemeDesigner, view, e);
            }
            return null;
        }

        /**
         * Mouse over
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         * @param view
         * @return null|boolean
         */
        public mouseOver(e: MouseEvent | TouchEvent, schemeDesigner: Scheme, view: View): null|boolean
        {
            if (typeof this.mouseOverFunction === 'function') {
                return this.mouseOverFunction(this, schemeDesigner, view, e);
            }
            return null;
        }

        /**
         * Mouse leave
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         * @param view
         * @return null|boolean
         */
        public mouseLeave(e: MouseEvent | TouchEvent, schemeDesigner: Scheme, view: View): null|boolean
        {
            if (typeof this.mouseLeaveFunction === 'function') {
                return this.mouseLeaveFunction(this, schemeDesigner, view, e);
            }
            return null;
        }

        /**
         * Set x
         * @param {number} value
         */
        public setX(value: number): void
        {
            this.x = value;
        }

        /**
         * Set y
         * @param {number} value
         */
        public setY(value: number): void
        {
            this.y = value;
        }

        /**
         * Set width
         * @param {number} value
         */
        public setWidth(value: number): void
        {
            this.width = value;
        }

        /**
         * Set height
         * @param {number} value
         */
        public setHeight(value: number): void
        {
            this.height = value;
        }

        /**
         * Set cursorStyle
         * @param {string} value
         */
        public setCursorStyle(value: string): void
        {
            this.cursorStyle = value;
        }

        /**
         * Set rotation
         * @param {number} value
         */
        public setRotation(value: number): void
        {
            this.rotation = value;
        }

        /**
         * Set renderFunction
         * @param {Function} value
         */
        public setRenderFunction(value: Function): void
        {
            this.renderFunction = value;
        }

        /**
         * Set clickFunction
         * @param {Function} value
         */
        public setClickFunction(value: Function): void
        {
            this.clickFunction = value;
        }

        /**
         * Set clearFunction
         * @param {Function} value
         */
        public setClearFunction(value: Function): void
        {
            this.clearFunction = value;
        }

        /**
         * Set mouseOverFunction
         * @param {Function} value
         */
        public setMouseOverFunction(value: Function): void
        {
            this.mouseOverFunction = value;
        }

        /**
         * Set mouseLeaveFunction
         * @param {Function} value
         */
        public setMouseLeaveFunction(value: Function): void
        {
            this.mouseLeaveFunction = value;
        }

        /**
         * Bounding rect
         * @returns BoundingRect
         */
        public getBoundingRect(): BoundingRect
        {
            return {
                left: this.x,
                top: this.y,
                right: this.x + this.width,
                bottom: this.y + this.height
            };
        }


        /**
         * Outer bound rect
         * @returns {BoundingRect}
         */
        public getOuterBoundingRect(): BoundingRect
        {
            let boundingRect = this.getBoundingRect();

            if (!this.rotation) {
                return boundingRect;
            }

            // rotate from center
            let rectCenterX = (boundingRect.left + boundingRect.right) / 2;
            let rectCenterY = (boundingRect.top + boundingRect.bottom) / 2;

            let axis: Coordinates = {x: rectCenterX, y: rectCenterY};

            let leftTop = Tools.rotatePointByAxis({x: this.x, y: this.y}, axis, this.rotation);
            let leftBottom = Tools.rotatePointByAxis({x: this.x, y: this.y + this.height}, axis, this.rotation);
            let rightTop = Tools.rotatePointByAxis({x: this.x + this.width, y: this.y}, axis, this.rotation);
            let rightBottom = Tools.rotatePointByAxis({x: this.x + this.width, y: this.y + this.height}, axis, this.rotation);

            return {
                left: Math.min(leftTop.x, leftBottom.x, rightTop.x, rightBottom.x),
                top: Math.min(leftTop.y, leftBottom.y, rightTop.y, rightBottom.y),
                right: Math.max(leftTop.x, leftBottom.x, rightTop.x, rightBottom.x),
                bottom: Math.max(leftTop.y, leftBottom.y, rightTop.y, rightBottom.y),
            };
        }

        /**
         * Get rotation
         * @returns {number}
         */
        public getRotation(): number
        {
            return this.rotation;
        }

        /**
         * Get is active
         * @return {boolean}
         */
        public isActive(): boolean
        {
            return this.active;
        }

        /**
         * Set active
         * @param {boolean} value
         */
        public setActive(value: boolean): void
        {
            this.active = value;
        }
    }
}
