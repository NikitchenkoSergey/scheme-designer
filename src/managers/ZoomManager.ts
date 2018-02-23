namespace SchemeDesigner {
    /**
     * Zoom manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    export class ZoomManager {
        /**
         * Scheme object
         */
        protected scheme: Scheme;

        /**
         * Current scale
         */
        protected scale: number = 1;

        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        constructor(scheme: Scheme)
        {
            this.scheme = scheme;
        }

        /**
         * Set zoom
         * @param {number} delta
         * @returns {boolean}
         */
        public zoom(delta: number): boolean
        {
            let factor = Math.pow(1.03, delta);

            return this.zoomByFactor(factor);
        }

        /**
         * Set scale
         * @param scale
         * @returns {boolean}
         */
        public setScale(scale: number): boolean
        {
            let factor =  this.scale / scale;

            return this.zoomByFactor(factor);
        }

        /**
         * Scale with all objects visible + padding 10%
         * @returns {number}
         */
        public getScaleWithAllObjects(): number
        {
            let boundingRect = this.scheme.getObjectsBoundingRect();

            let maxScaleX = ((boundingRect.right - boundingRect.left) * 1.1) / this.scheme.getCanvas().width;
            let maxScaleY = ((boundingRect.bottom - boundingRect.top) * 1.1) / this.scheme.getCanvas().height;

            return maxScaleX > maxScaleY ? maxScaleX : maxScaleY;
        }

        /**
         * Zoom by factor
         * @param factor
         * @returns {boolean}
         */
        public zoomByFactor(factor: number): boolean
        {
            let boundingRect = this.scheme.getObjectsBoundingRect();

            let canScaleX = true;
            let canScaleY = true;

            if (factor < 1) {
                /**
                 * Cant zoom less that 70%
                 */
                canScaleX = this.scheme.getCanvas().width / 1.3 < boundingRect.right * this.scale;
                canScaleY = this.scheme.getCanvas().height / 1.3 < boundingRect.bottom * this.scale;
            } else {
                canScaleX = true;
                canScaleY = true;
            }

            if (canScaleX || canScaleY) {
                this.scheme.getCanvas2DContext().scale(factor, factor);
                this.scale = this.scale * factor;
                this.scheme.requestRenderAll();
                return true;
            }

            return false;
        }

        /**
         * Get scale
         * @returns {number}
         */
        public getScale(): number
        {
            return this.scale;
        }

    }
}