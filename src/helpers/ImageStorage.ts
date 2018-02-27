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
         * Constructor
         * @param id
         */
        constructor(id: string) {
            let canvas = document.getElementById(id) as HTMLCanvasElement;
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = id;
                canvas.style.display = 'none';
                document.body.appendChild(canvas);
            }

            this.canvas = canvas;
            this.context = this.canvas.getContext("2d");
        }

        /**
         * Set image data
         * @param imageData
         * @param width
         * @param height
         */
        public setImageData(imageData: ImageData, width: number, height: number)
        {
            this.canvas.width = width;
            this.canvas.height = height;
            this.context.putImageData(imageData, 0, 0);
        }

        /**
         * Get canvas
         * @returns {HTMLCanvasElement}
         */
        public getCanvas()
        {
            return this.canvas;
        }

        /**
         * Get context
         * @returns {CanvasRenderingContext2D}
         */
        public getContext()
        {
            return this.context;
        }
    }
}