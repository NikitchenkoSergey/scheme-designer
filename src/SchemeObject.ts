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
         */
        public render(Scheme: Scheme): void
        {
            if (typeof this.renderFunction === 'function') {
                this.renderFunction(this, Scheme);
            }
        }

        /**
         * Click on object
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         */
        public click(e: MouseEvent, schemeDesigner: Scheme): void
        {
            if (typeof this.clickFunction === 'function') {
                this.clickFunction(this, Scheme, e);
            }
        }

        /**
         * Mouse over
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         */
        public mouseOver(e: MouseEvent | TouchEvent, schemeDesigner: Scheme): void
        {
            if (typeof this.mouseOverFunction === 'function') {
                this.mouseOverFunction(this, Scheme, e);
            }
        }

        /**
         * Mouse leave
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         */
        public mouseLeave(e: MouseEvent | TouchEvent, schemeDesigner: Scheme): void
        {
            if (typeof this.mouseLeaveFunction === 'function') {
                this.mouseLeaveFunction(this, Scheme, e);
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
    }
}
