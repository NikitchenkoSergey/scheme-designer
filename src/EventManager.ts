namespace SchemeDesigner {
    /**
     * Event manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    export class EventManager {
        /**
         * Scheme object
         */
        protected scheme: Scheme;

        /**
         * Is dragging
         */
        protected isDragging: boolean = false;

        /**
         * Hovered objects
         */
        protected hoveredObjects: SchemeObject[] = [];

        /**
         * Last client x
         */
        protected lastClientX: number;

        /**
         * Last client Y
         */
        protected lastClientY: number;

        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        constructor(scheme: Scheme)
        {
            this.scheme = scheme;

            this.lastClientX = this.scheme.getCanvas().width / 2;
            this.lastClientY = this.scheme.getCanvas().height / 2;
        }

        /**
         * Bind events
         */
        public bindEvents(): void
        {
            // mouse events
            this.scheme.getCanvas().addEventListener('mousedown', (e: MouseEvent) => {
                this.onMouseDown(e)
            });
            this.scheme.getCanvas().addEventListener('mouseup', (e: MouseEvent) => {
                this.onMouseUp(e)
            });
            this.scheme.getCanvas().addEventListener('click', (e: MouseEvent) => {
                this.onClick(e)
            });
            this.scheme.getCanvas().addEventListener('dblclick', (e: MouseEvent) => {
                this.onDoubleClick(e)
            });
            this.scheme.getCanvas().addEventListener('mousemove', (e: MouseEvent) => {
                this.onMouseMove(e)
            });
            this.scheme.getCanvas().addEventListener('mouseout', (e: MouseEvent) => {
                this.onMouseOut(e)
            });
            this.scheme.getCanvas().addEventListener('mouseenter', (e: MouseEvent) => {
                this.onMouseEnter(e)
            });
            this.scheme.getCanvas().addEventListener('contextmenu', (e: MouseEvent) => {
                this.onContextMenu(e)
            });

            // wheel
            this.scheme.getCanvas().addEventListener('mousewheel', (e: MouseWheelEvent) => {
                this.onMouseWheel(e)
            });

            // touch events
            // todo touchstart
            // todo touchmove
        }

        /**
         * Mouse down
         * @param e
         */
        protected onMouseDown(e: MouseEvent): void
        {
            this.setLastClientPosition(e);
            this.scheme.setCursorStyle('move');
            this.isDragging = true;
        }

        /**
         * Mouse up
         * @param e
         */
        protected onMouseUp(e: MouseEvent): void
        {
            this.setLastClientPosition(e);
            this.scheme.setCursorStyle(this.scheme.getDefaultCursorStyle());
            this.isDragging = false;
        }

        /**
         * On click
         * @param e
         */
        protected onClick(e: MouseEvent): void
        {
            if (!this.isDragging) {
                let objects = this.findObjectsForEvent(e);
                for (let schemeObject of objects) {
                    schemeObject.isSelected = !schemeObject.isSelected;

                    this.scheme.sendEvent('clickOnObject', schemeObject);
                }
                if (objects.length) {
                    this.scheme.requestRenderAll();
                }
            }
        }

        /**
         * todo
         * @param e
         */
        protected onDoubleClick(e: MouseEvent): void
        {

        }

        /**
         * todo
         * @param e
         */
        protected onContextMenu(e: MouseEvent): void
        {

        }

        /**
         * On mouse move
         * @param e
         */
        protected onMouseMove(e: MouseEvent): void
        {
            if (!this.isDragging) {
                this.handleHover(e);
            } else {
                this.handleDragging(e);
            }
        }

        /**
         * Handling hover
         * @param e
         */
        protected handleHover(e: MouseEvent): void
        {
            this.setLastClientPosition(e);

            let objects = this.findObjectsForEvent(e);
            let mustReRender = false;
            let hasNewHovers = false;

            if (this.hoveredObjects.length) {
                for (let schemeHoveredObject of this.hoveredObjects) {
                    // already hovered
                    let alreadyHovered = false;

                    for (let schemeObject of objects) {
                        if (schemeObject == schemeHoveredObject) {
                            alreadyHovered = true;
                        }
                    }

                    if (!alreadyHovered) {
                        schemeHoveredObject.isHovered = false;
                        this.scheme.sendEvent('mouseLeaveObject', schemeHoveredObject);

                        mustReRender = true;
                        hasNewHovers = true;
                    }
                }
            }

            if (!this.hoveredObjects.length || hasNewHovers) {
                for (let schemeObject of objects) {
                    schemeObject.isHovered = true;
                    mustReRender = true;
                    this.scheme.setCursorStyle(schemeObject.cursorStyle);

                    this.scheme.sendEvent('mouseOverObject', schemeObject);
                }
            }

            this.hoveredObjects = objects;

            if (!objects.length) {
                this.scheme.setCursorStyle(this.scheme.getDefaultCursorStyle());
            }

            if (mustReRender) {
                this.scheme.requestRenderAll();
            }
        }

        /**
         * Handle dragging
         * @param e
         */
        protected handleDragging(e: MouseEvent): void
        {
            let lastClientX = this.lastClientX;
            let lastClientY = this.lastClientY;
            this.setLastClientPosition(e);

            let leftCenterOffset = lastClientX - this.lastClientX;
            let topCenterOffset = lastClientY - this.lastClientY;

            // scale
            leftCenterOffset = Math.round(leftCenterOffset / this.scheme.getScale());
            topCenterOffset = Math.round(topCenterOffset / this.scheme.getScale());

            let scrollLeft = leftCenterOffset + this.scheme.getScrollLeft();
            let scrollTop = topCenterOffset + this.scheme.getScrollTop();

            this.scheme.scroll(scrollLeft, scrollTop);
        }

        /**
         * Mouse out
         * @param e
         */
        protected onMouseOut(e: MouseEvent): void
        {
            this.setLastClientPosition(e);
            this.isDragging = false;
            this.scheme.requestRenderAll();
        }

        /**
         * todo
         * @param e
         */
        protected onMouseEnter(e: MouseEvent): void
        {

        }

        /**
         * Zoom by wheel
         * @param e
         */
        protected onMouseWheel(e: MouseWheelEvent): void
        {
            let delta = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;
            if (delta) {
                let oldScale = this.scheme.getScale();

                this.scheme.zoom(delta);

                this.setLastClientPosition(e);

                // scroll to cursor
                let k = 0.2 / this.scheme.getScale();
                let leftOffsetDelta = (this.lastClientX - (this.scheme.getCanvas().width / 2)) * k;
                let topOffsetDelta = (this.lastClientY - (this.scheme.getCanvas().height / 2)) * k;

                this.scheme.scroll(
                    this.scheme.getScrollLeft() + leftOffsetDelta,
                    this.scheme.getScrollTop() + topOffsetDelta
                );
            }

            return e.preventDefault() && false;
        }

        /**
         * Set last clent position
         * @param e
         */
        protected setLastClientPosition(e: MouseEvent): void
        {
            let coordinates = this.getCoordinatesFromEvent(e);
            this.lastClientX = coordinates[0];
            this.lastClientY = coordinates[1];
        }

        /**
         * Find objects by event
         * @param e
         * @returns {SchemeObject[]}
         */
        protected findObjectsForEvent(e: MouseEvent)
        {
            let coordinates = this.getCoordinatesFromEvent(e);
            return this.scheme.findObjectsByCoordinates(coordinates[0], coordinates[1]);
        }

        /**
         * Get coordinates from event
         * @param e
         * @returns {number[]}
         */
        protected getCoordinatesFromEvent(e: MouseEvent): [number, number]
        {
            let clientRect = this.scheme.getCanvas().getBoundingClientRect();
            let x = e.clientX - clientRect.left;
            let y = e.clientY - clientRect.top;

            return [x, y];
        }

        /**
         * Get last client x
         * @returns {number}
         */
        public getLastClientX(): number
        {
            return this.lastClientX;
        }

        /**
         * Get last client y
         * @returns {number}
         */
        public getLastClientY(): number
        {
            return this.lastClientY;
        }
    }
}
