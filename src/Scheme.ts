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
         * Width
         */
        protected width: number;

        /**
         * Height
         */
        protected height: number;

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
         * Storage with screen shot
         */
        protected screenShotStorage: ImageStorage;

        /**
         * Render all callback
         */
        protected renderAllCallback: Function;

        /**
         * Ratio, when scroll fake scheme
         */
        protected fakeSchemeRatio: number = 1.8;

        /**
         * Constructor
         * @param {HTMLCanvasElement} canvas
         * @param {Object} params
         */
        constructor(canvas: HTMLCanvasElement, params?: any)
        {
            this.canvas = canvas;

            /**
             * Managers
             */
            this.scrollManager = new ScrollManager(this);

            this.zoomManager = new ZoomManager(this);

            this.eventManager = new EventManager(this);

            this.storageManager = new StorageManager(this);

            this.resize();

            this.canvas2DContext = this.canvas.getContext('2d') as CanvasRenderingContext2D;

            this.requestFrameAnimation = Polyfill.getRequestAnimationFrameFunction();
            this.cancelFrameAnimation = Polyfill.getCancelAnimationFunction();
            this.devicePixelRatio = Polyfill.getDevicePixelRatio();

            /**
             * Configure
             */
            if (params) {
                Tools.configure(this, params.options);
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
         * Resize canvas
         */
        public resize(): void
        {
            let newWidth = Math.max(0, Math.floor(Tools.getMaximumWidth(this.canvas)));
            let newHeight = Math.max(0, Math.floor(Tools.getMaximumHeight(this.canvas)));

            this.width = this.canvas.width = newWidth;
            this.height = this.canvas.height = newHeight;

            this.zoomManager.resetScale();
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
         * Get width
         * @returns {number}
         */
        public getWidth(): number
        {
            return this.width;
        }

        /**
         * Get height
         * @returns {number}
         */
        public getHeight(): number
        {
            return this.height;
        }

        /**
         * Request animation
         * @param animation
         * @returns {number}
         */
        public requestFrameAnimationApply(animation: Function): number
        {
            return this.requestFrameAnimation.apply(window, [animation]);
        }

        /**
         * Cancel animation
         * @param requestId
         */
        public cancelAnimationFrameApply(requestId: number): void
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
                this.getWidth() / this.zoomManager.getScale(),
                this.getHeight() / this.zoomManager.getScale()
            );
            return this;
        }

        /**
         * Request render all
         * @param callback
         */
        public requestRenderAll(callback?: Function): this
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
            /**
             * Create tree index
             */
            this.storageManager.getTree();

            /**
             * Set scheme to center with scale for all objects
             */
            this.zoomManager.setScale(this.zoomManager.getScaleWithAllObjects());
            this.scrollManager.toCenter();

            this.renderAllCallback = () => {this.createScreenShot()};
            this.requestRenderAll();
        }

        /**
         * Render visible objects
         */
        protected renderAll(): void
        {
            if (this.renderingRequestId) {
                this.cancelAnimationFrameApply(this.renderingRequestId);
                this.renderingRequestId = 0;
            }

            this.eventManager.sendEvent('beforeRenderAll');

            this.clearContext();

            let scrollLeft = this.scrollManager.getScrollLeft();
            let scrollTop = this.scrollManager.getScrollTop();

            let width = this.getWidth() / this.zoomManager.getScale();
            let height = this.getHeight() / this.zoomManager.getScale();
            let leftOffset = -scrollLeft;
            let topOffset = -scrollTop;

            let nodes = this.storageManager.findNodesByBoundingRect(null, {
                left: leftOffset,
                top: topOffset,
                right: leftOffset + width,
                bottom: topOffset + height
            });

            for (let node of nodes) {
                for (let schemeObject of node.getObjects()) {
                    schemeObject.render(this);
                }
            }

            if (typeof this.renderAllCallback === 'function') {
                this.renderAllCallback.apply(window, []);
                this.renderAllCallback = null;
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


        /**
         *
         * @param left
         * @param top
         */
        public drawScreenShot(left: number, top: number)
        {
            if (!this.screenShotStorage) {
                return false;
            }

            let storage = this.screenShotStorage;

            this.clearContext();

            let scale = this.zoomManager.getScale();

            let boundingRect = this.storageManager.getObjectsBoundingRect();
            let rectWidth = boundingRect.right * scale;
            let rectHeight = boundingRect.bottom * scale;

            this.canvas2DContext.save();
            this.canvas2DContext.scale(1 / scale, 1 / scale);
            this.canvas2DContext.drawImage(storage.getCanvas(), left, top, rectWidth, rectHeight);
            this.canvas2DContext.restore();
        }

        /**
         * Creating screen shot
         */
        public createScreenShot()
        {
            let storage = this.storageManager.getImageStorage('screen-shot');
            let boundingRect = this.storageManager.getObjectsBoundingRect();

            let scale = this.zoomManager.getScale();
            let rectWidth = boundingRect.right * scale;
            let rectHeight = boundingRect.bottom * scale;

            let imageData = this.canvas2DContext.getImageData(
                this.scrollManager.getScrollLeft() * scale,
                this.scrollManager.getScrollTop() * scale,
                rectWidth,
                rectHeight
            );

            storage.setImageData(imageData, rectWidth, rectHeight);

            this.screenShotStorage = storage;
        }

        /**
         * Set fakeSchemeRatio
         * @param value
         */
        public setFakeSchemeRatio(value: number): void
        {
            this.fakeSchemeRatio = value;
        }

        /**
         * get fakeSchemeRatio
         * @returns {number}
         */
        public getFakeSchemeRatio(): number
        {
            return this.fakeSchemeRatio;
        }

        /**
         * Use fake scheme
         * @returns {boolean}
         */
        public useFakeScheme(): boolean
        {
            let objectsDimensions = this.storageManager.getObjectsDimensions();

            let ratio = (objectsDimensions.width * this.zoomManager.getScale()) / this.width;

            if (this.fakeSchemeRatio && ratio <= this.fakeSchemeRatio) {
                return true;
            }

            return false;
        }
    }
}
