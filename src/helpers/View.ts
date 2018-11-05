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
         * Background
         */
        protected background: string|null = null;

        /**
         * Constructor
         * @param canvas
         * @param background
         */
        constructor(canvas: HTMLCanvasElement, background: string|null = null)
        {
            this.canvas = canvas;
            this.background = background;
            if (this.background) {
                this.context = this.canvas.getContext('2d', {alpha: false}) as CanvasRenderingContext2D;
            } else {
                this.context = this.canvas.getContext('2d');
            }
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

        /**
         * Resize view
         */
        public resize(): void
        {
            let newWidth = Math.max(0, Math.floor(Tools.getMaximumWidth(this.getCanvas())));
            let newHeight = Math.max(0, Math.floor(Tools.getMaximumHeight(this.getCanvas())));

            this.setDimensions({
                width: newWidth,
                height: newHeight
            });
        }

        /**
         * Draw background
         * @returns {boolean}
         */
        public drawBackground(): boolean
        {
            if (!this.background) {
                return false;
            }
            let context = this.getContext();
            context.fillStyle = this.background;
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.fillRect(
                0,
                0,
                this.width,
                this.height
            );
            context.restore();
            return true;
        }
    }
}