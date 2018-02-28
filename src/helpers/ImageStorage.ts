namespace SchemeDesigner {
    /**
     * ImageStorage
     */
    export class ImageStorage {

        /**
         * Canvas
         */
        protected canvas: HTMLCanvasElement;

        /**
         * context
         */
        protected context: CanvasRenderingContext2D;

        /**
         * Id
         */
        protected id: string;

        /**
         * Scheme object
         */
        protected scheme: Scheme;

        /**
         * Constructor
         * @param id
         * @param scheme
         */
        constructor(id: string, scheme: Scheme)
        {
            this.id = 'scheme-designer-image-storage-' + Tools.getRandomString() + '-' + id;

            this.scheme = scheme;

            let canvas = document.getElementById(id) as HTMLCanvasElement;
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = this.id;
                canvas.style.display = 'none';
                this.scheme.getCanvas().parentNode.appendChild(canvas);
            }

            this.canvas = canvas;
            this.context = this.canvas.getContext('2d');
        }

        /**
         * Set image data
         * @param imageData
         * @param width
         * @param height
         */
        public setImageData(imageData: ImageData, width: number, height: number): void
        {
            this.setDimensions({width: width, height: height});
            this.context.putImageData(imageData, 0, 0);
        }

        /**
         * Set dimensions
         * @param dimensions
         */
        public setDimensions(dimensions: Dimensions): void
        {
            this.canvas.width = dimensions.width;
            this.canvas.height = dimensions.height;
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
         * Get context
         * @returns {CanvasRenderingContext2D}
         */
        public getContext(): CanvasRenderingContext2D
        {
            return this.context;
        }
    }
}
