namespace SchemeDesigner {
    /**
     * Scheme
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    export class Scheme {
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
         * Ratio for cache scheme
         */
        protected cacheSchemeRatio: number = 2;

        /**
         * View
         */
        protected view: View;


        /**
         * Cache view
         */
        protected cacheView: View;

        /**
         * Constructor
         * @param {HTMLCanvasElement} canvas
         * @param {Object} params
         */
        constructor(canvas: HTMLCanvasElement, params?: any)
        {
            this.view = new View(canvas);

            /**
             * Managers
             */
            this.scrollManager = new ScrollManager(this);

            this.zoomManager = new ZoomManager(this);

            this.eventManager = new EventManager(this);

            this.storageManager = new StorageManager(this);

            this.resize();

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
            let newWidth = Math.max(0, Math.floor(Tools.getMaximumWidth(this.view.getCanvas())));
            let newHeight = Math.max(0, Math.floor(Tools.getMaximumHeight(this.view.getCanvas())));

            this.view.setDimensions({
                width: newWidth,
                height: newHeight
            });

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
            return this.view.getWidth();
        }

        /**
         * Get height
         * @returns {number}
         */
        public getHeight(): number
        {
            return this.view.getHeight();
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
            this.view.getContext().clearRect(
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

            this.updateCache();

            this.drawFromCache(this.scrollManager.getScrollLeft(), this.scrollManager.getScrollTop());
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

            this.view.setScrollLeft(scrollLeft);
            this.view.setScrollTop(scrollTop);

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
                    schemeObject.render(this, this.view);
                }
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
            return this.view.getCanvas();
        }

        /**
         * Set cursor style
         * @param {string} cursor
         * @returns {SchemeDesigner}
         */
        public setCursorStyle(cursor: string): this
        {
            this.view.getCanvas().style.cursor = cursor;
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
                (this.view.getCanvas().style as any)[styleName] = 'none';
            }
        }


        /**
         * Draw from cache
         * @param left
         * @param top
         */
        public drawFromCache(left: number, top: number)
        {
            if (!this.cacheView) {
                return false;
            }

            this.clearContext();

            let scale = this.zoomManager.getScale();

            let boundingRect = this.storageManager.getObjectsBoundingRect();
            let rectWidth = boundingRect.right * scale;
            let rectHeight = boundingRect.bottom * scale;

            this.view.getContext().save();
            this.view.getContext().scale(1 / scale, 1 / scale);
            this.view.getContext().drawImage(this.cacheView.getCanvas(), left, top, rectWidth, rectHeight);
            this.view.getContext().restore();
        }

        /**
         * Update scheme cache
         */
        public updateCache(): void
        {
            if (!this.cacheView) {
                let storage = this.storageManager.getImageStorage('scheme-cache');
                this.cacheView = new View(storage.getCanvas());
            }

            let boundingRect = this.storageManager.getObjectsBoundingRect();


            let scale = (1 / this.zoomManager.getScaleWithAllObjects()) * this.cacheSchemeRatio;
            let rectWidth = boundingRect.right * scale;
            let rectHeight = boundingRect.bottom * scale;

            this.cacheView.setDimensions({
                width: rectWidth,
                height: rectHeight
            });

            this.cacheView.getContext().scale(scale, scale);

            for (let schemeObject of this.getObjects()) {
                schemeObject.render(this, this.cacheView);
            }

        }

        /**
         * Set cacheSchemeRatio
         * @param value
         */
        public setCacheSchemeRatio(value: number): void
        {
            this.cacheSchemeRatio = value;
        }

        /**
         * get cacheSchemeRatio
         * @returns {number}
         */
        public getCAcheSchemeRatio(): number
        {
            return this.cacheSchemeRatio;
        }

        /**
         * Use scheme from cache
         * @returns {boolean}
         */
        public useSchemeCache(): boolean
        {
            let objectsDimensions = this.storageManager.getObjectsDimensions();

            let ratio = (objectsDimensions.width * this.zoomManager.getScale()) / this.getWidth();

            if (this.cacheSchemeRatio && ratio <= this.cacheSchemeRatio) {
                return true;
            }

            return false;
        }

        /**
         * Get view
         * @returns {View}
         */
        public getView(): View
        {
            return this.view;
        }
    }
}
