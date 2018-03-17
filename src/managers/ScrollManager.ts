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


            let maxScrollLeft = this.scheme.getWidth() - boundingRect.left;

            let maxScrollTop = this.scheme.getHeight() - boundingRect.top;

            let minScrollLeft = -boundingRect.right * scale;
            let minScrollTop = -boundingRect.bottom * scale;

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

            this.scheme.getView().setScrollTop(top);
            this.scheme.getView().setScrollLeft(left);

            this.scheme.getView().applyTransformation();

            // scroll fake scheme
            if (this.scheme.useSchemeCache()) {
                this.scheme.requestDrawFromCache();
            } else {
                this.scheme.requestRenderAll();
            }

            this.scheme.getEventManager().sendEvent('scroll', {
                left: left,
                top: top,
                maxScrollLeft: maxScrollLeft,
                maxScrollTop: maxScrollTop,
                minScrollLeft: minScrollLeft,
                minScrollTop: minScrollTop,
                boundingRect: boundingRect,
                scale: scale
            });
        }

        /**
         * Set scheme to center og objects
         */
        public toCenter(): void
        {
            let boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();
            let objectsDimensions = this.scheme.getStorageManager().getObjectsDimensions();

            let scale = this.scheme.getZoomManager().getScale();

            let widthDelta = this.scheme.getWidth() / scale - objectsDimensions.width;
            let heightDelta = this.scheme.getHeight() / scale - objectsDimensions.height;

            let scrollLeft = (widthDelta / 2) * scale;
            let scrollTop = (heightDelta / 2) * scale;

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
