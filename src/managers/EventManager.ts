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
         * Left button down
         */
        protected leftButtonDown: boolean = false;

        /**
         * Hovered objects
         */
        protected hoveredObjects: SchemeObject[] = [];

        /**
         * Last client position
         */
        protected lastClientPosition: Coordinates;

        /**
         * distance for touch zoom
         */
        protected touchDistance: number;

        /**
         * Last touch end time
         * @type {number}
         */
        protected lastTouchEndTime: number = 0;

        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        constructor(scheme: Scheme)
        {
            this.scheme = scheme;

            this.setLastClientPosition({
                x: this.scheme.getWidth() / 2,
                y: this.scheme.getHeight() / 2
            });
        }

        /**
         * Bind events
         */
        public bindEvents(): void
        {
            // mouse events
            this.scheme.getCanvas().addEventListener('mousedown', (e: MouseEvent) => {
                this.onMouseDown(e);
            });
            this.scheme.getCanvas().addEventListener('mouseup', (e: MouseEvent) => {
                this.onMouseUp(e);
            });
            this.scheme.getCanvas().addEventListener('click', (e: MouseEvent) => {
                this.onClick(e);
            });
            this.scheme.getCanvas().addEventListener('dblclick', (e: MouseEvent) => {
                this.onDoubleClick(e);
            });
            this.scheme.getCanvas().addEventListener('mousemove', (e: MouseEvent) => {
                this.onMouseMove(e);
            });
            this.scheme.getCanvas().addEventListener('mouseout', (e: MouseEvent) => {
                this.onMouseOut(e);
            });
            this.scheme.getCanvas().addEventListener('mouseenter', (e: MouseEvent) => {
                this.onMouseEnter(e);
            });
            this.scheme.getCanvas().addEventListener('contextmenu', (e: MouseEvent) => {
                this.onContextMenu(e);
            });

            // wheel
            this.scheme.getCanvas().addEventListener('mousewheel', (e: MouseWheelEvent) => {
                this.onMouseWheel(e);
            });
            // for FF
            this.scheme.getCanvas().addEventListener('DOMMouseScroll', (e: MouseWheelEvent) => {
                this.onMouseWheel(e);
            });

            // touch events
            this.scheme.getCanvas().addEventListener('touchstart', (e: TouchEvent) => {
                this.touchDistance = 0;
                this.onMouseDown(e);
            });

            this.scheme.getCanvas().addEventListener('touchmove', (e: TouchEvent) => {
                if (e.targetTouches.length == 1) {
                    // one finger - dragging
                    this.onMouseMove(e);
                } else if (e.targetTouches.length == 2) {
                    // two finger - zoom
                    const p1 = e.targetTouches[0];
                    const p2 = e.targetTouches[1];

                    // euclidean distance
                    let distance = Math.sqrt(Math.pow(p2.pageX - p1.pageX, 2) + Math.pow(p2.pageY - p1.pageY, 2));

                    let delta = 0;
                    if(this.touchDistance) {
                        delta = distance - this.touchDistance;
                    }

                    this.touchDistance = distance;

                    if (delta) {
                        this.scheme.getZoomManager().zoomToPointer(e, delta / 5);
                    }
                }
                e.preventDefault();
            });

            this.scheme.getCanvas().addEventListener('touchend', (e: TouchEvent) => {
                // prevent double tap zoom
                let now = (new Date()).getTime();
                if (this.lastTouchEndTime && now - this.lastTouchEndTime <= 300) {
                    e.preventDefault();
                } else {
                    this.onMouseUp(e);
                }
                this.lastTouchEndTime = now;
            });

            this.scheme.getCanvas().addEventListener('touchcancel', (e: TouchEvent) => {
                this.onMouseUp(e);
            });

            // resize
            window.addEventListener('resize', (e: Event) => {

                let prevScale = this.scheme.getZoomManager().getScale();

                this.scheme.resize();
                this.scheme.requestRenderAll();

                if (!this.scheme.getZoomManager().zoomByFactor(prevScale)) {
                    this.scheme.getZoomManager().setScale(this.scheme.getZoomManager().getScaleWithAllObjects());
                }
            });
        }

        /**
         * Mouse down
         * @param e
         */
        protected onMouseDown(e: MouseEvent | TouchEvent): void
        {
            this.leftButtonDown = true;
            this.setLastClientPositionFromEvent(e);
        }

        /**
         * Mouse up
         * @param e
         */
        protected onMouseUp(e: MouseEvent | TouchEvent): void
        {
            this.leftButtonDown = false;
            this.setLastClientPositionFromEvent(e);

            if (this.isDragging) {
                this.scheme.setCursorStyle(this.scheme.getDefaultCursorStyle());

                this.scheme.requestRenderAll();
            }

            // defer for prevent trigger click on mouseUp
            setTimeout(() => {this.isDragging = false; }, 1);
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
                    schemeObject.click(e, this.scheme, this.scheme.getView());
                    this.scheme.addChangedObject(schemeObject);
                    this.sendEvent('clickOnObject', schemeObject);
                }

                if (objects.length) {
                    this.scheme.requestRenderAll();
                    this.scheme.updateCache(true);
                }
            }
        }

        /**
         * Double click
         * @param e
         */
        protected onDoubleClick(e: MouseEvent): void
        {
            this.scheme.getZoomManager().zoomToPointer(e, 14);
        }

        /**
         * Right click
         * @param e
         */
        protected onContextMenu(e: MouseEvent): void
        {

        }

        /**
         * On mouse move
         * @param e
         */
        protected onMouseMove(e: MouseEvent | TouchEvent): void
        {
            if (this.leftButtonDown) {
                let newCoordinates = this.getCoordinatesFromEvent(e);
                let deltaX = Math.abs(newCoordinates.x - this.getLastClientX());
                let deltaY = Math.abs(newCoordinates.y - this.getLastClientY());

                // 1 - is click with offset - mis drag
                if (deltaX > 1 || deltaY > 1) {
                    this.isDragging = true;
                    this.scheme.setCursorStyle('move');
                }
            }

            if (!this.isDragging) {
                this.handleHover(e);
            } else {
                this.scheme.getScrollManager().handleDragging(e);
            }
        }

        /**
         * Handling hover
         * @param e
         */
        protected handleHover(e: MouseEvent | TouchEvent): void
        {
            this.setLastClientPositionFromEvent(e);

            let objects = this.findObjectsForEvent(e);
            let mustReRender = false;
            let hasNewHovers = false;

            if (this.hoveredObjects.length) {
                for (let schemeHoveredObject of this.hoveredObjects) {
                    let alreadyHovered = false;

                    for (let schemeObject of objects) {
                        if (schemeObject == schemeHoveredObject) {
                            alreadyHovered = true;
                        }
                    }

                    if (!alreadyHovered) {
                        schemeHoveredObject.isHovered = false;

                        let result = schemeHoveredObject.mouseLeave(e, this.scheme, this.scheme.getView());
                        this.scheme.addChangedObject(schemeHoveredObject);

                        this.sendEvent('mouseLeaveObject', schemeHoveredObject);

                        if (result !== false) {
                            mustReRender = true;
                        }
                        hasNewHovers = true;
                    }
                }
            }

            if (!this.hoveredObjects.length || hasNewHovers) {
                for (let schemeObject of objects) {
                    schemeObject.isHovered = true;
                    this.scheme.setCursorStyle(schemeObject.cursorStyle);

                    let result = schemeObject.mouseOver(e, this.scheme, this.scheme.getView());

                    if (result !== false) {
                        mustReRender = true;
                    }

                    this.scheme.addChangedObject(schemeObject);

                    this.sendEvent('mouseOverObject', schemeObject);
                }
            }

            this.hoveredObjects = objects;

            if (!objects.length) {
                this.scheme.setCursorStyle(this.scheme.getDefaultCursorStyle());
            }

            if (mustReRender) {
                this.scheme.requestRenderAll();
                this.scheme.updateCache(true);
            }
        }

        /**
         * Mouse out
         * @param e
         */
        protected onMouseOut(e: MouseEvent): void
        {
            this.setLastClientPositionFromEvent(e);
            this.leftButtonDown = false;
            this.isDragging = false;
            this.scheme.requestRenderAll();
        }

        /**
         * Mouse enter
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
           return this.scheme.getZoomManager().handleMouseWheel(e);
        }

        /**
         * Set last client position
         * @param e
         */
        public setLastClientPositionFromEvent(e: MouseEvent | TouchEvent): void
        {
            let coordinates = this.getCoordinatesFromEvent(e);
            this.setLastClientPosition(coordinates);
        }

        /**
         * Find objects by event
         * @param e
         * @returns {SchemeObject[]}
         */
        protected findObjectsForEvent(e: MouseEvent | TouchEvent): SchemeObject[]
        {
            let coordinates = this.getCoordinatesFromEvent(e);
            return this.scheme.getStorageManager().findObjectsByCoordinates(coordinates);
        }

        /**
         * Get coordinates from event
         * @param e
         * @returns {number[]}
         */
        protected getCoordinatesFromEvent(e: MouseEvent | TouchEvent): Coordinates
        {
            let clientRect = this.scheme.getCanvas().getBoundingClientRect();
            let x = Tools.getPointer(e, 'clientX') - clientRect.left;
            let y = Tools.getPointer(e, 'clientY') - clientRect.top;

            return {x, y};
        }

        /**
         * Set last client position
         * @param coordinates
         */
        protected setLastClientPosition(coordinates: Coordinates): void
        {
            this.lastClientPosition = coordinates;
        }

        /**
         * Get last client x
         * @returns {number}
         */
        public getLastClientX(): number
        {
            return this.lastClientPosition.x;
        }

        /**
         * Get last client y
         * @returns {number}
         */
        public getLastClientY(): number
        {
            return this.lastClientPosition.y;
        }

        /**
         * Send event
         * @param {string} eventName
         * @param data
         */
        public sendEvent(eventName: string, data?: any): void
        {
            let fullEventName = `schemeDesigner.${eventName}`;

            if (typeof CustomEvent === 'function') {
                let event = new CustomEvent(fullEventName, {
                    detail: data
                });
                this.scheme.getCanvas().dispatchEvent(event);
            } else {
                let event = document.createEvent('CustomEvent');
                event.initCustomEvent(fullEventName, false, false, data);
                this.scheme.getCanvas().dispatchEvent(event);
            }
        }
    }
}
