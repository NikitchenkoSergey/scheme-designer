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
         * Zoom manager
         */
        protected zoomManager: ZoomManager;

        /**
         * Storage manager
         */
        protected storageManager: StorageManager;

        /**
         * Default cursor style
         */
        protected defaultCursorStyle: string = 'default';

        /**
         * Constructor
         * @param {HTMLCanvasElement} canvas
         * @param {Object} params
         */
        constructor(canvas: HTMLCanvasElement, params?: any)
        {
            this.canvas = canvas;

            this.canvas2DContext = this.canvas.getContext('2d', { alpha: false }) as CanvasRenderingContext2D;

            this.requestFrameAnimation = Polyfill.getRequestAnimationFrameFunction();
            this.cancelFrameAnimation = Polyfill.getCancelAnimationFunction();
            this.devicePixelRatio = Polyfill.getDevicePixelRatio();

            /**
             * Managers
             */
            this.scrollManager = new ScrollManager(this);

            this.zoomManager = new ZoomManager(this);

            this.eventManager = new EventManager(this);

            this.storageManager = new StorageManager(this);


            /**
             * Configure
             */
            if (params) {
                Tools.configure(this.scrollManager, params.scroll);
                Tools.configure(this.zoomManager, params.zoom);
                Tools.configure(this.storageManager, params.storage);
            }

            /**
             * Disable selections on canvas
             */
            this.disableCanvasSelection();

            /**
             * Bind events
             */
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
         * Get zoom manager
         * @returns {ZoomManager}
         */
        public getZoomManager(): ZoomManager
        {
            return this.zoomManager;
        }

        /**
         * Get storage manager
         * @returns {StorageManager}
         */
        public getStorageManager(): StorageManager
        {
            return this.storageManager;
        }

        /**
         * Request animation
         * @param animation
         * @returns {number}
         */
        protected requestFrameAnimationApply(animation: Function): number
        {
            return this.requestFrameAnimation.apply(window, [animation]);
        }

        /**
         * Cancel animation
         * @param requestId
         */
        protected cancelAnimationFrameApply(requestId: number): void
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
                this.canvas.width / this.zoomManager.getScale(),
                this.canvas.height / this.zoomManager.getScale()
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
         * Render scheme
         */
        public render(): void
        {
            this.requestRenderAll();

            /**
             * Create tree index
             */
            this.storageManager.getTree();

            /**
             * Set scheme to center with scale for all oblects
             */
            this.getZoomManager().setScale(this.zoomManager.getScaleWithAllObjects());
            this.getScrollManager().toCenter();
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

            for (let schemeObject of this.storageManager.getObjects()) {
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
            this.storageManager.addObject(object);
        }

        /**
         * Remove object
         * @param {SchemeObject} object
         */
        public removeObject(object: SchemeObject): void
        {
            this.storageManager.removeObject(object);
        }

        /**
         * Remove all objects
         */
        public removeObjects(): void
        {
            this.storageManager.removeObjects();
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
         * All objects
         * @returns {SchemeObject[]}
         */
        public getObjects(): SchemeObject[]
        {
            return this.storageManager.getObjects();
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
         * Disable selection on canvas
         */
        protected disableCanvasSelection(): void
        {
            let styles = [
                '-webkit-touch-callout',
                '-webkit-user-select',
                '-khtml-user-select',
                '-moz-user-select',
                '-ms-user-select',
                'user-select',
                'outline'
            ];
            for (let styleName of styles) {
                (this.canvas.style as any)[styleName] = 'none';
            }
        }
    }
}
