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