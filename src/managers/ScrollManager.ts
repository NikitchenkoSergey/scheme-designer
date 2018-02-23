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
            let boundingRect = this.scheme.getObjectsBoundingRect();
            let leftScrollDelta = this.scrollLeft - left;

            this.scrollLeft = left;
            this.scrollTop = top;
            this.scheme.requestRenderAll();
        }

        /**
         * Set scheme to center og objects
         */
        public toCenter(): void
        {
            let boundingRect = this.scheme.getObjectsBoundingRect();

            let widthDelta = (boundingRect.right / this.scheme.getScale()) - this.scheme.getCanvas().width;
            let heightDelta = (boundingRect.bottom / this.scheme.getScale()) - this.scheme.getCanvas().height;

            let scrollLeft = widthDelta / 2;
            let scrollTop = heightDelta / 2;

            this.scroll(scrollLeft, scrollTop);
        }

        /**
         * Handle dragging
         * @param e
         */
        public handleDragging(e: MouseEvent): void
        {
            let lastClientX = this.scheme.getEventManager().getLastClientX();
            let lastClientY = this.scheme.getEventManager().getLastClientY();
            this.scheme.getEventManager().setLastClientPosition(e);

            let leftCenterOffset =  this.scheme.getEventManager().getLastClientX() - lastClientX;
            let topCenterOffset =  this.scheme.getEventManager().getLastClientY() - lastClientY;

            // scale
            leftCenterOffset = leftCenterOffset / this.scheme.getScale();
            topCenterOffset = topCenterOffset / this.scheme.getScale();

            let scrollLeft = leftCenterOffset + this.getScrollLeft();
            let scrollTop = topCenterOffset + this.getScrollTop();

            this.scroll(scrollLeft, scrollTop);
        }
    }
}