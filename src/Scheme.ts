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
         * Map manager
         */
        protected mapManager: MapManager;

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
         * Changed objects
         */
        protected changedObjects: SchemeObject[] = [];

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

            this.mapManager = new MapManager(this);

            this.storageManager = new StorageManager(this);


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
                Tools.configure(this.mapManager, params.map);
                Tools.configure(this.storageManager, params.storage);
            }

            /**
             * Disable selections on canvas
             */
            Tools.disableElementSelection(this.view.getCanvas());

            /**
             * Set dimensions
             */
            this.resize();
        }

        /**
         * Resize canvas
         */
        public resize(): void
        {
            this.view.resize();
            this.mapManager.resize();
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
         * Get map manager
         * @returns {MapManager}
         */
        public getMapManager(): MapManager
        {
            return this.mapManager;
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
            return this.requestFrameAnimation.call(window, animation);
        }

        /**
         * Cancel animation
         * @param requestId
         */
        public cancelAnimationFrameApply(requestId: number): void
        {
            return this.cancelFrameAnimation.call(window, requestId);
        }

        /**
         * Clear canvas context
         */
        public clearContext(): this
        {
            let context = this.view.getContext();
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(
                0,
                0,
                this.getWidth(),
                this.getHeight()
            );
            context.restore();
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
            /**
             * Create tree index
             */
            this.storageManager.getTree();

            /**
             * Set scheme to center with scale for all objects
             */
            this.zoomManager.setScale(this.zoomManager.getScaleWithAllObjects());
            this.scrollManager.toCenter();

            this.updateCache(false);

            this.requestDrawFromCache();
        }

        /**
         * Get visible bounding rect
         * @returns {{left: number, top: number, right: number, bottom: number}}
         */
        public getVisibleBoundingRect(): BoundingRect
        {
            let scale = this.zoomManager.getScale();

            let width = this.getWidth() / scale;
            let height = this.getHeight() / scale;
            let leftOffset = -this.scrollManager.getScrollLeft() / scale;
            let topOffset = -this.scrollManager.getScrollTop() / scale;

            return {
                left: leftOffset,
                top: topOffset,
                right: leftOffset + width,
                bottom: topOffset + height
            };
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

            let visibleBoundingRect = this.getVisibleBoundingRect();

            let nodes = this.storageManager.findNodesByBoundingRect(null, visibleBoundingRect);

            let layers = this.storageManager.getSortedLayers();

            let renderedObjectIds: any = {};

            for (let layer of layers) {
                for (let node of nodes) {
                    for (let schemeObject of node.getObjectsByLayer(layer.getId())) {
                        let objectId = schemeObject.getId();
                        if (typeof renderedObjectIds[objectId] !== 'undefined') {
                            continue;
                        }
                        renderedObjectIds[objectId] = true;
                        schemeObject.render(this, this.view);
                    }
                }
            }

            this.mapManager.drawMap();

            this.eventManager.sendEvent('afterRenderAll');
        }

        /**
         * Add layer
         * @param layer
         */
        public addLayer(layer: Layer): void
        {
            this.storageManager.addLayer(layer);
        }

        /**
         * Remove layer
         * @param layerId
         */
        public removeLayer(layerId: string): void
        {
            this.storageManager.removeLayer(layerId);
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
         * Get default cursor style
         * @returns {string}
         */
        public getDefaultCursorStyle(): string
        {
            return this.defaultCursorStyle;
        }


        /**
         * Draw from cache
         * @returns {boolean}
         */
        public drawFromCache(): boolean
        {
            if (!this.cacheView) {
                return false;
            }

            if (this.renderingRequestId) {
                this.cancelAnimationFrameApply(this.renderingRequestId);
                this.renderingRequestId = 0;
            }

            this.clearContext();

            let boundingRect = this.storageManager.getObjectsBoundingRect();

            this.view.getContext().drawImage(
                this.cacheView.getCanvas(),
                0,
                0,
                boundingRect.right,
                boundingRect.bottom
            );

            this.mapManager.drawMap();

            return true;
        }


        /**
         * Request draw from cache
         * @returns {Scheme}
         */
        public requestDrawFromCache(): this
        {
            if (!this.renderingRequestId) {
                this.renderingRequestId = this.requestFrameAnimationApply(() => { this.drawFromCache(); });
            }

            return this;
        }

        /**
         * Update scheme cache
         * @param onlyChanged
         */
        public updateCache(onlyChanged: boolean): void
        {
            if (!this.cacheView) {
                let storage = this.storageManager.getImageStorage('scheme-cache');
                this.cacheView = new View(storage.getCanvas());
            }


            if (onlyChanged) {
                for (let schemeObject of this.changedObjects) {
                    let layer = this.storageManager.getLayerById(schemeObject.getLayerId());

                    if (layer instanceof Layer && layer.isVisible()) {
                        schemeObject.clear(this, this.cacheView);
                        schemeObject.render(this, this.cacheView);
                    }
                }
            } else {
                let boundingRect = this.storageManager.getObjectsBoundingRect();

                let scale = (1 / this.zoomManager.getScaleWithAllObjects()) * this.cacheSchemeRatio;
                let rectWidth = boundingRect.right * scale;
                let rectHeight = boundingRect.bottom * scale;

                this.cacheView.setDimensions({
                    width: rectWidth,
                    height: rectHeight
                });

                this.cacheView.getContext().scale(scale, scale);

                let layers = this.storageManager.getSortedLayers();
                for (let layer of layers) {
                    for (let schemeObject of layer.getObjects()) {
                        schemeObject.render(this, this.cacheView);
                    }
                }
            }

            this.changedObjects = [];
        }

        /**
         * Add changed object
         * @param schemeObject
         */
        public addChangedObject(schemeObject: SchemeObject): void
        {
            this.changedObjects.push(schemeObject);
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

        /**
         * Get cache view
         * @returns {View}
         */
        public getCacheView(): View
        {
            return this.cacheView;
        }
    }
}
