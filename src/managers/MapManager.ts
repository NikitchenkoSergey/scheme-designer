namespace SchemeDesigner {
    /**
     * Map manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    export class MapManager {

        /**
         * Scheme object
         */
        protected scheme: Scheme;

        /**
         * Canvas element for map
         */
        protected mapCanvas: HTMLCanvasElement;

        /**
         * Map view
         */
        protected mapView: View;

        /**
         * Is dragging
         */
        protected isDragging: boolean = false;
        /**
         * Left button down
         */
        protected leftButtonDown: boolean = false;

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
        }

        /**
         * Scaled scheme rect
         * @returns {number}
         */
        protected getScaledSchemeRect(): ScaledRect
        {
            let imageBoundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();
            let imageWidth = imageBoundingRect.right;
            let imageHeight = imageBoundingRect.bottom;

            let mapWidth = this.mapView.getWidth();
            let mapHeight = this.mapView.getHeight();

            let mapRatio = mapWidth / mapHeight;
            let imageRatio = imageWidth / imageHeight;

            let scaleFactor = mapRatio < imageRatio ? mapWidth / imageWidth : mapHeight / imageHeight;

            let newImageWidth = imageWidth * scaleFactor;
            let newImageHeight = imageHeight * scaleFactor;

            let leftOffset = (mapWidth - newImageWidth) / 2;
            let topOffset = (mapHeight - newImageHeight) / 2;

            return {
                scaleFactor: scaleFactor,
                width: newImageWidth,
                height: newImageHeight,
                leftOffset: leftOffset,
                topOffset: topOffset
            };
        }

        /**
         * Get rect dimensions
         * @param scaledSchemeRect
         * @returns BoundingRect
         */
        protected getRectBoundingRect(scaledSchemeRect: ScaledRect): BoundingRect
        {
            let visibleBoundingRect = this.scheme.getVisibleBoundingRect();
            let rectX = visibleBoundingRect.left * scaledSchemeRect.scaleFactor + scaledSchemeRect.leftOffset;
            let rectY = visibleBoundingRect.top * scaledSchemeRect.scaleFactor + scaledSchemeRect.topOffset;
            let rectWidth = (visibleBoundingRect.right - visibleBoundingRect.left) * scaledSchemeRect.scaleFactor;
            let rectHeight = (visibleBoundingRect.bottom - visibleBoundingRect.top) * scaledSchemeRect.scaleFactor;

            return {
                left: rectX,
                top: rectY,
                right: rectX + rectWidth,
                bottom: rectY + rectHeight
            };
        }

        /**
         * Draw map
         * @returns {boolean}
         */
        public drawMap(): boolean
        {
            let cacheView = this.scheme.getCacheView();
            if (!this.mapView || !cacheView) {
                return false;
            }

            let scaledSchemeRect = this.getScaledSchemeRect();

            let mapContext = this.mapView.getContext();

            mapContext.clearRect(
                0,
                0,
                this.mapView.getWidth(),
                this.mapView.getHeight()
            );

            mapContext.drawImage(
                cacheView.getCanvas(),
                scaledSchemeRect.leftOffset,
                scaledSchemeRect.topOffset,
                scaledSchemeRect.width,
                scaledSchemeRect.height
            );

            let rectBoundingRect = this.getRectBoundingRect(scaledSchemeRect);
            this.drawRect(rectBoundingRect);

            return true;
        }

        /**
         * Draw rect
         * @param boundingRect
         */
        protected drawRect(boundingRect: BoundingRect): void
        {
            let mapContext = this.mapView.getContext();

            mapContext.lineWidth = 1;
            mapContext.strokeStyle = '#000';
            mapContext.strokeRect(
                boundingRect.left,
                boundingRect.top,
                boundingRect.right - boundingRect.left,
                boundingRect.bottom - boundingRect.top
            );

            let rectBackgroundWidth = this.mapView.getWidth() * 2;
            let rectBackgroundHeight = this.mapView.getHeight() * 2;

            let backgroundColor = 'rgba(0, 0, 0, 0.1)';
            mapContext.fillStyle = backgroundColor;
            mapContext.strokeStyle = backgroundColor;
            mapContext.lineWidth = 0;

            mapContext.fillRect(
                0,
                0,
                boundingRect.left,
                rectBackgroundHeight
            );
            mapContext.fillRect(
                boundingRect.left,
                0,
                boundingRect.right - boundingRect.left,
                boundingRect.top
            );
            mapContext.fillRect(
                boundingRect.right,
                0,
                rectBackgroundWidth,
                rectBackgroundHeight
            );
            mapContext.fillRect(
                boundingRect.left,
                boundingRect.bottom,
                boundingRect.right - boundingRect.left,
                rectBackgroundHeight
            );

        }

        /**
         * Set mapCanvas
         * @param value
         */
        public setMapCanvas(value: HTMLCanvasElement): void
        {
            this.mapCanvas = value;
            this.mapView = new View(this.mapCanvas);
            this.bindEvents();
            Tools.disableElementSelection(this.mapCanvas);
        }

        /**
         * Resize map view
         */
        public resize(): void
        {
            if (this.mapView) {
                this.mapView.resize();
            }
        }

        /**
         * Bind events
         */
        protected bindEvents(): void
        {
            // mouse events
            this.mapCanvas.addEventListener('mousedown', (e: MouseEvent) => {
                this.onMouseDown(e);
            });
            this.mapCanvas.addEventListener('mouseup', (e: MouseEvent) => {
                this.onMouseUp(e);
            });
            this.mapCanvas.addEventListener('mousemove', (e: MouseEvent) => {
                this.onMouseMove(e);
            });
            this.mapCanvas.addEventListener('mouseout', (e: MouseEvent) => {
                this.onMouseOut(e);
            });
            this.mapCanvas.addEventListener('click', (e: MouseEvent) => {
                this.onClick(e);
            });
            // wheel
            this.mapCanvas.addEventListener('mousewheel', (e: MouseWheelEvent) => {
                this.onMouseWheel(e);
            });
            // for FF
            this.mapCanvas.addEventListener('DOMMouseScroll', (e: MouseWheelEvent) => {
                this.onMouseWheel(e);
            });
        }

        /**
         * Zoom by wheel
         * @param e
         */
        protected onMouseWheel(e: MouseWheelEvent): void
        {
            let delta = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;

            if (delta) {
                let eventCoordinates = this.getCoordinatesFromEvent(e);
                this.scrollByCoordinates(eventCoordinates);
                this.scheme.getZoomManager().zoomToCenter(delta);
            }

            return e.preventDefault() && false;
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
         * Mouse out
         * @param e
         */
        protected onMouseOut(e: MouseEvent): void
        {
            this.setLastClientPositionFromEvent(e);
            this.leftButtonDown = false;
            this.isDragging = false;
        }

        /**
         * Set cursor style
         * @param {string} cursor
         * @returns {SchemeDesigner}
         */
        public setCursorStyle(cursor: string): this
        {
            this.mapCanvas.style.cursor = cursor;
            return this;
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
                let eventCoordinates = this.getCoordinatesFromEvent(e);
                this.scrollByCoordinates(eventCoordinates);
                this.setCursorStyle('default');
            }

            // defer for prevent trigger click on mouseUp
            setTimeout(() => {this.isDragging = false; }, 1);
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
                    this.setCursorStyle('move');
                }
            }

            if (this.isDragging) {
                let eventCoordinates = this.getCoordinatesFromEvent(e);
                this.scrollByCoordinates(eventCoordinates);
            }
        }


        /**
         * Set last client position
         * @param e
         */
        protected setLastClientPositionFromEvent(e: MouseEvent | TouchEvent): void
        {
            let coordinates = this.getCoordinatesFromEvent(e);
            this.setLastClientPosition(coordinates);
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
        protected getLastClientX(): number
        {
            return this.lastClientPosition.x;
        }

        /**
         * Get last client y
         * @returns {number}
         */
        protected getLastClientY(): number
        {
            return this.lastClientPosition.y;
        }

        /**
         * Get real scheme coordinates
         * @param coordinates
         * @returns {{x: number, y: number}}
         */
        protected getRealCoordinates(coordinates: Coordinates): Coordinates
        {
            let scaledSchemeRect = this.getScaledSchemeRect();
            let schemeScale = this.scheme.getZoomManager().getScale();

            let boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();

            let rectBoundingRect = this.getRectBoundingRect(scaledSchemeRect);
            let rectWidth = rectBoundingRect.right - rectBoundingRect.left;
            let rectHeight = rectBoundingRect.bottom - rectBoundingRect.top;

            let realX = (coordinates.x - scaledSchemeRect.leftOffset - (rectWidth / 2)) / scaledSchemeRect.scaleFactor;
            let realY = (coordinates.y - scaledSchemeRect.topOffset - (rectHeight / 2)) / scaledSchemeRect.scaleFactor;

            // process scheme scale
            let x = (realX - boundingRect.left) * schemeScale;
            let y = (realY - boundingRect.top) * schemeScale;

            return {
                x: x,
                y: y
            };
        }

        /**
         * Scroll by coordinates
         * @param coordinates
         */
        protected scrollByCoordinates(coordinates: Coordinates): void
        {
            let realCoordinates = this.getRealCoordinates(coordinates);

            this.scheme.getScrollManager().scroll(-realCoordinates.x, -realCoordinates.y);
        }

        /**
         * On click
         * @param e
         */
        protected onClick(e: MouseEvent): void
        {
            if (!this.isDragging) {
                let eventCoordinates = this.getCoordinatesFromEvent(e);
                this.scrollByCoordinates(eventCoordinates);
            }
        }

        /**
         * Get coordinates from event
         * @param e
         * @returns {number[]}
         */
        protected getCoordinatesFromEvent(e: MouseEvent | TouchEvent): Coordinates
        {
            let clientRect = this.mapCanvas.getBoundingClientRect();
            let x = Tools.getPointer(e, 'clientX') - clientRect.left;
            let y = Tools.getPointer(e, 'clientY') - clientRect.top;

            return {x, y};
        }
    }
}