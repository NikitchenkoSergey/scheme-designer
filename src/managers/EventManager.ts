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
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        constructor(scheme: Scheme)
        {
            this.scheme = scheme;

            this.setLastClientPosition({
                x: this.scheme.getCanvas().width / 2,
                y: this.scheme.getCanvas().height / 2
            });
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
            this.scheme.getCanvas().addEventListener('touchstart', (e: TouchEvent) => {
                this.onMouseDown(e)
            });
            this.scheme.getCanvas().addEventListener('touchmove', (e: TouchEvent) => {
                this.onMouseMove(e)
            });
            this.scheme.getCanvas().addEventListener('touchend', (e: TouchEvent) => {
                this.onMouseUp(e)
            });
            this.scheme.getCanvas().addEventListener('touchcancel', (e: TouchEvent) => {
                this.onMouseUp(e)
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
            }

            // defer for prevent trigger click on mouseUp
            setTimeout(() => {this.isDragging = false;}, 50);
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

                    this.sendEvent('clickOnObject', schemeObject);
                }
                if (objects.length) {
                    this.scheme.requestRenderAll();
                }
            }
        }

        /**
         * Double click
         * @param e
         */
        protected onDoubleClick(e: MouseEvent): void
        {

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
         * Get pointer from event
         * @param e
         * @param clientProp
         * @returns {number}
         */
        protected getPointer(e: MouseEvent | TouchEvent, clientProp: string): number
        {
        let touchProp = e.type === 'touchend' ? 'changedTouches' : 'touches';

        let event = (e as any);

        return (event[touchProp] && event[touchProp][0]
            ? event[touchProp][0][clientProp]
            : event[clientProp]);
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
                    // already hovered
                    let alreadyHovered = false;

                    for (let schemeObject of objects) {
                        if (schemeObject == schemeHoveredObject) {
                            alreadyHovered = true;
                        }
                    }

                    if (!alreadyHovered) {
                        schemeHoveredObject.isHovered = false;
                        this.sendEvent('mouseLeaveObject', schemeHoveredObject);

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

                    this.sendEvent('mouseOverObject', schemeObject);
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
            return this.scheme.findObjectsByCoordinates(coordinates);
        }

        /**
         * Get coordinates from event
         * @param e
         * @returns {number[]}
         */
        protected getCoordinatesFromEvent(e: MouseEvent | TouchEvent): Coordinates
        {
            let clientRect = this.scheme.getCanvas().getBoundingClientRect();
            let x = this.getPointer(e, 'clientX') - clientRect.left;
            let y = this.getPointer(e, 'clientY') - clientRect.top;

            return {x, y};
        }

        /**
         * Set last client position
         * @param coordinates
         */
        public setLastClientPosition(coordinates: Coordinates): void
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
