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
         * All params of object
         */
        protected params: any;

        /**
         * Constructor
         * @param {Object} params
         */
        constructor(params: any)
        {
            this.x = params.x;
            this.y = params.y;
            this.width = params.width;
            this.height = params.height;
            this.renderFunction = params.renderFunction;

            if (params.cursorStyle) {
                this.cursorStyle = params.cursorStyle;
            }

            if (params.clickFunction) {
                this.clickFunction = params.clickFunction;
            }

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
        public mouseOver(e: MouseEvent, schemeDesigner: Scheme): void
        {

        }

        /**
         * Mouse leave
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         */
        public mouseLeave(e: MouseEvent, schemeDesigner: Scheme): void
        {

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
