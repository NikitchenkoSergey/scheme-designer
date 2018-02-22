namespace SchemeDesigner {
    /**
     * Scheme
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    export class Scheme {
        /**
         * All objects
         */
        protected objects: SchemeObject[];

        /**
         * Canvas element
         */
        protected canvas: HTMLCanvasElement;

        /**
         * Canvas context
         */
        protected canvas2DContext: CanvasRenderingContext2D;

        /**
         * Frame interval
         */
        protected frameIntervalToken: number;

        /**
         * Frame interval delay
         */
        protected frameIntervalDelay: number = 10;

        /**
         * Requested render all
         */
        protected renderAllRequested: boolean = false;

        /**
         * Event manager
         */
        protected eventManager: EventManager;

        /**
         * Default cursor style
         */
        protected defaultCursorStyle: string = 'default';

        /**
         * Current scale
         */
        protected scale: number = 1;

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
         * @param {HTMLCanvasElement} canvas
         * @param {Object} params
         */
        constructor(canvas: HTMLCanvasElement, params?: any) {
            this.objects = [];

            this.canvas = canvas;

            this.canvas2DContext = this.canvas.getContext('2d');

            this.resetFrameInterval();

            this.eventManager = new EventManager(this);
            this.eventManager.bindEvents();
        }

        /**
         * Frame controller
         */
        protected frame(): void {
            if (this.renderAllRequested) {
                this.renderAll();
                this.renderAllRequested = false;
            }
        }

        /**
         * Reset frame interval
         */
        protected resetFrameInterval(): void {
            if (this.frameIntervalToken) {
                clearInterval(this.frameIntervalToken);
            }
            this.frameIntervalToken = setInterval(() => this.frame(), this.frameIntervalDelay);
        }

        /**
         * Clear canvas context
         */
        public clearContext(): this {
            this.canvas2DContext.clearRect(
                0,
                0,
                this.canvas.width / this.scale,
                this.canvas.height / this.scale
            );
            return this;
        }

        /**
         * Request render all
         */
        public requestRenderAll(): this {
            this.renderAllRequested = true;
            return this;
        }

        /**
         * todo render only visible objects
         * Render all objects
         */
        protected renderAll(): void {
            this.sendEvent('renderAllStart');

            this.clearContext();

            for (let schemeObject of this.objects) {
                schemeObject.render(this);
            }
            this.sendEvent('renderAllEnd');
        }

        /**
         * Send event
         * @param {string} eventName
         * @param data
         */
        public sendEvent(eventName: string, data?: any): void {
            let fullEventName = 'schemeDesigner.' + eventName;

            if (typeof CustomEvent === 'function') {
                let event = new CustomEvent(fullEventName, {
                    detail: data
                });
                this.canvas.dispatchEvent(event);
            } else {
                let event = document.createEvent('CustomEvent');
                event.initCustomEvent(fullEventName, false, false, data);
                this.canvas.dispatchEvent(event);
            }


        }

        /**
         * Add object
         * @param {SchemeObject} object
         */
        public addObject(object: SchemeObject): void {
            this.objects.push(object);
        }

        /**
         * Remove object
         * @param {SchemeObject} object
         */
        public removeObject(object: SchemeObject): void {
            this.objects.filter(existObject => existObject !== object);
        }

        /**
         * Remove all objects
         */
        public removeObjects(): void {
            this.objects = [];
        }

        /**
         * Canvas getter
         * @returns {HTMLCanvasElement}
         */
        public getCanvas(): HTMLCanvasElement {
            return this.canvas;
        }

        /**
         * Canvas context getter
         * @returns {CanvasRenderingContext2D}
         */
        public getCanvas2DContext(): CanvasRenderingContext2D {
            return this.canvas2DContext;
        }

        /**
         * Set frame interval delay
         * @param frameIntervalDelay
         * @returns {SchemeDesigner}
         */
        public setFrameIntervalDelay(frameIntervalDelay: number): this {
            this.frameIntervalDelay = frameIntervalDelay;
            return this;
        }

        /**
         * Set cursor style
         * @param {string} cursor
         * @returns {SchemeDesigner}
         */
        public setCursorStyle(cursor: string): this {
            this.canvas.style.cursor = cursor;
            return this;
        }


        /**
         * Set zoom
         * @param {number} delta
         */
        public zoom(delta: number): void {
            let factor = Math.pow(1.03, delta);

            let boundingRect = this.getObjectsBoundingRect();

            let canScaleX = true;
            let canScaleY = true;
            if (factor < 1) {
                canScaleX = this.canvas.width / 1.5 < boundingRect.right * this.scale;
                canScaleY = this.canvas.height / 1.5 < boundingRect.bottom * this.scale;
            } else {
                canScaleX = true;
                canScaleY = true;
            }

            if (canScaleX || canScaleY) {
                this.canvas2DContext.scale(factor, factor);
                this.scale = this.scale * factor;
                this.requestRenderAll();
            }
        }

        /**
         * Get scale
         * @returns {number}
         */
        public getScale(): number {
            return this.scale;
        }

        /**
         * find objects by coordinates
         * @param x
         * @param y
         * @returns {SchemeObject[]}
         */
        public findObjectsByCoordinates(x: number, y: number): SchemeObject[] {
            let result: SchemeObject[] = [];

            // scale
            x = x / this.scale;
            y = y / this.scale;

            // scroll
            x = x + this.scrollLeft;
            y = y + this.scrollTop;


            for (let schemeObject of this.objects) {
                let boundingRect = schemeObject.getBoundingRect();
                if (boundingRect.left <= x && boundingRect.right >= x
                    && boundingRect.top <= y && boundingRect.bottom >= y) {
                    result.push(schemeObject)
                }
            }

            return result;
        }

        /**
         * Get scroll left
         * @returns {number}
         */
        public getScrollLeft(): number {
            return this.scrollLeft;
        }

        /**
         * Get scroll top
         * @returns {number}
         */
        public getScrollTop(): number {
            return this.scrollTop;
        }

        /**
         * Set scroll
         * @param {number} left
         * @param {number} top
         */
        public scroll(left: number, top: number): void {
            this.scrollLeft = left;
            this.scrollTop = top;
            this.requestRenderAll();
        }

        /**
         * All objects
         * @returns {SchemeObject[]}
         */
        public getObjects(): SchemeObject[] {
            return this.objects;
        }

        /**
         * Get default cursor style
         * @returns {string}
         */
        public getDefaultCursorStyle(): string
        {
            return this.defaultCursorStyle;
        }


        /**
         * Get bounding rect of all objects
         * @returns {{left: number, top: number, right: number, bottom: number}}
         */
        public getObjectsBoundingRect(): any {
            let top: number;
            let left: number;
            let right: number;
            let bottom: number;

            for (let schemeObject of this.objects) {
                let schemeObjectBoundingRect = schemeObject.getBoundingRect();

                if (top == undefined || schemeObjectBoundingRect.top < top) {
                    top = schemeObjectBoundingRect.top;
                }

                if (left == undefined || schemeObjectBoundingRect.left < left) {
                    left = schemeObjectBoundingRect.left;
                }

                if (right == undefined || schemeObjectBoundingRect.right > right) {
                    right = schemeObjectBoundingRect.right;
                }

                if (bottom == undefined || schemeObjectBoundingRect.bottom > bottom) {
                    bottom = schemeObjectBoundingRect.bottom;
                }
            }

            return {
                left: left,
                top: top,
                right: right,
                bottom: bottom
            };
        }


        /**
         * Set scheme to center og objects
         */
        public toCenter(): void {
            let boundingRect = this.getObjectsBoundingRect();

            let widthDelta = (boundingRect.right / this.scale) - this.canvas.width;
            let heightDelta = (boundingRect.bottom / this.scale) - this.canvas.height;

            let scrollLeft = -(widthDelta / 2);
            let scrollTop = -(heightDelta / 2);

            this.scroll(scrollLeft, scrollTop);
        }
    }
}
