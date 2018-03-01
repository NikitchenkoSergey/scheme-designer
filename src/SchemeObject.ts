namespace SchemeDesigner {
    /**
     * SchemeObject class
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    export class SchemeObject
    {
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
        protected renderFunction: Function;

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
        protected clearFunction: Function;

        /**
         * All params of object
         */
        protected params: any;

        /**
         * Constructor
         * @param {Object} params
         */
        constructor(params: any)
        {
            Tools.configure(this, params);

            this.params = params;
        }

        /**
         * Rendering object
         * @param scheme
         * @param view
         */
        public render(scheme: Scheme, view: View): void
        {
            if (typeof this.renderFunction === 'function') {
                this.renderFunction(this, scheme, view);
            }
        }

        /**
         * Clear object
         * @param scheme
         * @param view
         */
        public clear(scheme: Scheme, view: View): void
        {
            if (typeof this.clearFunction === 'function') {
                this.clearFunction(this, scheme, view);
            }
        }

        /**
         * Click on object
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         * @param view
         */
        public click(e: MouseEvent, schemeDesigner: Scheme, view: View): void
        {
            if (typeof this.clickFunction === 'function') {
                this.clickFunction(this, Scheme, view, e);
            }
        }

        /**
         * Mouse over
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         * @param view
         */
        public mouseOver(e: MouseEvent | TouchEvent, schemeDesigner: Scheme, view: View): void
        {
            if (typeof this.mouseOverFunction === 'function') {
                this.mouseOverFunction(this, Scheme, view, e);
            }
        }

        /**
         * Mouse leave
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         * @param view
         */
        public mouseLeave(e: MouseEvent | TouchEvent, schemeDesigner: Scheme, view: View): void
        {
            if (typeof this.mouseLeaveFunction === 'function') {
                this.mouseLeaveFunction(this, Scheme, view, e);
            }
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
         * @param {number} value
         */
        public setCursorStyle(value: string): void
        {
            this.cursorStyle = value;
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
         * Relative x
         * @param {SchemeDesigner.View} view
         * @returns {number}
         */
        public getRelativeX(view: View): number
        {
            return this.x + view.getScrollLeft();
        }

        /**
         * Relative y
         * @param {SchemeDesigner.View} view
         * @returns {number}
         */
        public getRelativeY(view: View): number
        {
            return this.y + view.getScrollTop();
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
    }
}
