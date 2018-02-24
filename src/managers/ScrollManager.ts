namespace SchemeDesigner {
    /**
     * Scroll manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    export class ScrollManager {
        /**
         * Scheme object
         */
        protected scheme: Scheme;

        /**
         * Scroll left
         */
        protected scrollLeft: number = 0;

        /**
         * Scroll top
         */
        protected scrollTop: number = 0;

        /**
         * Max hidden part on scroll
         */
        protected maxHiddenPart: number = 0.85;

        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        constructor(scheme: Scheme)
        {
            this.scheme = scheme;
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
         * Set scroll
         * @param {number} left
         * @param {number} top
         */
        public scroll(left: number, top: number): void
        {
            let boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();

            let scale = this.scheme.getZoomManager().getScale();

            let maxScrollLeft = (this.scheme.getCanvas().width / scale) - boundingRect.left;
            let maxScrollTop = (this.scheme.getCanvas().height / scale) - boundingRect.top;

            let minScrollLeft = -boundingRect.right;
            let minScrollTop = -boundingRect.bottom;

            maxScrollLeft = maxScrollLeft * this.maxHiddenPart;
            maxScrollTop = maxScrollTop * this.maxHiddenPart;
            minScrollLeft = minScrollLeft * this.maxHiddenPart;
            minScrollTop = minScrollTop * this.maxHiddenPart;


            if (left > maxScrollLeft) {
                left = maxScrollLeft;
            }

            if (top > maxScrollTop) {
                top = maxScrollTop;
            }

            if (left < minScrollLeft) {
                left = minScrollLeft;
            }

            if (top < minScrollTop) {
                top = minScrollTop;
            }

            this.scrollLeft = left;
            this.scrollTop = top;
            this.scheme.requestRenderAll();
        }

        /**
         * Set scheme to center og objects
         */
        public toCenter(): void
        {
            let boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();

            let boundingRectWidth = (boundingRect.right - boundingRect.left) * this.scheme.getZoomManager().getScale();
            let boundingRectHeight = (boundingRect.bottom - boundingRect.top) * this.scheme.getZoomManager().getScale();

            let widthDelta =  this.scheme.getCanvas().width - boundingRectWidth;
            let heightDelta = this.scheme.getCanvas().height - boundingRectHeight;

            let scrollLeft = (widthDelta / 2) / this.scheme.getZoomManager().getScale();
            let scrollTop = (heightDelta / 2) / this.scheme.getZoomManager().getScale();


            // left and top empty space
            scrollLeft = scrollLeft  - boundingRect.left;
            scrollTop = scrollTop  - boundingRect.top;

            this.scroll(scrollLeft, scrollTop);
        }

        /**
         * Handle dragging
         * @param e
         */
        public handleDragging(e: MouseEvent | TouchEvent): void
        {
            let lastClientX = this.scheme.getEventManager().getLastClientX();
            let lastClientY = this.scheme.getEventManager().getLastClientY();

            this.scheme.getEventManager().setLastClientPositionFromEvent(e);

            let leftCenterOffset =  this.scheme.getEventManager().getLastClientX() - lastClientX;
            let topCenterOffset =  this.scheme.getEventManager().getLastClientY() - lastClientY;

            // scale
            leftCenterOffset = leftCenterOffset / this.scheme.getZoomManager().getScale();
            topCenterOffset = topCenterOffset / this.scheme.getZoomManager().getScale();

            let scrollLeft = leftCenterOffset + this.getScrollLeft();
            let scrollTop = topCenterOffset + this.getScrollTop();

            this.scroll(scrollLeft, scrollTop);
        }

        /**
         * Set max hidden part
         * @param value
         */
        public setMaxHiddenPart(value: number): void
        {
            this.maxHiddenPart = value;
        }
    }
}