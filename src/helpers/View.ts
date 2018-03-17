namespace SchemeDesigner {
    /**
     * View
     */
    export class View {

        /**
         * Canvas
         */
        protected canvas: HTMLCanvasElement;

        /**
         * Context
         */
        protected context: CanvasRenderingContext2D;

        /**
         * scroll left
         */
        protected scrollLeft: number = 0;

        /**
         * Scroll top
         */
        protected scrollTop: number = 0;

        /**
         * Scale
         */
        protected scale: number = 0;

        /**
         * Width
         */
        protected width: number = 0;

        /**
         * Height
         */
        protected height: number = 0;

        /**
         * Constructor
         * @param canvas
         */
        constructor(canvas: HTMLCanvasElement)
        {
            this.canvas = canvas;
            this.context = this.canvas.getContext('2d');
        }

        /**
         * Get canvas
         * @returns {HTMLCanvasElement}
         */
        public getCanvas(): HTMLCanvasElement
        {
            return this.canvas;
        }

        /**
         * Canvas context getter
         * @returns {CanvasRenderingContext2D}
         */
        public getContext(): CanvasRenderingContext2D
        {
            return this.context;
        }

        /**
         * Set scroll left
         * @param value
         */
        public setScrollLeft(value: number): void
        {
            this.scrollLeft = value;
        }

        /**
         * Set scroll top
         * @param value
         */
        public setScrollTop(value: number): void
        {
            this.scrollTop = value;
        }

        /**
         * Set scale
         * @param value
         */
        public setScale(value: number): void
        {
            this.scale = value;
        }

        /**
         * Get scroll left
         * @returns {number}
         */
        public getScrollLeft(): number
        {
            return this.scrollLeft;
        }

        /**
         * Get scroll top
         * @returns {number}
         */
        public getScrollTop(): number
        {
            return this.scrollTop;
        }

        /**
         * Get scale
         * @returns {number}
         */
        public getScale(): number
        {
            return this.scale;
        }

        /**
         * Set dimensions
         * @param dimensions
         */
        public setDimensions(dimensions: Dimensions): void
        {
            this.canvas.width = dimensions.width;
            this.canvas.height = dimensions.height;

            this.width = dimensions.width;
            this.height = dimensions.height;
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
         * Apply transformation
         */
        public applyTransformation()
        {
            this.context.setTransform(this.scale, 0, 0, this.scale, this.scrollLeft, this.scrollTop);
        }
    }
}