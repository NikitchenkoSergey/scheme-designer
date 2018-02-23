namespace SchemeDesigner {
    /**
     * Scheme
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    export class Scheme {
        /**
         * Canvas element
         */
        protected canvas: HTMLCanvasElement;

        /**
         * Canvas context
         */
        protected canvas2DContext: CanvasRenderingContext2D;

        /**
         * All objects
         */
        protected objects: SchemeObject[];

        /**
         * Objects bounding rect
         */
        protected objectsBoundingRect: any;

        /**
         * Frame animation
         */
        protected requestFrameAnimation: any;

        /**
         * Cancel animation
         */
        protected cancelFrameAnimation: any;

        /**
         * Current number of rendering request
         */
        protected renderingRequestId: number = 0;


        /**
         * Device Pixel Ratio
         */
        protected devicePixelRatio: number = 1;

        /**
         * Event manager
         */
        protected eventManager: EventManager;

        /**
         * Scroll manager
         */
        protected scrollManager: ScrollManager;

        /**
         * Default cursor style
         */
        protected defaultCursorStyle: string = 'default';

        /**
         * Current scale
         */
        protected scale: number = 1;

        /**
         * Constructor
         * @param {HTMLCanvasElement} canvas
         * @param {Object} params
         */
        constructor(canvas: HTMLCanvasElement, params?: any)
        {
            this.objects = [];

            this.canvas = canvas;

            this.canvas2DContext = this.canvas.getContext('2d');

            this.requestFrameAnimation = this.getRequestAnimationFrameFunction();
            this.cancelFrameAnimation = this.getCancelAnimationFunction();
            this.devicePixelRatio = this.getDevicePixelRatio();

            /**
             * Managers
             */
            this.scrollManager = new ScrollManager(this);

            this.eventManager = new EventManager(this);
            this.eventManager.bindEvents();
        }

        /**
         * Get event manager
         * @returns {EventManager}
         */
        public getEventManager(): EventManager
        {
            return this.eventManager;
        }

        /**
         * Get scroll manager
         * @returns {ScrollManager}
         */
        public getScrollManager(): ScrollManager
        {
            return this.scrollManager;
        }

        /**
         * Get request animation frame function, polyfill
         * @returns {Object}
         */
        protected getRequestAnimationFrameFunction(): any
        {
            let variables: string[] = [
                'requestAnimationFrame',
                'webkitRequestAnimationFrame',
                'mozRequestAnimationFrame',
                'oRequestAnimationFrame',
                'msRequestAnimationFrame'
            ];

            for (let variableName of variables) {
                if (window.hasOwnProperty(variableName)) {
                    return (window as any)[variableName];
                }
            }

            return function (callback: any) {
                return window.setTimeout(callback, 1000 / 60);
            };
        }

        /**
         * Get cancel animation function, polyfill
         * @returns {(handle:number)=>void}
         */
        protected getCancelAnimationFunction(): any
        {
            return window.cancelAnimationFrame || window.clearTimeout;
        }

        /**
         * Get device pixel radio, polyfill
         * @returns {number}
         */
        protected getDevicePixelRatio(): number
        {
            let variables: string[] = [
                'devicePixelRatio',
                'webkitDevicePixelRatio',
                'mozDevicePixelRatio'
            ];

            for (let variableName of variables) {
                if (window.hasOwnProperty(variableName)) {
                    return (window as any)[variableName];
                }
            }

            return 1;
        }

        /**
         * Request animation
         * @param requestId
         * @returns {any}
         */
        protected requestFrameAnimationApply(requestId: any): any
        {
            return this.requestFrameAnimation.apply(window, [requestId]);
        }

        /**
         * Cancel animation
         * @param requestId
         * @returns {any}
         */
        protected cancelAnimationFrameApply(requestId: any): any
        {
            return this.cancelFrameAnimation.apply(window, [requestId]);
        }

        /**
         * Clear canvas context
         */
        public clearContext(): this
        {
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
        public requestRenderAll(): this
        {
            if (!this.renderingRequestId) {
                this.renderingRequestId = this.requestFrameAnimationApply(() => {this.renderAll()});
            }

            return this;
        }

        /**
         * todo render only visible objects
         * Render all objects
         */
        protected renderAll(): void
        {
            if (this.renderingRequestId) {
                this.cancelAnimationFrameApply(this.renderingRequestId);
                this.renderingRequestId = 0;
            }

            this.eventManager.sendEvent('beforeRenderAll');

            this.clearContext();

            for (let schemeObject of this.objects) {
                schemeObject.render(this);
            }

            this.eventManager.sendEvent('afterRenderAll');
        }

        /**
         * Add object
         * @param {SchemeObject} object
         */
        public addObject(object: SchemeObject): void
        {
            this.objects.push(object);
            this.reCalcObjectsBoundingRect();
        }

        /**
         * Remove object
         * @param {SchemeObject} object
         */
        public removeObject(object: SchemeObject): void
        {
            this.objects.filter(existObject => existObject !== object);
            this.reCalcObjectsBoundingRect();
        }

        /**
         * Remove all objects
         */
        public removeObjects(): void
        {
            this.objects = [];
        }

        /**
         * Canvas getter
         * @returns {HTMLCanvasElement}
         */
        public getCanvas(): HTMLCanvasElement
        {
            return this.canvas;
        }

        /**
         * Canvas context getter
         * @returns {CanvasRenderingContext2D}
         */
        public getCanvas2DContext(): CanvasRenderingContext2D
        {
            return this.canvas2DContext;
        }

        /**
         * Set cursor style
         * @param {string} cursor
         * @returns {SchemeDesigner}
         */
        public setCursorStyle(cursor: string): this
        {
            this.canvas.style.cursor = cursor;
            return this;
        }


        /**
         * Set zoom
         * @param {number} delta
         * @returns {boolean}
         */
        public zoom(delta: number): boolean
        {
            let factor = Math.pow(1.03, delta);

            let boundingRect = this.getObjectsBoundingRect();

            let canScaleX = true;
            let canScaleY = true;
            if (factor < 1) {
                canScaleX = this.canvas.width / 1.3 < boundingRect.right * this.scale;
                canScaleY = this.canvas.height / 1.3 < boundingRect.bottom * this.scale;
            } else {
                canScaleX = true;
                canScaleY = true;
            }

            if (canScaleX || canScaleY) {
                this.canvas2DContext.scale(factor, factor);
                this.scale = this.scale * factor;
                this.requestRenderAll();
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
         * find objects by coordinates
         * @param x
         * @param y
         * @returns {SchemeObject[]}
         */
        public findObjectsByCoordinates(x: number, y: number): SchemeObject[]
        {
            let result: SchemeObject[] = [];

            // scale
            x = x / this.scale;
            y = y / this.scale;

            // scroll
            x = x - this.scrollManager.getScrollLeft();
            y = y - this.scrollManager.getScrollTop();


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
         * All objects
         * @returns {SchemeObject[]}
         */
        public getObjects(): SchemeObject[]
        {
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
        public getObjectsBoundingRect(): any
        {
            if (!this.objectsBoundingRect) {
                this.objectsBoundingRect = this.calculateObjectsBoundingRect();
            }
            return this.objectsBoundingRect;
        }

        /**
         * Recalculate bounding rect
         */
        public reCalcObjectsBoundingRect()
        {
            this.objectsBoundingRect = null;
        }


        /**
         * Get bounding rect of all objects
         * @returns {{left: number, top: number, right: number, bottom: number}}
         */
        public calculateObjectsBoundingRect(): any
        {
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
    }
}
