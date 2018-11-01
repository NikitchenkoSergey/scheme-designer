var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Layer class
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    var Layer = /** @class */ (function () {
        /**
         * Constructor
         * @param id
         * @param {Object} params
         */
        function Layer(id, params) {
            /**
             * Z index
             */
            this.zIndex = 0;
            /**
             * Is active
             */
            this.active = true;
            /**
             * Is visible
             */
            this.visible = true;
            /**
             * Objects
             */
            this.objects = [];
            if (id.length == 0) {
                throw new Error('Empty layer id');
            }
            this.id = id;
            SchemeDesigner.Tools.configure(this, params);
        }
        /**
         * Remove object
         * @param {SchemeObject} object
         */
        Layer.prototype.removeObject = function (object) {
            this.objects.filter(function (existObject) { return existObject !== object; });
        };
        /**
         * Remove all objects
         */
        Layer.prototype.removeObjects = function () {
            this.objects = [];
        };
        /**
         * Get objects
         * @returns {SchemeObject[]}
         */
        Layer.prototype.getObjects = function () {
            return this.objects;
        };
        /**
         * Add object
         * @param {SchemeObject} object
         */
        Layer.prototype.addObject = function (object) {
            object.setLayerId(this.id);
            this.objects.push(object);
        };
        /**
         * Set zIndex
         * @param {number} value
         */
        Layer.prototype.setZIndex = function (value) {
            this.zIndex = value;
        };
        /**
         * Set active
         * @param {boolean} value
         */
        Layer.prototype.setActive = function (value) {
            this.active = value;
        };
        /**
         * Set visible
         * @param {boolean} value
         */
        Layer.prototype.setVisible = function (value) {
            this.visible = value;
        };
        /**
         * Get is visible
         * @return {boolean}
         */
        Layer.prototype.isVisible = function () {
            return this.visible;
        };
        /**
         * Get is active
         * @return {boolean}
         */
        Layer.prototype.isActive = function () {
            return this.active;
        };
        /**
         * Get z index
         * @return {boolean}
         */
        Layer.prototype.getZIndex = function () {
            return this.zIndex;
        };
        /**
         * Get id
         * @return {string}
         */
        Layer.prototype.getId = function () {
            return this.id;
        };
        return Layer;
    }());
    SchemeDesigner.Layer = Layer;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Scheme
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    var Scheme = /** @class */ (function () {
        /**
         * Constructor
         * @param {HTMLCanvasElement} canvas
         * @param {Object} params
         */
        function Scheme(canvas, params) {
            /**
             * Current number of rendering request
             */
            this.renderingRequestId = 0;
            /**
             * Device Pixel Ratio
             */
            this.devicePixelRatio = 1;
            /**
             * Default cursor style
             */
            this.defaultCursorStyle = 'default';
            /**
             * Ratio for cache scheme
             */
            this.cacheSchemeRatio = 2;
            /**
             * Changed objects
             */
            this.changedObjects = [];
            this.view = new SchemeDesigner.View(canvas);
            /**
             * Managers
             */
            this.scrollManager = new SchemeDesigner.ScrollManager(this);
            this.zoomManager = new SchemeDesigner.ZoomManager(this);
            this.eventManager = new SchemeDesigner.EventManager(this);
            this.mapManager = new SchemeDesigner.MapManager(this);
            this.storageManager = new SchemeDesigner.StorageManager(this);
            this.requestFrameAnimation = SchemeDesigner.Polyfill.getRequestAnimationFrameFunction();
            this.cancelFrameAnimation = SchemeDesigner.Polyfill.getCancelAnimationFunction();
            this.devicePixelRatio = SchemeDesigner.Polyfill.getDevicePixelRatio();
            /**
             * Configure
             */
            if (params) {
                SchemeDesigner.Tools.configure(this, params.options);
                SchemeDesigner.Tools.configure(this.scrollManager, params.scroll);
                SchemeDesigner.Tools.configure(this.zoomManager, params.zoom);
                SchemeDesigner.Tools.configure(this.mapManager, params.map);
                SchemeDesigner.Tools.configure(this.storageManager, params.storage);
            }
            /**
             * Disable selections on canvas
             */
            SchemeDesigner.Tools.disableElementSelection(this.view.getCanvas());
            /**
             * Set dimensions
             */
            this.resize();
        }
        /**
         * Resize canvas
         */
        Scheme.prototype.resize = function () {
            this.view.resize();
            this.mapManager.resize();
            this.zoomManager.resetScale();
        };
        /**
         * Get event manager
         * @returns {EventManager}
         */
        Scheme.prototype.getEventManager = function () {
            return this.eventManager;
        };
        /**
         * Get scroll manager
         * @returns {ScrollManager}
         */
        Scheme.prototype.getScrollManager = function () {
            return this.scrollManager;
        };
        /**
         * Get zoom manager
         * @returns {ZoomManager}
         */
        Scheme.prototype.getZoomManager = function () {
            return this.zoomManager;
        };
        /**
         * Get storage manager
         * @returns {StorageManager}
         */
        Scheme.prototype.getStorageManager = function () {
            return this.storageManager;
        };
        /**
         * Get map manager
         * @returns {MapManager}
         */
        Scheme.prototype.getMapManager = function () {
            return this.mapManager;
        };
        /**
         * Get width
         * @returns {number}
         */
        Scheme.prototype.getWidth = function () {
            return this.view.getWidth();
        };
        /**
         * Get height
         * @returns {number}
         */
        Scheme.prototype.getHeight = function () {
            return this.view.getHeight();
        };
        /**
         * Request animation
         * @param animation
         * @returns {number}
         */
        Scheme.prototype.requestFrameAnimationApply = function (animation) {
            return this.requestFrameAnimation.call(window, animation);
        };
        /**
         * Cancel animation
         * @param requestId
         */
        Scheme.prototype.cancelAnimationFrameApply = function (requestId) {
            return this.cancelFrameAnimation.call(window, requestId);
        };
        /**
         * Clear canvas context
         */
        Scheme.prototype.clearContext = function () {
            var context = this.view.getContext();
            context.save();
            context.setTransform(1, 0, 0, 1, 0, 0);
            context.clearRect(0, 0, this.getWidth(), this.getHeight());
            context.restore();
            return this;
        };
        /**
         * Request render all
         */
        Scheme.prototype.requestRenderAll = function () {
            var _this = this;
            if (!this.renderingRequestId) {
                this.renderingRequestId = this.requestFrameAnimationApply(function () { _this.renderAll(); });
            }
            return this;
        };
        /**
         * Render scheme
         */
        Scheme.prototype.render = function () {
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
        };
        /**
         * Get visible bounding rect
         * @returns {{left: number, top: number, right: number, bottom: number}}
         */
        Scheme.prototype.getVisibleBoundingRect = function () {
            var scale = this.zoomManager.getScale();
            var width = this.getWidth() / scale;
            var height = this.getHeight() / scale;
            var leftOffset = -this.scrollManager.getScrollLeft() / scale;
            var topOffset = -this.scrollManager.getScrollTop() / scale;
            return {
                left: leftOffset,
                top: topOffset,
                right: leftOffset + width,
                bottom: topOffset + height
            };
        };
        /**
         * Render visible objects
         */
        Scheme.prototype.renderAll = function () {
            if (this.renderingRequestId) {
                this.cancelAnimationFrameApply(this.renderingRequestId);
                this.renderingRequestId = 0;
            }
            this.eventManager.sendEvent('beforeRenderAll');
            this.clearContext();
            var visibleBoundingRect = this.getVisibleBoundingRect();
            var nodes = this.storageManager.findNodesByBoundingRect(null, visibleBoundingRect);
            var layers = this.storageManager.getSortedLayers();
            var renderedObjectIds = {};
            for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
                var layer = layers_1[_i];
                for (var _a = 0, nodes_1 = nodes; _a < nodes_1.length; _a++) {
                    var node = nodes_1[_a];
                    for (var _b = 0, _c = node.getObjectsByLayer(layer.getId()); _b < _c.length; _b++) {
                        var schemeObject = _c[_b];
                        var objectId = schemeObject.getId();
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
        };
        /**
         * Add layer
         * @param layer
         */
        Scheme.prototype.addLayer = function (layer) {
            this.storageManager.addLayer(layer);
        };
        /**
         * Remove layer
         * @param layerId
         */
        Scheme.prototype.removeLayer = function (layerId) {
            this.storageManager.removeLayer(layerId);
        };
        /**
         * Canvas getter
         * @returns {HTMLCanvasElement}
         */
        Scheme.prototype.getCanvas = function () {
            return this.view.getCanvas();
        };
        /**
         * Set cursor style
         * @param {string} cursor
         * @returns {SchemeDesigner}
         */
        Scheme.prototype.setCursorStyle = function (cursor) {
            this.view.getCanvas().style.cursor = cursor;
            return this;
        };
        /**
         * Get default cursor style
         * @returns {string}
         */
        Scheme.prototype.getDefaultCursorStyle = function () {
            return this.defaultCursorStyle;
        };
        /**
         * Draw from cache
         * @returns {boolean}
         */
        Scheme.prototype.drawFromCache = function () {
            if (!this.cacheView) {
                return false;
            }
            if (this.renderingRequestId) {
                this.cancelAnimationFrameApply(this.renderingRequestId);
                this.renderingRequestId = 0;
            }
            this.clearContext();
            var boundingRect = this.storageManager.getObjectsBoundingRect();
            this.view.getContext().drawImage(this.cacheView.getCanvas(), 0, 0, boundingRect.right, boundingRect.bottom);
            this.mapManager.drawMap();
            return true;
        };
        /**
         * Request draw from cache
         * @returns {Scheme}
         */
        Scheme.prototype.requestDrawFromCache = function () {
            var _this = this;
            if (!this.renderingRequestId) {
                this.renderingRequestId = this.requestFrameAnimationApply(function () { _this.drawFromCache(); });
            }
            return this;
        };
        /**
         * Update scheme cache
         * @param onlyChanged
         */
        Scheme.prototype.updateCache = function (onlyChanged) {
            if (!this.cacheView) {
                var storage = this.storageManager.getImageStorage('scheme-cache');
                this.cacheView = new SchemeDesigner.View(storage.getCanvas());
            }
            if (onlyChanged) {
                for (var _i = 0, _a = this.changedObjects; _i < _a.length; _i++) {
                    var schemeObject = _a[_i];
                    var layer = this.storageManager.getLayerById(schemeObject.getLayerId());
                    if (layer instanceof SchemeDesigner.Layer && layer.isVisible()) {
                        schemeObject.clear(this, this.cacheView);
                        schemeObject.render(this, this.cacheView);
                    }
                }
            }
            else {
                var boundingRect = this.storageManager.getObjectsBoundingRect();
                var scale = (1 / this.zoomManager.getScaleWithAllObjects()) * this.cacheSchemeRatio;
                var rectWidth = boundingRect.right * scale;
                var rectHeight = boundingRect.bottom * scale;
                this.cacheView.setDimensions({
                    width: rectWidth,
                    height: rectHeight
                });
                this.cacheView.getContext().scale(scale, scale);
                var layers = this.storageManager.getSortedLayers();
                for (var _b = 0, layers_2 = layers; _b < layers_2.length; _b++) {
                    var layer = layers_2[_b];
                    for (var _c = 0, _d = layer.getObjects(); _c < _d.length; _c++) {
                        var schemeObject = _d[_c];
                        schemeObject.render(this, this.cacheView);
                    }
                }
            }
            this.changedObjects = [];
        };
        /**
         * Add changed object
         * @param schemeObject
         */
        Scheme.prototype.addChangedObject = function (schemeObject) {
            this.changedObjects.push(schemeObject);
        };
        /**
         * Set cacheSchemeRatio
         * @param value
         */
        Scheme.prototype.setCacheSchemeRatio = function (value) {
            this.cacheSchemeRatio = value;
        };
        /**
         * get cacheSchemeRatio
         * @returns {number}
         */
        Scheme.prototype.getCAcheSchemeRatio = function () {
            return this.cacheSchemeRatio;
        };
        /**
         * Use scheme from cache
         * @returns {boolean}
         */
        Scheme.prototype.useSchemeCache = function () {
            var objectsDimensions = this.storageManager.getObjectsDimensions();
            var ratio = (objectsDimensions.width * this.zoomManager.getScale()) / this.getWidth();
            if (this.cacheSchemeRatio && ratio <= this.cacheSchemeRatio) {
                return true;
            }
            return false;
        };
        /**
         * Get view
         * @returns {View}
         */
        Scheme.prototype.getView = function () {
            return this.view;
        };
        /**
         * Get cache view
         * @returns {View}
         */
        Scheme.prototype.getCacheView = function () {
            return this.cacheView;
        };
        return Scheme;
    }());
    SchemeDesigner.Scheme = Scheme;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * SchemeObject class
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    var SchemeObject = /** @class */ (function () {
        /**
         * Constructor
         * @param {Object} params
         */
        function SchemeObject(params) {
            /**
             * Is active
             */
            this.active = true;
            /**
             * Rotation
             */
            this.rotation = 0;
            /**
             * Is hovered
             */
            this.isHovered = false;
            /**
             * Cursor style
             */
            this.cursorStyle = 'pointer';
            /**
             * Render function
             */
            this.renderFunction = function () { };
            /**
             * Clear function
             */
            this.clearFunction = function () { };
            this.id = SchemeDesigner.Tools.generateUniqueId();
            SchemeDesigner.Tools.configure(this, params);
            this.params = params;
        }
        /**
         * Set layer id
         * @param {string} layerId
         */
        SchemeObject.prototype.setLayerId = function (layerId) {
            this.layerId = layerId;
        };
        /**
         * Get layer id
         * @return {string}
         */
        SchemeObject.prototype.getLayerId = function () {
            return this.layerId;
        };
        /**
         * Get id
         * @returns {number}
         */
        SchemeObject.prototype.getId = function () {
            return this.id;
        };
        /**
         * Get x
         * @returns {number}
         */
        SchemeObject.prototype.getX = function () {
            return this.x;
        };
        /**
         * Get y
         * @returns {number}
         */
        SchemeObject.prototype.getY = function () {
            return this.y;
        };
        /**
         * Get width
         * @returns {number}
         */
        SchemeObject.prototype.getWidth = function () {
            return this.width;
        };
        /**
         * Get height
         * @returns {number}
         */
        SchemeObject.prototype.getHeight = function () {
            return this.height;
        };
        /**
         * Get params
         * @return {any}
         */
        SchemeObject.prototype.getParams = function () {
            return this.params;
        };
        /**
         * Rendering object
         * @param scheme
         * @param view
         */
        SchemeObject.prototype.render = function (scheme, view) {
            this.renderFunction(this, scheme, view);
        };
        /**
         * Clear object
         * @param scheme
         * @param view
         */
        SchemeObject.prototype.clear = function (scheme, view) {
            this.clearFunction(this, scheme, view);
        };
        /**
         * Click on object
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         * @param view
         * @return null|boolean
         */
        SchemeObject.prototype.click = function (e, schemeDesigner, view) {
            if (typeof this.clickFunction === 'function') {
                return this.clickFunction(this, schemeDesigner, view, e);
            }
            return null;
        };
        /**
         * Mouse over
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         * @param view
         * @return null|boolean
         */
        SchemeObject.prototype.mouseOver = function (e, schemeDesigner, view) {
            if (typeof this.mouseOverFunction === 'function') {
                return this.mouseOverFunction(this, schemeDesigner, view, e);
            }
            return null;
        };
        /**
         * Mouse leave
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         * @param view
         * @return null|boolean
         */
        SchemeObject.prototype.mouseLeave = function (e, schemeDesigner, view) {
            if (typeof this.mouseLeaveFunction === 'function') {
                return this.mouseLeaveFunction(this, schemeDesigner, view, e);
            }
            return null;
        };
        /**
         * Set x
         * @param {number} value
         */
        SchemeObject.prototype.setX = function (value) {
            this.x = value;
        };
        /**
         * Set y
         * @param {number} value
         */
        SchemeObject.prototype.setY = function (value) {
            this.y = value;
        };
        /**
         * Set width
         * @param {number} value
         */
        SchemeObject.prototype.setWidth = function (value) {
            this.width = value;
        };
        /**
         * Set height
         * @param {number} value
         */
        SchemeObject.prototype.setHeight = function (value) {
            this.height = value;
        };
        /**
         * Set cursorStyle
         * @param {string} value
         */
        SchemeObject.prototype.setCursorStyle = function (value) {
            this.cursorStyle = value;
        };
        /**
         * Set rotation
         * @param {number} value
         */
        SchemeObject.prototype.setRotation = function (value) {
            this.rotation = value;
        };
        /**
         * Set renderFunction
         * @param {Function} value
         */
        SchemeObject.prototype.setRenderFunction = function (value) {
            this.renderFunction = value;
        };
        /**
         * Set clickFunction
         * @param {Function} value
         */
        SchemeObject.prototype.setClickFunction = function (value) {
            this.clickFunction = value;
        };
        /**
         * Set clearFunction
         * @param {Function} value
         */
        SchemeObject.prototype.setClearFunction = function (value) {
            this.clearFunction = value;
        };
        /**
         * Set mouseOverFunction
         * @param {Function} value
         */
        SchemeObject.prototype.setMouseOverFunction = function (value) {
            this.mouseOverFunction = value;
        };
        /**
         * Set mouseLeaveFunction
         * @param {Function} value
         */
        SchemeObject.prototype.setMouseLeaveFunction = function (value) {
            this.mouseLeaveFunction = value;
        };
        /**
         * Bounding rect
         * @returns BoundingRect
         */
        SchemeObject.prototype.getBoundingRect = function () {
            return {
                left: this.x,
                top: this.y,
                right: this.x + this.width,
                bottom: this.y + this.height
            };
        };
        /**
         * Outer bound rect
         * @returns {BoundingRect}
         */
        SchemeObject.prototype.getOuterBoundingRect = function () {
            var boundingRect = this.getBoundingRect();
            if (!this.rotation) {
                return boundingRect;
            }
            // rotate from center
            var rectCenterX = (boundingRect.left + boundingRect.right) / 2;
            var rectCenterY = (boundingRect.top + boundingRect.bottom) / 2;
            var axis = { x: rectCenterX, y: rectCenterY };
            var leftTop = SchemeDesigner.Tools.rotatePointByAxis({ x: this.x, y: this.y }, axis, this.rotation);
            var leftBottom = SchemeDesigner.Tools.rotatePointByAxis({ x: this.x, y: this.y + this.height }, axis, this.rotation);
            var rightTop = SchemeDesigner.Tools.rotatePointByAxis({ x: this.x + this.width, y: this.y }, axis, this.rotation);
            var rightBottom = SchemeDesigner.Tools.rotatePointByAxis({ x: this.x + this.width, y: this.y + this.height }, axis, this.rotation);
            return {
                left: Math.min(leftTop.x, leftBottom.x, rightTop.x, rightBottom.x),
                top: Math.min(leftTop.y, leftBottom.y, rightTop.y, rightBottom.y),
                right: Math.max(leftTop.x, leftBottom.x, rightTop.x, rightBottom.x),
                bottom: Math.max(leftTop.y, leftBottom.y, rightTop.y, rightBottom.y),
            };
        };
        /**
         * Get rotation
         * @returns {number}
         */
        SchemeObject.prototype.getRotation = function () {
            return this.rotation;
        };
        /**
         * Get is active
         * @return {boolean}
         */
        SchemeObject.prototype.isActive = function () {
            return this.active;
        };
        /**
         * Set active
         * @param {boolean} value
         */
        SchemeObject.prototype.setActive = function (value) {
            this.active = value;
        };
        return SchemeObject;
    }());
    SchemeDesigner.SchemeObject = SchemeObject;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * ImageStorage
     */
    var ImageStorage = /** @class */ (function () {
        /**
         * Constructor
         * @param id
         * @param scheme
         */
        function ImageStorage(id, scheme) {
            this.id = 'scheme-designer-image-storage-' + SchemeDesigner.Tools.getRandomString() + '-' + id;
            this.scheme = scheme;
            var canvas = document.getElementById(id);
            if (!canvas) {
                canvas = document.createElement('canvas');
                canvas.id = this.id;
                canvas.style.display = 'none';
                this.scheme.getCanvas().parentNode.appendChild(canvas);
            }
            this.canvas = canvas;
            this.context = this.canvas.getContext('2d');
        }
        /**
         * Set image data
         * @param imageData
         * @param width
         * @param height
         */
        ImageStorage.prototype.setImageData = function (imageData, width, height) {
            this.setDimensions({ width: width, height: height });
            this.context.putImageData(imageData, 0, 0);
        };
        /**
         * Set dimensions
         * @param dimensions
         */
        ImageStorage.prototype.setDimensions = function (dimensions) {
            this.canvas.width = dimensions.width;
            this.canvas.height = dimensions.height;
        };
        /**
         * Get canvas
         * @returns {HTMLCanvasElement}
         */
        ImageStorage.prototype.getCanvas = function () {
            return this.canvas;
        };
        /**
         * Get context
         * @returns {CanvasRenderingContext2D}
         */
        ImageStorage.prototype.getContext = function () {
            return this.context;
        };
        return ImageStorage;
    }());
    SchemeDesigner.ImageStorage = ImageStorage;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Polyfill
     */
    var Polyfill = /** @class */ (function () {
        function Polyfill() {
        }
        /**
         * Get request animation frame function
         * @returns {Function}
         */
        Polyfill.getRequestAnimationFrameFunction = function () {
            var variables = [
                'requestAnimationFrame',
                'webkitRequestAnimationFrame',
                'mozRequestAnimationFrame',
                'oRequestAnimationFrame',
                'msRequestAnimationFrame'
            ];
            for (var _i = 0, variables_1 = variables; _i < variables_1.length; _i++) {
                var variableName = variables_1[_i];
                if (window.hasOwnProperty(variableName)) {
                    return window[variableName];
                }
            }
            return function (callback) {
                return window.setTimeout(callback, 1000 / 60);
            };
        };
        /**
         * Get cancel animation function
         * @returns {Function}
         */
        Polyfill.getCancelAnimationFunction = function () {
            return window.cancelAnimationFrame || window.clearTimeout;
        };
        /**
         * Get device pixel radio
         * @returns {number}
         */
        Polyfill.getDevicePixelRatio = function () {
            var variables = [
                'devicePixelRatio',
                'webkitDevicePixelRatio',
                'mozDevicePixelRatio'
            ];
            for (var _i = 0, variables_2 = variables; _i < variables_2.length; _i++) {
                var variableName = variables_2[_i];
                if (window.hasOwnProperty(variableName)) {
                    return window[variableName];
                }
            }
            return 1;
        };
        return Polyfill;
    }());
    SchemeDesigner.Polyfill = Polyfill;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Tools
     */
    var Tools = /** @class */ (function () {
        function Tools() {
        }
        /**
         * Object configurator
         * @param obj
         * @param params
         */
        Tools.configure = function (obj, params) {
            if (params) {
                for (var paramName in params) {
                    var value = params[paramName];
                    var setter = 'set' + Tools.capitalizeFirstLetter(paramName);
                    if (typeof obj[setter] === 'function') {
                        obj[setter].call(obj, value);
                    }
                }
            }
        };
        /**
         * First latter to uppercase
         * @param string
         * @returns {string}
         */
        Tools.capitalizeFirstLetter = function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        };
        /**
         * Clone object
         * @param obj
         */
        Tools.clone = function (obj) {
            return JSON.parse(JSON.stringify(obj));
        };
        ;
        /**
         * Check than point in rect
         * @param coordinates
         * @param boundingRect
         * @param rotation - rotation of rect
         * @returns {boolean}
         */
        Tools.pointInRect = function (coordinates, boundingRect, rotation) {
            var result = false;
            var x = coordinates.x;
            var y = coordinates.y;
            // move point by rotation
            if (rotation) {
                rotation = -rotation;
                var rectCenterX = (boundingRect.left + boundingRect.right) / 2;
                var rectCenterY = (boundingRect.top + boundingRect.bottom) / 2;
                var rotatedPoint = Tools.rotatePointByAxis(coordinates, { x: rectCenterX, y: rectCenterY }, rotation);
                x = rotatedPoint.x;
                y = rotatedPoint.y;
            }
            if (boundingRect.left <= x && boundingRect.right >= x
                && boundingRect.top <= y && boundingRect.bottom >= y) {
                result = true;
            }
            return result;
        };
        /**
         * Rotate point by axis
         * @param point
         * @param axis
         * @param rotation
         * @returns {Coordinates}
         */
        Tools.rotatePointByAxis = function (point, axis, rotation) {
            rotation = rotation * Math.PI / 180;
            var x = axis.x + (point.x - axis.x) * Math.cos(rotation) - (point.y - axis.y) * Math.sin(rotation);
            var y = axis.y + (point.x - axis.x) * Math.sin(rotation) + (point.y - axis.y) * Math.cos(rotation);
            return { x: x, y: y };
        };
        /**
         * Rect intersect rect
         * @param boundingRect1
         * @param boundingRect2
         * @returns {boolean}
         */
        Tools.rectIntersectRect = function (boundingRect1, boundingRect2) {
            return !(boundingRect1.top > boundingRect2.bottom
                || boundingRect1.bottom < boundingRect2.top
                || boundingRect1.right < boundingRect2.left
                || boundingRect1.left > boundingRect2.right);
        };
        /**
         * Find objects by coordinates
         * @param boundingRect
         * @param objects
         * @returns {SchemeObject[]}
         */
        Tools.filterObjectsByBoundingRect = function (boundingRect, objects) {
            var result = [];
            for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
                var schemeObject = objects_1[_i];
                var objectBoundingRect = schemeObject.getOuterBoundingRect();
                var isPart = this.rectIntersectRect(objectBoundingRect, boundingRect);
                if (isPart) {
                    result.push(schemeObject);
                }
            }
            return result;
        };
        /**
         * Filter by bounding rect objects in layers
         * @param boundingRect
         * @param objectsByLayers
         * @returns {SchemeObjectsByLayers}
         */
        Tools.filterLayersObjectsByBoundingRect = function (boundingRect, objectsByLayers) {
            var result = {};
            for (var layerId in objectsByLayers) {
                var objects = objectsByLayers[layerId];
                result[layerId] = Tools.filterObjectsByBoundingRect(boundingRect, objects);
            }
            return result;
        };
        /**
         * convert max-width/max-height values that may be percentages into a number
         * @param styleValue
         * @param node
         * @param parentProperty
         * @returns {number}
         */
        Tools.parseMaxStyle = function (styleValue, node, parentProperty) {
            var valueInPixels;
            if (typeof styleValue === 'string') {
                valueInPixels = parseInt(styleValue, 10);
                if (styleValue.indexOf('%') !== -1) {
                    // percentage * size in dimension
                    valueInPixels = valueInPixels / 100 * node.parentNode[parentProperty];
                }
            }
            else {
                valueInPixels = styleValue;
            }
            return valueInPixels;
        };
        /**
         * Returns if the given value contains an effective constraint.
         * @param value
         * @returns {boolean}
         */
        Tools.isConstrainedValue = function (value) {
            return value !== undefined && value !== null && value !== 'none';
        };
        /**
         * Get constraint dimention
         * @see http://www.nathanaeljones.com/blog/2013/reading-max-width-cross-browser
         * @param domNode
         * @param maxStyle
         * @param percentageProperty
         * @returns {null|number}
         */
        Tools.getConstraintDimension = function (domNode, maxStyle, percentageProperty) {
            var view = document.defaultView;
            var parentNode = domNode.parentNode;
            var constrainedNode = view.getComputedStyle(domNode)[maxStyle];
            var constrainedContainer = view.getComputedStyle(parentNode)[maxStyle];
            var hasCNode = this.isConstrainedValue(constrainedNode);
            var hasCContainer = this.isConstrainedValue(constrainedContainer);
            var infinity = Number.POSITIVE_INFINITY;
            if (hasCNode || hasCContainer) {
                return Math.min(hasCNode ? this.parseMaxStyle(constrainedNode, domNode, percentageProperty) : infinity, hasCContainer ? this.parseMaxStyle(constrainedContainer, parentNode, percentageProperty) : infinity);
            }
            return null;
        };
        /**
         * Number or undefined if no constraint
         * @param domNode
         * @returns {number|string}
         */
        Tools.getConstraintWidth = function (domNode) {
            return this.getConstraintDimension(domNode, 'max-width', 'clientWidth');
        };
        /**
         * Number or undefined if no constraint
         * @param domNode
         * @returns {number|string}
         */
        Tools.getConstraintHeight = function (domNode) {
            return this.getConstraintDimension(domNode, 'max-height', 'clientHeight');
        };
        /**
         * Get max width
         * @param domNode
         * @returns {number}
         */
        Tools.getMaximumWidth = function (domNode) {
            var container = domNode.parentNode;
            if (!container) {
                return domNode.clientWidth;
            }
            var paddingLeft = parseInt(this.getStyle(container, 'padding-left'), 10);
            var paddingRight = parseInt(this.getStyle(container, 'padding-right'), 10);
            var w = container.clientWidth - paddingLeft - paddingRight;
            var cw = this.getConstraintWidth(domNode);
            return !cw ? w : Math.min(w, cw);
        };
        /**
         * Get max height
         * @param domNode
         * @returns {number}
         */
        Tools.getMaximumHeight = function (domNode) {
            var container = domNode.parentNode;
            if (!container) {
                return domNode.clientHeight;
            }
            var paddingTop = parseInt(this.getStyle(container, 'padding-top'), 10);
            var paddingBottom = parseInt(this.getStyle(container, 'padding-bottom'), 10);
            var h = container.clientHeight - paddingTop - paddingBottom;
            var ch = this.getConstraintHeight(domNode);
            return !ch ? h : Math.min(h, ch);
        };
        /**
         * Get style
         * @param element
         * @param {string} property
         * @returns {string}
         */
        Tools.getStyle = function (element, property) {
            return element.currentStyle ?
                element.currentStyle[property] :
                document.defaultView.getComputedStyle(element, null).getPropertyValue(property);
        };
        ;
        /**
         * Generate unique id
         * @returns {number}
         */
        Tools.generateUniqueId = function () {
            this.idNumber++;
            return this.idNumber;
        };
        /**
         * Touch supported
         * @returns {boolean}
         */
        Tools.touchSupported = function () {
            return 'ontouchstart' in window;
        };
        /**
         * Sorting object
         * @param obj
         * @returns {{}}
         */
        Tools.sortObject = function (obj) {
            var keys = Object.keys(obj), len = keys.length;
            keys.sort();
            var result = {};
            for (var i = 0; i < len; i++) {
                var k = keys[i];
                result[k] = obj[k];
            }
            return result;
        };
        /**
         * Get random string
         * @returns {string}
         */
        Tools.getRandomString = function () {
            return Math.random().toString(36).substr(2, 9);
        };
        /**
         * Disable selection on element
         * @param element
         */
        Tools.disableElementSelection = function (element) {
            var styles = [
                '-webkit-touch-callout',
                '-webkit-user-select',
                '-khtml-user-select',
                '-moz-user-select',
                '-ms-user-select',
                'user-select',
                'outline'
            ];
            for (var _i = 0, styles_1 = styles; _i < styles_1.length; _i++) {
                var styleName = styles_1[_i];
                element.style[styleName] = 'none';
            }
        };
        /**
         * Get pointer from event
         * @param e
         * @param clientProp
         * @returns {number}
         */
        Tools.getPointer = function (e, clientProp) {
            var touchProp = e.type === 'touchend' ? 'changedTouches' : 'touches';
            var event = e;
            // touch event
            if (event[touchProp] && event[touchProp][0]) {
                if (event[touchProp].length == 2) {
                    return (event[touchProp][0][clientProp] + event[touchProp][1][clientProp]) / 2;
                }
                return event[touchProp][0][clientProp];
            }
            return event[clientProp];
        };
        /**
         * Number for id generator
         * @type {number}
         */
        Tools.idNumber = 0;
        return Tools;
    }());
    SchemeDesigner.Tools = Tools;
})(SchemeDesigner || (SchemeDesigner = {}));


var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * View
     */
    var View = /** @class */ (function () {
        /**
         * Constructor
         * @param canvas
         */
        function View(canvas) {
            /**
             * scroll left
             */
            this.scrollLeft = 0;
            /**
             * Scroll top
             */
            this.scrollTop = 0;
            /**
             * Scale
             */
            this.scale = 0;
            /**
             * Width
             */
            this.width = 0;
            /**
             * Height
             */
            this.height = 0;
            this.canvas = canvas;
            this.context = this.canvas.getContext('2d');
        }
        /**
         * Get canvas
         * @returns {HTMLCanvasElement}
         */
        View.prototype.getCanvas = function () {
            return this.canvas;
        };
        /**
         * Canvas context getter
         * @returns {CanvasRenderingContext2D}
         */
        View.prototype.getContext = function () {
            return this.context;
        };
        /**
         * Set scroll left
         * @param value
         */
        View.prototype.setScrollLeft = function (value) {
            this.scrollLeft = value;
        };
        /**
         * Set scroll top
         * @param value
         */
        View.prototype.setScrollTop = function (value) {
            this.scrollTop = value;
        };
        /**
         * Set scale
         * @param value
         */
        View.prototype.setScale = function (value) {
            this.scale = value;
        };
        /**
         * Get scroll left
         * @returns {number}
         */
        View.prototype.getScrollLeft = function () {
            return this.scrollLeft;
        };
        /**
         * Get scroll top
         * @returns {number}
         */
        View.prototype.getScrollTop = function () {
            return this.scrollTop;
        };
        /**
         * Get scale
         * @returns {number}
         */
        View.prototype.getScale = function () {
            return this.scale;
        };
        /**
         * Set dimensions
         * @param dimensions
         */
        View.prototype.setDimensions = function (dimensions) {
            this.canvas.width = dimensions.width;
            this.canvas.height = dimensions.height;
            this.width = dimensions.width;
            this.height = dimensions.height;
        };
        /**
         * Get width
         * @returns {number}
         */
        View.prototype.getWidth = function () {
            return this.width;
        };
        /**
         * Get height
         * @returns {number}
         */
        View.prototype.getHeight = function () {
            return this.height;
        };
        /**
         * Apply transformation
         */
        View.prototype.applyTransformation = function () {
            this.context.setTransform(this.scale, 0, 0, this.scale, this.scrollLeft, this.scrollTop);
        };
        /**
         * Resize view
         */
        View.prototype.resize = function () {
            var newWidth = Math.max(0, Math.floor(SchemeDesigner.Tools.getMaximumWidth(this.getCanvas())));
            var newHeight = Math.max(0, Math.floor(SchemeDesigner.Tools.getMaximumHeight(this.getCanvas())));
            this.setDimensions({
                width: newWidth,
                height: newHeight
            });
        };
        return View;
    }());
    SchemeDesigner.View = View;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Event manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    var EventManager = /** @class */ (function () {
        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        function EventManager(scheme) {
            /**
             * Is dragging
             */
            this.isDragging = false;
            /**
             * Left button down
             */
            this.leftButtonDown = false;
            /**
             * Hovered objects
             */
            this.hoveredObjects = [];
            /**
             * Last touch end time
             * @type {number}
             */
            this.lastTouchEndTime = 0;
            this.scheme = scheme;
            this.setLastClientPosition({
                x: this.scheme.getWidth() / 2,
                y: this.scheme.getHeight() / 2
            });
            this.bindEvents();
        }
        /**
         * Bind events
         */
        EventManager.prototype.bindEvents = function () {
            var _this = this;
            // mouse events
            this.scheme.getCanvas().addEventListener('mousedown', function (e) {
                _this.onMouseDown(e);
            });
            this.scheme.getCanvas().addEventListener('mouseup', function (e) {
                _this.onMouseUp(e);
            });
            this.scheme.getCanvas().addEventListener('click', function (e) {
                _this.onClick(e);
            });
            this.scheme.getCanvas().addEventListener('dblclick', function (e) {
                _this.onDoubleClick(e);
            });
            this.scheme.getCanvas().addEventListener('mousemove', function (e) {
                _this.onMouseMove(e);
            });
            this.scheme.getCanvas().addEventListener('mouseout', function (e) {
                _this.onMouseOut(e);
            });
            this.scheme.getCanvas().addEventListener('mouseenter', function (e) {
                _this.onMouseEnter(e);
            });
            this.scheme.getCanvas().addEventListener('contextmenu', function (e) {
                _this.onContextMenu(e);
            });
            // wheel
            this.scheme.getCanvas().addEventListener('mousewheel', function (e) {
                _this.onMouseWheel(e);
            });
            // for FF
            this.scheme.getCanvas().addEventListener('DOMMouseScroll', function (e) {
                _this.onMouseWheel(e);
            });
            // touch events
            this.scheme.getCanvas().addEventListener('touchstart', function (e) {
                _this.touchDistance = 0;
                _this.onMouseDown(e);
            });
            this.scheme.getCanvas().addEventListener('touchmove', function (e) {
                if (!e.targetTouches) {
                    return false;
                }
                if (e.targetTouches.length == 1) {
                    // one finger - dragging
                    _this.onMouseMove(e);
                }
                else if (e.targetTouches.length == 2) {
                    // two finger - zoom
                    var p1 = e.targetTouches[0];
                    var p2 = e.targetTouches[1];
                    // euclidean distance
                    var distance = Math.sqrt(Math.pow(p2.pageX - p1.pageX, 2) + Math.pow(p2.pageY - p1.pageY, 2));
                    var delta = 0;
                    if (_this.touchDistance) {
                        delta = distance - _this.touchDistance;
                    }
                    _this.touchDistance = distance;
                    if (delta) {
                        _this.scheme.getZoomManager().zoomToPointer(e, delta / 5);
                    }
                }
                e.preventDefault();
            });
            this.scheme.getCanvas().addEventListener('touchend', function (e) {
                // prevent double tap zoom
                var now = (new Date()).getTime();
                if (_this.lastTouchEndTime && now - _this.lastTouchEndTime <= 300) {
                    e.preventDefault();
                }
                else {
                    _this.onMouseUp(e);
                }
                _this.lastTouchEndTime = now;
            });
            this.scheme.getCanvas().addEventListener('touchcancel', function (e) {
                _this.onMouseUp(e);
            });
            // resize
            window.addEventListener('resize', function (e) {
                var prevScale = _this.scheme.getZoomManager().getScale();
                _this.scheme.resize();
                _this.scheme.requestRenderAll();
                if (!_this.scheme.getZoomManager().zoomByFactor(prevScale)) {
                    _this.scheme.getZoomManager().setScale(_this.scheme.getZoomManager().getScaleWithAllObjects());
                }
            });
        };
        /**
         * Mouse down
         * @param e
         */
        EventManager.prototype.onMouseDown = function (e) {
            this.leftButtonDown = true;
            this.setLastClientPositionFromEvent(e);
        };
        /**
         * Mouse up
         * @param e
         */
        EventManager.prototype.onMouseUp = function (e) {
            var _this = this;
            this.leftButtonDown = false;
            this.setLastClientPositionFromEvent(e);
            if (this.isDragging) {
                this.scheme.setCursorStyle(this.scheme.getDefaultCursorStyle());
                this.scheme.requestRenderAll();
            }
            // defer for prevent trigger click on mouseUp
            setTimeout(function () { _this.isDragging = false; }, 1);
        };
        /**
         * On click
         * @param e
         */
        EventManager.prototype.onClick = function (e) {
            if (!this.isDragging) {
                var objects = this.findObjectsForEvent(e);
                for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
                    var schemeObject = objects_1[_i];
                    schemeObject.click(e, this.scheme, this.scheme.getView());
                    this.scheme.addChangedObject(schemeObject);
                    this.sendEvent('clickOnObject', schemeObject);
                }
                if (objects.length) {
                    this.scheme.requestRenderAll();
                    this.scheme.updateCache(true);
                }
            }
        };
        /**
         * Double click
         * @param e
         */
        EventManager.prototype.onDoubleClick = function (e) {
            this.scheme.getZoomManager().zoomToPointer(e, 14);
        };
        /**
         * Right click
         * @param e
         */
        EventManager.prototype.onContextMenu = function (e) {
        };
        /**
         * On mouse move
         * @param e
         */
        EventManager.prototype.onMouseMove = function (e) {
            if (this.leftButtonDown) {
                var newCoordinates = this.getCoordinatesFromEvent(e);
                var deltaX = Math.abs(newCoordinates.x - this.getLastClientX());
                var deltaY = Math.abs(newCoordinates.y - this.getLastClientY());
                // 1 - is click with offset - mis drag
                if (deltaX > 1 || deltaY > 1) {
                    this.isDragging = true;
                    this.scheme.setCursorStyle('move');
                }
            }
            if (!this.isDragging) {
                this.handleHover(e);
            }
            else {
                this.scheme.getScrollManager().handleDragging(e);
            }
        };
        /**
         * Handling hover
         * @param e
         */
        EventManager.prototype.handleHover = function (e) {
            this.setLastClientPositionFromEvent(e);
            var objects = this.findObjectsForEvent(e);
            var mustReRender = false;
            var hasNewHovers = false;
            if (this.hoveredObjects.length) {
                for (var _i = 0, _a = this.hoveredObjects; _i < _a.length; _i++) {
                    var schemeHoveredObject = _a[_i];
                    var alreadyHovered = false;
                    for (var _b = 0, objects_2 = objects; _b < objects_2.length; _b++) {
                        var schemeObject = objects_2[_b];
                        if (schemeObject == schemeHoveredObject) {
                            alreadyHovered = true;
                        }
                    }
                    if (!alreadyHovered) {
                        schemeHoveredObject.isHovered = false;
                        var result = schemeHoveredObject.mouseLeave(e, this.scheme, this.scheme.getView());
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
                for (var _c = 0, objects_3 = objects; _c < objects_3.length; _c++) {
                    var schemeObject = objects_3[_c];
                    schemeObject.isHovered = true;
                    this.scheme.setCursorStyle(schemeObject.cursorStyle);
                    var result = schemeObject.mouseOver(e, this.scheme, this.scheme.getView());
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
        };
        /**
         * Mouse out
         * @param e
         */
        EventManager.prototype.onMouseOut = function (e) {
            this.setLastClientPositionFromEvent(e);
            this.leftButtonDown = false;
            this.isDragging = false;
            this.scheme.requestRenderAll();
        };
        /**
         * Mouse enter
         * @param e
         */
        EventManager.prototype.onMouseEnter = function (e) {
        };
        /**
         * Zoom by wheel
         * @param e
         */
        EventManager.prototype.onMouseWheel = function (e) {
            return this.scheme.getZoomManager().handleMouseWheel(e);
        };
        /**
         * Set last client position
         * @param e
         */
        EventManager.prototype.setLastClientPositionFromEvent = function (e) {
            var coordinates = this.getCoordinatesFromEvent(e);
            this.setLastClientPosition(coordinates);
        };
        /**
         * Find objects by event
         * @param e
         * @returns {SchemeObject[]}
         */
        EventManager.prototype.findObjectsForEvent = function (e) {
            var coordinates = this.getCoordinatesFromEvent(e);
            return this.scheme.getStorageManager().findObjectsByCoordinates(coordinates);
        };
        /**
         * Get coordinates from event
         * @param e
         * @returns {number[]}
         */
        EventManager.prototype.getCoordinatesFromEvent = function (e) {
            var clientRect = this.scheme.getCanvas().getBoundingClientRect();
            var x = SchemeDesigner.Tools.getPointer(e, 'clientX') - clientRect.left;
            var y = SchemeDesigner.Tools.getPointer(e, 'clientY') - clientRect.top;
            return { x: x, y: y };
        };
        /**
         * Set last client position
         * @param coordinates
         */
        EventManager.prototype.setLastClientPosition = function (coordinates) {
            this.lastClientPosition = coordinates;
        };
        /**
         * Get last client x
         * @returns {number}
         */
        EventManager.prototype.getLastClientX = function () {
            return this.lastClientPosition.x;
        };
        /**
         * Get last client y
         * @returns {number}
         */
        EventManager.prototype.getLastClientY = function () {
            return this.lastClientPosition.y;
        };
        /**
         * Send event
         * @param {string} eventName
         * @param data
         */
        EventManager.prototype.sendEvent = function (eventName, data) {
            var fullEventName = "schemeDesigner." + eventName;
            if (typeof CustomEvent === 'function') {
                var event_1 = new CustomEvent(fullEventName, {
                    detail: data
                });
                this.scheme.getCanvas().dispatchEvent(event_1);
            }
            else {
                var event_2 = document.createEvent('CustomEvent');
                event_2.initCustomEvent(fullEventName, false, false, data);
                this.scheme.getCanvas().dispatchEvent(event_2);
            }
        };
        return EventManager;
    }());
    SchemeDesigner.EventManager = EventManager;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Map manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    var MapManager = /** @class */ (function () {
        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        function MapManager(scheme) {
            /**
             * Is dragging
             */
            this.isDragging = false;
            /**
             * Left button down
             */
            this.leftButtonDown = false;
            /**
             * Last touch end time
             * @type {number}
             */
            this.lastTouchEndTime = 0;
            this.scheme = scheme;
        }
        /**
         * Scaled scheme rect
         * @returns {number}
         */
        MapManager.prototype.getScaledSchemeRect = function () {
            var imageBoundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();
            var imageWidth = imageBoundingRect.right;
            var imageHeight = imageBoundingRect.bottom;
            var mapWidth = this.mapView.getWidth();
            var mapHeight = this.mapView.getHeight();
            var mapRatio = mapWidth / mapHeight;
            var imageRatio = imageWidth / imageHeight;
            var scaleFactor = mapRatio < imageRatio ? mapWidth / imageWidth : mapHeight / imageHeight;
            var newImageWidth = imageWidth * scaleFactor;
            var newImageHeight = imageHeight * scaleFactor;
            var leftOffset = (mapWidth - newImageWidth) / 2;
            var topOffset = (mapHeight - newImageHeight) / 2;
            return {
                scaleFactor: scaleFactor,
                width: newImageWidth,
                height: newImageHeight,
                leftOffset: leftOffset,
                topOffset: topOffset
            };
        };
        /**
         * Get rect dimensions
         * @param scaledSchemeRect
         * @returns BoundingRect
         */
        MapManager.prototype.getRectBoundingRect = function (scaledSchemeRect) {
            var visibleBoundingRect = this.scheme.getVisibleBoundingRect();
            var rectX = visibleBoundingRect.left * scaledSchemeRect.scaleFactor + scaledSchemeRect.leftOffset;
            var rectY = visibleBoundingRect.top * scaledSchemeRect.scaleFactor + scaledSchemeRect.topOffset;
            var rectWidth = (visibleBoundingRect.right - visibleBoundingRect.left) * scaledSchemeRect.scaleFactor;
            var rectHeight = (visibleBoundingRect.bottom - visibleBoundingRect.top) * scaledSchemeRect.scaleFactor;
            return {
                left: rectX,
                top: rectY,
                right: rectX + rectWidth,
                bottom: rectY + rectHeight
            };
        };
        /**
         * Draw map
         * @returns {boolean}
         */
        MapManager.prototype.drawMap = function () {
            var cacheView = this.scheme.getCacheView();
            if (!this.mapView || !cacheView) {
                return false;
            }
            var scaledSchemeRect = this.getScaledSchemeRect();
            var mapContext = this.mapView.getContext();
            mapContext.clearRect(0, 0, this.mapView.getWidth(), this.mapView.getHeight());
            mapContext.drawImage(cacheView.getCanvas(), scaledSchemeRect.leftOffset, scaledSchemeRect.topOffset, scaledSchemeRect.width, scaledSchemeRect.height);
            var rectBoundingRect = this.getRectBoundingRect(scaledSchemeRect);
            this.drawRect(rectBoundingRect);
            return true;
        };
        /**
         * Draw rect
         * @param boundingRect
         */
        MapManager.prototype.drawRect = function (boundingRect) {
            var mapContext = this.mapView.getContext();
            mapContext.lineWidth = 1;
            mapContext.strokeStyle = '#000';
            mapContext.strokeRect(boundingRect.left, boundingRect.top, boundingRect.right - boundingRect.left, boundingRect.bottom - boundingRect.top);
            var rectBackgroundWidth = this.mapView.getWidth() * 2;
            var rectBackgroundHeight = this.mapView.getHeight() * 2;
            var backgroundColor = 'rgba(0, 0, 0, 0.1)';
            mapContext.fillStyle = backgroundColor;
            mapContext.strokeStyle = backgroundColor;
            mapContext.lineWidth = 0;
            mapContext.fillRect(0, 0, boundingRect.left, rectBackgroundHeight);
            mapContext.fillRect(boundingRect.left, 0, boundingRect.right - boundingRect.left, boundingRect.top);
            mapContext.fillRect(boundingRect.right, 0, rectBackgroundWidth, rectBackgroundHeight);
            mapContext.fillRect(boundingRect.left, boundingRect.bottom, boundingRect.right - boundingRect.left, rectBackgroundHeight);
        };
        /**
         * Set mapCanvas
         * @param value
         */
        MapManager.prototype.setMapCanvas = function (value) {
            this.mapCanvas = value;
            this.mapView = new SchemeDesigner.View(this.mapCanvas);
            this.bindEvents();
            SchemeDesigner.Tools.disableElementSelection(this.mapCanvas);
        };
        /**
         * Resize map view
         */
        MapManager.prototype.resize = function () {
            if (this.mapView) {
                this.mapView.resize();
            }
        };
        /**
         * Bind events
         */
        MapManager.prototype.bindEvents = function () {
            var _this = this;
            // mouse events
            this.mapCanvas.addEventListener('mousedown', function (e) {
                _this.onMouseDown(e);
            });
            this.mapCanvas.addEventListener('mouseup', function (e) {
                _this.onMouseUp(e);
            });
            this.mapCanvas.addEventListener('mousemove', function (e) {
                _this.onMouseMove(e);
            });
            this.mapCanvas.addEventListener('mouseout', function (e) {
                _this.onMouseOut(e);
            });
            this.mapCanvas.addEventListener('click', function (e) {
                _this.onClick(e);
            });
            // wheel
            this.mapCanvas.addEventListener('mousewheel', function (e) {
                _this.onMouseWheel(e);
            });
            // for FF
            this.mapCanvas.addEventListener('DOMMouseScroll', function (e) {
                _this.onMouseWheel(e);
            });
        };
        /**
         * Zoom by wheel
         * @param e
         */
        MapManager.prototype.onMouseWheel = function (e) {
            var delta = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;
            if (delta) {
                var eventCoordinates = this.getCoordinatesFromEvent(e);
                this.scrollByCoordinates(eventCoordinates);
                this.scheme.getZoomManager().zoomToCenter(delta);
            }
            return e.preventDefault() && false;
        };
        /**
         * Mouse down
         * @param e
         */
        MapManager.prototype.onMouseDown = function (e) {
            this.leftButtonDown = true;
            this.setLastClientPositionFromEvent(e);
        };
        /**
         * Mouse out
         * @param e
         */
        MapManager.prototype.onMouseOut = function (e) {
            this.setLastClientPositionFromEvent(e);
            this.leftButtonDown = false;
            this.isDragging = false;
        };
        /**
         * Set cursor style
         * @param {string} cursor
         * @returns {SchemeDesigner}
         */
        MapManager.prototype.setCursorStyle = function (cursor) {
            this.mapCanvas.style.cursor = cursor;
            return this;
        };
        /**
         * Mouse up
         * @param e
         */
        MapManager.prototype.onMouseUp = function (e) {
            var _this = this;
            this.leftButtonDown = false;
            this.setLastClientPositionFromEvent(e);
            if (this.isDragging) {
                var eventCoordinates = this.getCoordinatesFromEvent(e);
                this.scrollByCoordinates(eventCoordinates);
                this.setCursorStyle('default');
            }
            // defer for prevent trigger click on mouseUp
            setTimeout(function () { _this.isDragging = false; }, 1);
        };
        /**
         * On mouse move
         * @param e
         */
        MapManager.prototype.onMouseMove = function (e) {
            if (this.leftButtonDown) {
                var newCoordinates = this.getCoordinatesFromEvent(e);
                var deltaX = Math.abs(newCoordinates.x - this.getLastClientX());
                var deltaY = Math.abs(newCoordinates.y - this.getLastClientY());
                // 1 - is click with offset - mis drag
                if (deltaX > 1 || deltaY > 1) {
                    this.isDragging = true;
                    this.setCursorStyle('move');
                }
            }
            if (this.isDragging) {
                var eventCoordinates = this.getCoordinatesFromEvent(e);
                this.scrollByCoordinates(eventCoordinates);
            }
        };
        /**
         * Set last client position
         * @param e
         */
        MapManager.prototype.setLastClientPositionFromEvent = function (e) {
            var coordinates = this.getCoordinatesFromEvent(e);
            this.setLastClientPosition(coordinates);
        };
        /**
         * Set last client position
         * @param coordinates
         */
        MapManager.prototype.setLastClientPosition = function (coordinates) {
            this.lastClientPosition = coordinates;
        };
        /**
         * Get last client x
         * @returns {number}
         */
        MapManager.prototype.getLastClientX = function () {
            return this.lastClientPosition.x;
        };
        /**
         * Get last client y
         * @returns {number}
         */
        MapManager.prototype.getLastClientY = function () {
            return this.lastClientPosition.y;
        };
        /**
         * Get real scheme coordinates
         * @param coordinates
         * @returns {{x: number, y: number}}
         */
        MapManager.prototype.getRealCoordinates = function (coordinates) {
            var scaledSchemeRect = this.getScaledSchemeRect();
            var schemeScale = this.scheme.getZoomManager().getScale();
            var boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();
            var rectBoundingRect = this.getRectBoundingRect(scaledSchemeRect);
            var rectWidth = rectBoundingRect.right - rectBoundingRect.left;
            var rectHeight = rectBoundingRect.bottom - rectBoundingRect.top;
            var realX = (coordinates.x - scaledSchemeRect.leftOffset - (rectWidth / 2)) / scaledSchemeRect.scaleFactor;
            var realY = (coordinates.y - scaledSchemeRect.topOffset - (rectHeight / 2)) / scaledSchemeRect.scaleFactor;
            // process scheme scale
            var x = (realX - boundingRect.left) * schemeScale;
            var y = (realY - boundingRect.top) * schemeScale;
            return {
                x: x,
                y: y
            };
        };
        /**
         * Scroll by coordinates
         * @param coordinates
         */
        MapManager.prototype.scrollByCoordinates = function (coordinates) {
            var realCoordinates = this.getRealCoordinates(coordinates);
            this.scheme.getScrollManager().scroll(-realCoordinates.x, -realCoordinates.y);
        };
        /**
         * On click
         * @param e
         */
        MapManager.prototype.onClick = function (e) {
            if (!this.isDragging) {
                var eventCoordinates = this.getCoordinatesFromEvent(e);
                this.scrollByCoordinates(eventCoordinates);
            }
        };
        /**
         * Get coordinates from event
         * @param e
         * @returns {number[]}
         */
        MapManager.prototype.getCoordinatesFromEvent = function (e) {
            var clientRect = this.mapCanvas.getBoundingClientRect();
            var x = SchemeDesigner.Tools.getPointer(e, 'clientX') - clientRect.left;
            var y = SchemeDesigner.Tools.getPointer(e, 'clientY') - clientRect.top;
            return { x: x, y: y };
        };
        return MapManager;
    }());
    SchemeDesigner.MapManager = MapManager;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Scroll manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    var ScrollManager = /** @class */ (function () {
        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        function ScrollManager(scheme) {
            /**
             * Scroll left
             */
            this.scrollLeft = 0;
            /**
             * Scroll top
             */
            this.scrollTop = 0;
            /**
             * Max hidden part on scroll
             */
            this.maxHiddenPart = 0.5;
            this.scheme = scheme;
        }
        /**
         * Get scroll left
         * @returns {number}
         */
        ScrollManager.prototype.getScrollLeft = function () {
            return this.scrollLeft;
        };
        /**
         * Get scroll top
         * @returns {number}
         */
        ScrollManager.prototype.getScrollTop = function () {
            return this.scrollTop;
        };
        /**
         * Set scroll
         * @param {number} left
         * @param {number} top
         */
        ScrollManager.prototype.scroll = function (left, top) {
            var boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();
            var scale = this.scheme.getZoomManager().getScale();
            var maxScrollLeft = -(boundingRect.left) * scale;
            var maxScrollTop = -(boundingRect.top) * scale;
            var minScrollLeft = -(boundingRect.right) * scale;
            var minScrollTop = -(boundingRect.bottom) * scale;
            maxScrollLeft = maxScrollLeft + (this.scheme.getWidth() * this.maxHiddenPart);
            maxScrollTop = maxScrollTop + (this.scheme.getHeight() * this.maxHiddenPart);
            minScrollLeft = minScrollLeft + (this.scheme.getWidth() * (1 - this.maxHiddenPart));
            minScrollTop = minScrollTop + (this.scheme.getHeight() * (1 - this.maxHiddenPart));
            if (left > maxScrollLeft) {
                left = maxScrollLeft;
            }
            if (top > maxScrollTop) {
                top = maxScrollTop;
            }
            if (left < minScrollLeft) {
                left = minScrollLeft;
            }
            if (top < minScrollTop) {
                top = minScrollTop;
            }
            this.scrollLeft = left;
            this.scrollTop = top;
            this.scheme.getView().setScrollTop(top);
            this.scheme.getView().setScrollLeft(left);
            this.scheme.getView().applyTransformation();
            // scroll fake scheme
            if (this.scheme.useSchemeCache()) {
                this.scheme.requestDrawFromCache();
            }
            else {
                this.scheme.requestRenderAll();
            }
            this.scheme.getEventManager().sendEvent('scroll', {
                left: left,
                top: top,
                maxScrollLeft: maxScrollLeft,
                maxScrollTop: maxScrollTop,
                minScrollLeft: minScrollLeft,
                minScrollTop: minScrollTop,
                boundingRect: boundingRect,
                scale: scale
            });
        };
        /**
         * Set scheme to center og objects
         */
        ScrollManager.prototype.toCenter = function () {
            var boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();
            var objectsDimensions = this.scheme.getStorageManager().getObjectsDimensions();
            var scale = this.scheme.getZoomManager().getScale();
            var widthDelta = this.scheme.getWidth() / scale - objectsDimensions.width;
            var heightDelta = this.scheme.getHeight() / scale - objectsDimensions.height;
            var scrollLeft = ((widthDelta / 2) - boundingRect.left) * scale;
            var scrollTop = ((heightDelta / 2) - boundingRect.top) * scale;
            this.scroll(scrollLeft, scrollTop);
        };
        /**
         * Handle dragging
         * @param e
         */
        ScrollManager.prototype.handleDragging = function (e) {
            var lastClientX = this.scheme.getEventManager().getLastClientX();
            var lastClientY = this.scheme.getEventManager().getLastClientY();
            this.scheme.getEventManager().setLastClientPositionFromEvent(e);
            var leftCenterOffset = this.scheme.getEventManager().getLastClientX() - lastClientX;
            var topCenterOffset = this.scheme.getEventManager().getLastClientY() - lastClientY;
            var scrollLeft = leftCenterOffset + this.getScrollLeft();
            var scrollTop = topCenterOffset + this.getScrollTop();
            this.scroll(scrollLeft, scrollTop);
        };
        /**
         * Set max hidden part
         * @param value
         */
        ScrollManager.prototype.setMaxHiddenPart = function (value) {
            this.maxHiddenPart = value;
        };
        return ScrollManager;
    }());
    SchemeDesigner.ScrollManager = ScrollManager;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Storage manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    var StorageManager = /** @class */ (function () {
        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        function StorageManager(scheme) {
            /**
             * Depth of tree
             */
            this.treeDepth = 6;
            /**
             * Layers
             */
            this.layers = {};
            this.scheme = scheme;
        }
        /**
         * Get layer by id
         * @param {string} id
         * @return {SchemeDesigner.Layer | null}
         */
        StorageManager.prototype.getLayerById = function (id) {
            if (typeof this.layers[id] != 'undefined') {
                return this.layers[id];
            }
            return null;
        };
        /**
         * Get objects from visible layers
         * @return {SchemeDesigner.SchemeObject[]}
         */
        StorageManager.prototype.getVisibleObjects = function () {
            var result = [];
            var visibleObjectsByLayers = this.getVisibleObjectsByLayers();
            for (var layerId in visibleObjectsByLayers) {
                var objects = visibleObjectsByLayers[layerId];
                if (typeof objects !== 'undefined' && objects.length) {
                    result = result.concat(objects);
                }
            }
            return result;
        };
        /**
         * Get visible objects by layers
         * @returns {SchemeObjectsByLayers}
         */
        StorageManager.prototype.getVisibleObjectsByLayers = function () {
            var result = {};
            var layers = this.getSortedLayers();
            for (var _i = 0, layers_1 = layers; _i < layers_1.length; _i++) {
                var layer = layers_1[_i];
                if (layer.isVisible()) {
                    var objects = layer.getObjects();
                    if (typeof objects !== 'undefined' && objects.length) {
                        result[layer.getId()] = objects;
                    }
                }
            }
            return result;
        };
        /**
         * Set layers
         * @param {SchemeDesigner.Layer[]} layers
         */
        StorageManager.prototype.setLayers = function (layers) {
            for (var _i = 0, layers_2 = layers; _i < layers_2.length; _i++) {
                var layer = layers_2[_i];
                this.addLayer(layer);
            }
        };
        /**
         * Get layers
         * @returns {Layers}
         */
        StorageManager.prototype.getLayers = function () {
            return this.layers;
        };
        /**
         * Get sorted layers by z-index
         * @returns {Layer[]}
         */
        StorageManager.prototype.getSortedLayers = function () {
            var layers = [];
            for (var layerId in this.layers) {
                var layer = this.layers[layerId];
                if (layer.isVisible()) {
                    layers.push(layer);
                }
            }
            // sort layers by z-index
            layers.sort(function (a, b) {
                if (a.getZIndex() < b.getZIndex()) {
                    return -1;
                }
                if (a.getZIndex() > b.getZIndex()) {
                    return 1;
                }
                return 0;
            });
            return layers;
        };
        /**
         * Add layer
         * @param {SchemeDesigner.Layer} layer
         */
        StorageManager.prototype.addLayer = function (layer) {
            var existLayer = this.getLayerById(layer.getId());
            if (existLayer instanceof SchemeDesigner.Layer) {
                throw new Error('Layer with such id already exist');
            }
            this.layers[layer.getId()] = layer;
        };
        /**
         * Remove all layers
         */
        StorageManager.prototype.removeLayers = function () {
            this.layers = {};
            this.applyStructureChange();
        };
        /**
         * Remove layer
         */
        StorageManager.prototype.removeLayer = function (layerId) {
            delete this.layers[layerId];
            this.applyStructureChange();
        };
        /**
         * Set layer visibility
         * @param {string} layerId
         * @param {boolean} visible
         */
        StorageManager.prototype.setLayerVisibility = function (layerId, visible) {
            var layer = this.getLayerById(layerId);
            if (!(layer instanceof SchemeDesigner.Layer)) {
                throw new Error('Layer not found');
            }
            layer.setVisible(visible);
            this.applyStructureChange();
        };
        /**
         * Set layer activity
         * @param layerId
         * @param active
         */
        StorageManager.prototype.setLayerActivity = function (layerId, active) {
            var layer = this.getLayerById(layerId);
            if (!(layer instanceof SchemeDesigner.Layer)) {
                throw new Error('Layer not found');
            }
            layer.setActive(active);
        };
        /**
         * Apple structure change
         */
        StorageManager.prototype.applyStructureChange = function () {
            this.requestBuildTree();
            this.reCalcObjectsBoundingRect();
            this.scheme.updateCache(false);
            this.scheme.requestRenderAll();
        };
        /**
         * find objects by coordinates in tree
         * @param coordinates Coordinates
         * @returns {SchemeObject[]}
         */
        StorageManager.prototype.findObjectsByCoordinates = function (coordinates) {
            var result = [];
            var x = coordinates.x;
            var y = coordinates.y;
            // scroll
            x = x - this.scheme.getScrollManager().getScrollLeft();
            y = y - this.scheme.getScrollManager().getScrollTop();
            // scale
            x = x / this.scheme.getZoomManager().getScale();
            y = y / this.scheme.getZoomManager().getScale();
            // search node
            var rootNode = this.getTree();
            var node = this.findNodeByCoordinates(rootNode, { x: x, y: y });
            var nodeObjectsByLayers = {};
            if (node) {
                nodeObjectsByLayers = node.getObjectsByLayers();
            }
            // search object in node
            for (var layerId in nodeObjectsByLayers) {
                var layer = this.getLayerById(layerId);
                if (!layer.isActive()) {
                    continue;
                }
                var objects = nodeObjectsByLayers[layerId];
                for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
                    var schemeObject = objects_1[_i];
                    if (!schemeObject.isActive()) {
                        continue;
                    }
                    var boundingRect = schemeObject.getBoundingRect();
                    if (SchemeDesigner.Tools.pointInRect({ x: x, y: y }, boundingRect, schemeObject.getRotation())) {
                        result.push(schemeObject);
                    }
                }
            }
            return result;
        };
        /**
         * Get bounding rect of all objects
         * @returns BoundingRect
         */
        StorageManager.prototype.getObjectsBoundingRect = function () {
            if (!this.objectsBoundingRect) {
                this.objectsBoundingRect = this.calculateObjectsBoundingRect();
            }
            return this.objectsBoundingRect;
        };
        /**
         * All objects dimensions
         * @returns {Dimensions}
         */
        StorageManager.prototype.getObjectsDimensions = function () {
            var boundingRect = this.getObjectsBoundingRect();
            return {
                width: boundingRect.right - boundingRect.left,
                height: boundingRect.bottom - boundingRect.top
            };
        };
        /**
         * Recalculate bounding rect
         */
        StorageManager.prototype.reCalcObjectsBoundingRect = function () {
            this.objectsBoundingRect = null;
        };
        /**
         * Get bounding rect of all objects
         * @returns {{left: number, top: number, right: number, bottom: number}}
         */
        StorageManager.prototype.calculateObjectsBoundingRect = function () {
            var top;
            var left;
            var right;
            var bottom;
            var visibleObjects = this.getVisibleObjects();
            if (visibleObjects.length) {
                for (var _i = 0, visibleObjects_1 = visibleObjects; _i < visibleObjects_1.length; _i++) {
                    var schemeObject = visibleObjects_1[_i];
                    var schemeObjectBoundingRect = schemeObject.getBoundingRect();
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
            }
            return {
                left: left,
                top: top,
                right: right,
                bottom: bottom
            };
        };
        /**
         * Set tree depth
         * @param value
         */
        StorageManager.prototype.setTreeDepth = function (value) {
            this.treeDepth = value;
        };
        /**
         * Request build tree
         */
        StorageManager.prototype.requestBuildTree = function () {
            this.rootTreeNode = null;
        };
        /**
         * Get tree
         * @returns {TreeNode}
         */
        StorageManager.prototype.getTree = function () {
            if (!this.rootTreeNode) {
                this.rootTreeNode = this.buildTree();
            }
            return this.rootTreeNode;
        };
        /**
         * Build tree
         * @returns {TreeNode}
         */
        StorageManager.prototype.buildTree = function () {
            var boundingRect = this.getObjectsBoundingRect();
            this.rootTreeNode = new TreeNode(null, boundingRect, this.getVisibleObjectsByLayers(), 0);
            this.explodeTreeNodes(this.rootTreeNode, this.treeDepth);
            return this.rootTreeNode;
        };
        /**
         * Recursive explode node
         * @param node
         * @param depth
         */
        StorageManager.prototype.explodeTreeNodes = function (node, depth) {
            this.explodeTreeNode(node);
            depth--;
            if (depth > 0) {
                for (var _i = 0, _a = node.getChildren(); _i < _a.length; _i++) {
                    var childNode = _a[_i];
                    this.explodeTreeNodes(childNode, depth);
                }
            }
        };
        /**
         * Explode node to children
         * @param node
         */
        StorageManager.prototype.explodeTreeNode = function (node) {
            var nodeBoundingRect = node.getBoundingRect();
            var newDepth = node.getDepth() + 1;
            var leftBoundingRect = SchemeDesigner.Tools.clone(nodeBoundingRect);
            var rightBoundingRect = SchemeDesigner.Tools.clone(nodeBoundingRect);
            /**
             * Width or height explode
             */
            if (newDepth % 2 == 1) {
                var width = nodeBoundingRect.right - nodeBoundingRect.left;
                var delta = width / 2;
                leftBoundingRect.right = leftBoundingRect.right - delta;
                rightBoundingRect.left = rightBoundingRect.left + delta;
            }
            else {
                var height = nodeBoundingRect.bottom - nodeBoundingRect.top;
                var delta = height / 2;
                leftBoundingRect.bottom = leftBoundingRect.bottom - delta;
                rightBoundingRect.top = rightBoundingRect.top + delta;
            }
            var leftNodeObjects = SchemeDesigner.Tools.filterLayersObjectsByBoundingRect(leftBoundingRect, node.getObjectsByLayers());
            var rightNodeObjects = SchemeDesigner.Tools.filterLayersObjectsByBoundingRect(rightBoundingRect, node.getObjectsByLayers());
            var leftNode = new TreeNode(node, leftBoundingRect, leftNodeObjects, newDepth);
            var rightNode = new TreeNode(node, rightBoundingRect, rightNodeObjects, newDepth);
            node.addChild(leftNode);
            node.addChild(rightNode);
            node.removeObjects();
        };
        /**
         * Find node by coordinates
         * @param node
         * @param coordinates
         * @returns {TreeNode|null}
         */
        StorageManager.prototype.findNodeByCoordinates = function (node, coordinates) {
            var childNode = node.getChildByCoordinates(coordinates);
            if (!childNode) {
                return null;
            }
            if (childNode.isLastNode()) {
                return childNode;
            }
            else {
                return this.findNodeByCoordinates(childNode, coordinates);
            }
        };
        /**
         * Find nodes by rect
         * @param node
         * @param boundingRect
         * @returns {TreeNode[]}
         */
        StorageManager.prototype.findNodesByBoundingRect = function (node, boundingRect) {
            if (!node) {
                node = this.getTree();
            }
            var result = [];
            var childNodes = node.getChildrenByBoundingRect(boundingRect);
            for (var _i = 0, childNodes_1 = childNodes; _i < childNodes_1.length; _i++) {
                var childNode = childNodes_1[_i];
                if (childNode.isLastNode()) {
                    result.push(childNode);
                }
                else {
                    var subChildNodes = this.findNodesByBoundingRect(childNode, boundingRect);
                    for (var _a = 0, subChildNodes_1 = subChildNodes; _a < subChildNodes_1.length; _a++) {
                        var subChildNode = subChildNodes_1[_a];
                        result.push(subChildNode);
                    }
                }
            }
            return result;
        };
        /**
         * Draw bounds of nodes for testing
         */
        StorageManager.prototype.showNodesParts = function () {
            var lastTreeNodes = this.getTree().getLastChildren();
            var context = this.scheme.getView().getContext();
            for (var _i = 0, lastTreeNodes_1 = lastTreeNodes; _i < lastTreeNodes_1.length; _i++) {
                var lastTreeNode = lastTreeNodes_1[_i];
                var relativeX = lastTreeNode.getBoundingRect().left + this.scheme.getScrollManager().getScrollLeft();
                var relativeY = lastTreeNode.getBoundingRect().top + this.scheme.getScrollManager().getScrollTop();
                var width = lastTreeNode.getBoundingRect().right - lastTreeNode.getBoundingRect().left;
                var height = lastTreeNode.getBoundingRect().bottom - lastTreeNode.getBoundingRect().top;
                context.lineWidth = 1;
                context.strokeStyle = 'black';
                context.rect(relativeX, relativeY, width, height);
                context.stroke();
            }
        };
        /**
         * Return image storage
         * @param id
         * @returns {ImageStorage}
         */
        StorageManager.prototype.getImageStorage = function (id) {
            return new SchemeDesigner.ImageStorage(id, this.scheme);
        };
        return StorageManager;
    }());
    SchemeDesigner.StorageManager = StorageManager;
    /**
     * Tree node
     */
    var TreeNode = /** @class */ (function () {
        /**
         * Constructor
         * @param parent
         * @param boundingRect
         * @param objects
         * @param depth
         */
        function TreeNode(parent, boundingRect, objects, depth) {
            /**
             * Children nodes
             */
            this.children = [];
            /**
             * Objects in node by layers
             */
            this.objectsByLayers = {};
            this.parent = parent;
            this.boundingRect = boundingRect;
            this.objectsByLayers = objects;
            this.depth = depth;
        }
        /**
         * Add child
         * @param child
         */
        TreeNode.prototype.addChild = function (child) {
            this.children.push(child);
        };
        /**
         * Get objects
         * @returns {SchemeObject[]}
         */
        TreeNode.prototype.getObjects = function () {
            var result = [];
            for (var layerId in this.objectsByLayers) {
                var objects = this.objectsByLayers[layerId];
                if (typeof objects !== 'undefined' && objects.length) {
                    result = result.concat(objects);
                }
            }
            return result;
        };
        /**
         * Get objects in layer
         * @param layerId
         * @returns {SchemeObject[]}
         */
        TreeNode.prototype.getObjectsByLayer = function (layerId) {
            if (typeof this.objectsByLayers[layerId] != 'undefined') {
                return this.objectsByLayers[layerId];
            }
            return [];
        };
        /**
         * Get objects by layers
         * @returns {SchemeObjectsByLayers}
         */
        TreeNode.prototype.getObjectsByLayers = function () {
            return this.objectsByLayers;
        };
        /**
         * Get children
         * @returns {TreeNode[]}
         */
        TreeNode.prototype.getChildren = function () {
            return this.children;
        };
        /**
         * Is last node
         * @returns {boolean}
         */
        TreeNode.prototype.isLastNode = function () {
            return Object.keys(this.objectsByLayers).length > 0;
        };
        /**
         * Get last children
         * @returns {TreeNode[]}
         */
        TreeNode.prototype.getLastChildren = function () {
            var result = [];
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var childNode = _a[_i];
                if (childNode.isLastNode()) {
                    result.push(childNode);
                }
                else {
                    var lastChildNodeChildren = childNode.getLastChildren();
                    for (var _b = 0, lastChildNodeChildren_1 = lastChildNodeChildren; _b < lastChildNodeChildren_1.length; _b++) {
                        var lastChildNodeChild = lastChildNodeChildren_1[_b];
                        result.push(lastChildNodeChild);
                    }
                }
            }
            return result;
        };
        /**
         * Get child by coordinates
         * @param coordinates
         * @returns {TreeNode|null}
         */
        TreeNode.prototype.getChildByCoordinates = function (coordinates) {
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var childNode = _a[_i];
                if (SchemeDesigner.Tools.pointInRect(coordinates, childNode.getBoundingRect())) {
                    return childNode;
                }
            }
            return null;
        };
        /**
         * Get child by bounding rect
         * @param boundingRect
         * @returns {TreeNode[]}
         */
        TreeNode.prototype.getChildrenByBoundingRect = function (boundingRect) {
            var result = [];
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var childNode = _a[_i];
                if (SchemeDesigner.Tools.rectIntersectRect(childNode.getBoundingRect(), boundingRect)) {
                    result.push(childNode);
                }
            }
            return result;
        };
        /**
         * Remove objects
         */
        TreeNode.prototype.removeObjects = function () {
            this.objectsByLayers = {};
        };
        /**
         * Get bounding rect
         * @returns {BoundingRect}
         */
        TreeNode.prototype.getBoundingRect = function () {
            return this.boundingRect;
        };
        /**
         * Get  depth
         * @returns {number}
         */
        TreeNode.prototype.getDepth = function () {
            return this.depth;
        };
        return TreeNode;
    }());
    SchemeDesigner.TreeNode = TreeNode;
})(SchemeDesigner || (SchemeDesigner = {}));

var SchemeDesigner;
(function (SchemeDesigner) {
    /**
     * Zoom manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    var ZoomManager = /** @class */ (function () {
        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        function ZoomManager(scheme) {
            /**
             * Current scale
             */
            this.scale = 1;
            /**
             * Zoom coefficient
             */
            this.zoomCoefficient = 1.04;
            /**
             * Padding for max zoom
             */
            this.padding = 0.1;
            /**
             * Max scale
             */
            this.maxScale = 5;
            this.scheme = scheme;
        }
        /**
         * Set zoom
         * @param {number} delta
         * @returns {boolean}
         */
        ZoomManager.prototype.zoom = function (delta) {
            var factor = Math.pow(this.zoomCoefficient, delta);
            return this.zoomByFactor(factor);
        };
        /**
         * Set scale
         * @param scale
         * @returns {boolean}
         */
        ZoomManager.prototype.setScale = function (scale) {
            var factor = this.scale / scale;
            return this.zoomByFactor(factor);
        };
        /**
         * Scale with all objects visible + padding
         * @returns {number}
         */
        ZoomManager.prototype.getScaleWithAllObjects = function () {
            var boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();
            var maxScaleX = ((boundingRect.right - boundingRect.left) * (this.padding + 1)) / this.scheme.getWidth();
            var maxScaleY = ((boundingRect.bottom - boundingRect.top) * (this.padding + 1)) / this.scheme.getHeight();
            return maxScaleX > maxScaleY ? maxScaleX : maxScaleY;
        };
        /**
         * Zoom by factor
         * @param factor
         * @returns {boolean}
         */
        ZoomManager.prototype.zoomByFactor = function (factor) {
            var _this = this;
            if (this.renderAllTimer) {
                clearTimeout(this.renderAllTimer);
            }
            var boundingRectDimensions = this.scheme.getStorageManager().getObjectsDimensions();
            var canScaleX = true;
            var canScaleY = true;
            var oldScale = this.scale;
            var newScale = oldScale * factor;
            if (factor < 1) {
                /**
                 * Cant zoom less that 100% + padding
                 */
                canScaleX = this.scheme.getWidth() * (1 - this.padding) < boundingRectDimensions.width * newScale;
                canScaleY = this.scheme.getHeight() * (1 - this.padding) < boundingRectDimensions.height * newScale;
            }
            else {
                /**
                 * Cant zoom more that maxScale
                 */
                canScaleX = this.scheme.getWidth() * this.maxScale > boundingRectDimensions.width * newScale;
                canScaleY = this.scheme.getHeight() * this.maxScale > boundingRectDimensions.height * newScale;
            }
            this.scheme.getEventManager().sendEvent('zoom', {
                oldScale: oldScale,
                newScale: newScale,
                factor: factor,
                success: canScaleX || canScaleY
            });
            if (canScaleX || canScaleY) {
                this.scale = newScale;
                this.scheme.getView().setScale(newScale);
                this.scheme.getView().applyTransformation();
                if (this.scheme.useSchemeCache()) {
                    this.scheme.requestDrawFromCache();
                    this.renderAllTimer = setTimeout(function () { _this.scheme.requestRenderAll(); }, 300);
                }
                else {
                    this.scheme.requestRenderAll();
                }
                return true;
            }
            return false;
        };
        /**
         * Get scale
         * @returns {number}
         */
        ZoomManager.prototype.getScale = function () {
            return this.scale;
        };
        /**
         * Reset scale
         */
        ZoomManager.prototype.resetScale = function () {
            this.scale = 1;
        };
        /**
         * Handle mouse wheel
         * @param e
         * @returns {void|boolean}
         */
        ZoomManager.prototype.handleMouseWheel = function (e) {
            var delta = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;
            if (delta) {
                this.zoomToPointer(e, delta);
            }
            return e.preventDefault() && false;
        };
        /**
         * Zoom to pointer
         * @param e
         * @param delta
         */
        ZoomManager.prototype.zoomToPointer = function (e, delta) {
            this.scheme.getEventManager().setLastClientPositionFromEvent(e);
            this.zoomToPoint({
                x: this.scheme.getEventManager().getLastClientX(),
                y: this.scheme.getEventManager().getLastClientY()
            }, delta);
        };
        /**
         * Zoom to center
         * @param delta
         */
        ZoomManager.prototype.zoomToCenter = function (delta) {
            this.zoomToPoint({
                x: this.scheme.getWidth() / 2,
                y: this.scheme.getHeight() / 2
            }, delta);
        };
        /**
         * Zoom to point
         * @param point
         * @param delta
         */
        ZoomManager.prototype.zoomToPoint = function (point, delta) {
            var prevScale = this.scheme.getZoomManager().getScale();
            var zoomed = this.scheme.getZoomManager().zoom(delta);
            if (zoomed) {
                // scroll to cursor
                var newScale = this.scheme.getZoomManager().getScale();
                var prevCenter = {
                    x: point.x / prevScale,
                    y: point.y / prevScale,
                };
                var newCenter = {
                    x: point.x / newScale,
                    y: point.y / newScale,
                };
                var scaleFactor = prevScale / newScale;
                var leftOffsetDelta = (newCenter.x - prevCenter.x) * newScale;
                var topOffsetDelta = (newCenter.y - prevCenter.y) * newScale;
                var scrollLeft = this.scheme.getScrollManager().getScrollLeft() / scaleFactor;
                var scrollTop = this.scheme.getScrollManager().getScrollTop() / scaleFactor;
                this.scheme.getScrollManager().scroll(scrollLeft + leftOffsetDelta, scrollTop + topOffsetDelta);
            }
        };
        /**
         * Set padding
         * @param value
         */
        ZoomManager.prototype.setPadding = function (value) {
            this.padding = value;
        };
        /**
         * Set max scale
         * @param value
         */
        ZoomManager.prototype.setMaxScale = function (value) {
            this.maxScale = value;
        };
        /**
         * Set zoomCoefficient
         * @param value
         */
        ZoomManager.prototype.setZoomCoefficient = function (value) {
            this.zoomCoefficient = value;
        };
        return ZoomManager;
    }());
    SchemeDesigner.ZoomManager = ZoomManager;
})(SchemeDesigner || (SchemeDesigner = {}));
