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
         * Zoom coefficient
         */
        protected zoomCoefficient = 1.04;

        /**
         * Padding for max zoom
         */
        protected padding = 0.1;

        /**
         * Max scale
         */
        protected maxScale = 5;

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
            let factor = Math.pow(this.zoomCoefficient, delta);

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
         * Scale with all objects visible + padding
         * @returns {number}
         */
        public getScaleWithAllObjects(): number
        {
            let boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();

            let maxScaleX = ((boundingRect.right - boundingRect.left) * (this.padding + 1)) / this.scheme.getCanvas().width;
            let maxScaleY = ((boundingRect.bottom - boundingRect.top) * (this.padding + 1)) / this.scheme.getCanvas().height;

            return maxScaleX > maxScaleY ? maxScaleX : maxScaleY;
        }

        /**
         * Zoom by factor
         * @param factor
         * @returns {boolean}
         */
        public zoomByFactor(factor: number): boolean
        {
            let boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();

            let canScaleX = true;
            let canScaleY = true;

            let newScale = this.scale * factor;

            if (factor < 1) {
                /**
                 * Cant zoom less that 100% + padding
                 */
                canScaleX = this.scheme.getCanvas().width * (1 - this.padding) < boundingRect.right * newScale;
                canScaleY = this.scheme.getCanvas().height * (1 - this.padding) < boundingRect.bottom * newScale;
            } else {
                /**
                 * Cant zoom more that maxScale
                 */
                canScaleX = this.scheme.getCanvas().width * this.maxScale > boundingRect.right * newScale;
                canScaleY = this.scheme.getCanvas().height * this.maxScale > boundingRect.bottom * newScale;
            }

            if (canScaleX || canScaleY) {
                this.scheme.getCanvas2DContext().scale(factor, factor);
                this.scale = newScale;
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


        /**
         * Handle mouse wheel
         * @param e
         * @returns {void|boolean}
         */
        public handleMouseWheel(e: MouseWheelEvent): void
        {
            let delta = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;

            if (delta) {
                this.zoomToPointer(e, delta);
            }

            return e.preventDefault() && false;
        }

        /**
         * Zoom to pointer
         * @param e
         * @param delta
         */
        public zoomToPointer(e: MouseWheelEvent | MouseEvent, delta: number): void
        {
            let prevScale = this.scheme.getZoomManager().getScale();
            let zoomed = this.scheme.getZoomManager().zoom(delta);

            this.scheme.getEventManager().setLastClientPositionFromEvent(e);

            if (zoomed) {
                // scroll to cursor
                let newScale = this.scheme.getZoomManager().getScale();

                let prevCenter: Coordinates = {
                    x: this.scheme.getEventManager().getLastClientX() / prevScale,
                    y: this.scheme.getEventManager().getLastClientY() / prevScale,
                };

                let newCenter: Coordinates = {
                    x: this.scheme.getEventManager().getLastClientX() / newScale,
                    y: this.scheme.getEventManager().getLastClientY() / newScale,
                };

                let leftOffsetDelta = newCenter.x - prevCenter.x;
                let topOffsetDelta = newCenter.y - prevCenter.y;

                this.scheme.getScrollManager().scroll(
                    this.scheme.getScrollManager().getScrollLeft() + leftOffsetDelta,
                    this.scheme.getScrollManager().getScrollTop() + topOffsetDelta
                );
            }
        }

        /**
         * Set padding
         * @param value
         */
        public setPadding(value: number)
        {
            this.padding = value;
        }

        /**
         * Set max scale
         * @param value
         */
        public setMaxScale(value: number)
        {
            this.maxScale = value;
        }

        /**
         * Set zoomCoefficient
         * @param value
         */
        public setZoomCoefficient(value: number)
        {
            this.zoomCoefficient = value;
        }
    }
}