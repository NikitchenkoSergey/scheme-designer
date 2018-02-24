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
            this.canvas = canvas;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.canvas2DContext = this.canvas.getContext('2d', { alpha: false });
            this.requestFrameAnimation = SchemeDesigner.Polyfill.getRequestAnimationFrameFunction();
            this.cancelFrameAnimation = SchemeDesigner.Polyfill.getCancelAnimationFunction();
            this.devicePixelRatio = SchemeDesigner.Polyfill.getDevicePixelRatio();
            /**
             * Managers
             */
            this.scrollManager = new SchemeDesigner.ScrollManager(this);
            this.zoomManager = new SchemeDesigner.ZoomManager(this);
            this.eventManager = new SchemeDesigner.EventManager(this);
            this.storageManager = new SchemeDesigner.StorageManager(this);
            /**
             * Configure
             */
            if (params) {
                SchemeDesigner.Tools.configure(this.scrollManager, params.scroll);
                SchemeDesigner.Tools.configure(this.zoomManager, params.zoom);
                SchemeDesigner.Tools.configure(this.storageManager, params.storage);
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
         * Get width
         * @returns {number}
         */
        Scheme.prototype.getWidth = function () {
            return this.width;
        };
        /**
         * Get height
         * @returns {number}
         */
        Scheme.prototype.getHeight = function () {
            return this.height;
        };
        /**
         * Request animation
         * @param animation
         * @returns {number}
         */
        Scheme.prototype.requestFrameAnimationApply = function (animation) {
            return this.requestFrameAnimation.apply(window, [animation]);
        };
        /**
         * Cancel animation
         * @param requestId
         */
        Scheme.prototype.cancelAnimationFrameApply = function (requestId) {
            return this.cancelFrameAnimation.apply(window, [requestId]);
        };
        /**
         * Clear canvas context
         */
        Scheme.prototype.clearContext = function () {
            this.canvas2DContext.clearRect(0, 0, this.getWidth() / this.zoomManager.getScale(), this.getHeight() / this.zoomManager.getScale());
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
        };
        /**
         * todo render only visible objects
         * Render all objects
         */
        Scheme.prototype.renderAll = function () {
            if (this.renderingRequestId) {
                this.cancelAnimationFrameApply(this.renderingRequestId);
                this.renderingRequestId = 0;
            }
            this.eventManager.sendEvent('beforeRenderAll');
            this.clearContext();
            for (var _i = 0, _a = this.storageManager.getObjects(); _i < _a.length; _i++) {
                var schemeObject = _a[_i];
                schemeObject.render(this);
            }
            this.eventManager.sendEvent('afterRenderAll');
        };
        /**
         * Add object
         * @param {SchemeObject} object
         */
        Scheme.prototype.addObject = function (object) {
            this.storageManager.addObject(object);
        };
        /**
         * Remove object
         * @param {SchemeObject} object
         */
        Scheme.prototype.removeObject = function (object) {
            this.storageManager.removeObject(object);
        };
        /**
         * Remove all objects
         */
        Scheme.prototype.removeObjects = function () {
            this.storageManager.removeObjects();
        };
        /**
         * Canvas getter
         * @returns {HTMLCanvasElement}
         */
        Scheme.prototype.getCanvas = function () {
            return this.canvas;
        };
        /**
         * Canvas context getter
         * @returns {CanvasRenderingContext2D}
         */
        Scheme.prototype.getCanvas2DContext = function () {
            return this.canvas2DContext;
        };
        /**
         * Set cursor style
         * @param {string} cursor
         * @returns {SchemeDesigner}
         */
        Scheme.prototype.setCursorStyle = function (cursor) {
            this.canvas.style.cursor = cursor;
            return this;
        };
        /**
         * All objects
         * @returns {SchemeObject[]}
         */
        Scheme.prototype.getObjects = function () {
            return this.storageManager.getObjects();
        };
        /**
         * Get default cursor style
         * @returns {string}
         */
        Scheme.prototype.getDefaultCursorStyle = function () {
            return this.defaultCursorStyle;
        };
        /**
         * Disable selection on canvas
         */
        Scheme.prototype.disableCanvasSelection = function () {
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
                this.canvas.style[styleName] = 'none';
            }
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
             * Is hovered
             */
            this.isHovered = false;
            /**
             * Cursor style
             */
            this.cursorStyle = 'pointer';
            this.x = params.x;
            this.y = params.y;
            this.width = params.width;
            this.height = params.height;
            this.renderFunction = params.renderFunction;
            if (params.cursorStyle) {
                this.cursorStyle = params.cursorStyle;
            }
            if (params.clickFunction) {
                this.clickFunction = params.clickFunction;
            }
            this.params = params;
        }
        /**
         * Rendering object
         */
        SchemeObject.prototype.render = function (Scheme) {
            if (typeof this.renderFunction === 'function') {
                this.renderFunction(this, Scheme);
            }
        };
        /**
         * Click on object
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         */
        SchemeObject.prototype.click = function (e, schemeDesigner) {
            if (typeof this.clickFunction === 'function') {
                this.clickFunction(this, SchemeDesigner.Scheme, e);
            }
        };
        /**
         * Mouse over
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         */
        SchemeObject.prototype.mouseOver = function (e, schemeDesigner) {
        };
        /**
         * Mouse leave
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         */
        SchemeObject.prototype.mouseLeave = function (e, schemeDesigner) {
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
        return SchemeObject;
    }());
    SchemeDesigner.SchemeObject = SchemeObject;
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
                        obj[setter].apply(obj, [value]);
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
         * @returns {boolean}
         */
        Tools.pointInRect = function (coordinates, boundingRect) {
            var result = false;
            if (boundingRect.left <= coordinates.x && boundingRect.right >= coordinates.x
                && boundingRect.top <= coordinates.y && boundingRect.bottom >= coordinates.y) {
                result = true;
            }
            return result;
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
                var objectBoundingRect = schemeObject.getBoundingRect();
                var isPart = false;
                if (Tools.pointInRect({ x: objectBoundingRect.left, y: objectBoundingRect.top }, boundingRect)) {
                    isPart = true;
                }
                else if (Tools.pointInRect({ x: objectBoundingRect.right, y: objectBoundingRect.top }, boundingRect)) {
                    isPart = true;
                }
                else if (Tools.pointInRect({ x: objectBoundingRect.left, y: objectBoundingRect.bottom }, boundingRect)) {
                    isPart = true;
                }
                else if (Tools.pointInRect({ x: objectBoundingRect.right, y: objectBoundingRect.bottom }, boundingRect)) {
                    isPart = true;
                }
                if (isPart) {
                    result.push(schemeObject);
                }
                else {
                }
            }
            return result;
        };
        return Tools;
    }());
    SchemeDesigner.Tools = Tools;
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
            this.scheme = scheme;
            this.setLastClientPosition({
                x: this.scheme.getWidth() / 2,
                y: this.scheme.getHeight() / 2
            });
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
            // touch events
            this.scheme.getCanvas().addEventListener('touchstart', function (e) {
                _this.touchDistance = 0;
                _this.onMouseDown(e);
            });
            this.scheme.getCanvas().addEventListener('touchmove', function (e) {
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
                _this.onMouseUp(e);
            });
            this.scheme.getCanvas().addEventListener('touchcancel', function (e) {
                _this.onMouseUp(e);
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
            }
            // defer for prevent trigger click on mouseUp
            setTimeout(function () { _this.isDragging = false; }, 50);
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
                    schemeObject.click(e, this.scheme);
                    this.sendEvent('clickOnObject', schemeObject);
                }
                if (objects.length) {
                    this.scheme.requestRenderAll();
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
         * Get pointer from event
         * @param e
         * @param clientProp
         * @returns {number}
         */
        EventManager.prototype.getPointer = function (e, clientProp) {
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
                    // already hovered
                    var alreadyHovered = false;
                    for (var _b = 0, objects_2 = objects; _b < objects_2.length; _b++) {
                        var schemeObject = objects_2[_b];
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
                for (var _c = 0, objects_3 = objects; _c < objects_3.length; _c++) {
                    var schemeObject = objects_3[_c];
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
            var x = this.getPointer(e, 'clientX') - clientRect.left;
            var y = this.getPointer(e, 'clientY') - clientRect.top;
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
            this.maxHiddenPart = 0.85;
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
            var maxScrollLeft = (this.scheme.getWidth() / scale) - boundingRect.left;
            var maxScrollTop = (this.scheme.getHeight() / scale) - boundingRect.top;
            var minScrollLeft = -boundingRect.right;
            var minScrollTop = -boundingRect.bottom;
            maxScrollLeft = maxScrollLeft * this.maxHiddenPart;
            maxScrollTop = maxScrollTop * this.maxHiddenPart;
            minScrollLeft = minScrollLeft * this.maxHiddenPart;
            minScrollTop = minScrollTop * this.maxHiddenPart;
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
            this.scheme.requestRenderAll();
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
            var boundingRectWidth = (boundingRect.right - boundingRect.left) * this.scheme.getZoomManager().getScale();
            var boundingRectHeight = (boundingRect.bottom - boundingRect.top) * this.scheme.getZoomManager().getScale();
            var widthDelta = this.scheme.getWidth() - boundingRectWidth;
            var heightDelta = this.scheme.getHeight() - boundingRectHeight;
            var scrollLeft = (widthDelta / 2) / this.scheme.getZoomManager().getScale();
            var scrollTop = (heightDelta / 2) / this.scheme.getZoomManager().getScale();
            // left and top empty space
            scrollLeft = scrollLeft - boundingRect.left;
            scrollTop = scrollTop - boundingRect.top;
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
            // scale
            leftCenterOffset = leftCenterOffset / this.scheme.getZoomManager().getScale();
            topCenterOffset = topCenterOffset / this.scheme.getZoomManager().getScale();
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
            this.scheme = scheme;
            this.objects = [];
        }
        /**
         * Get objects
         * @returns {SchemeObject[]}
         */
        StorageManager.prototype.getObjects = function () {
            return this.objects;
        };
        /**
         * Add object
         * @param {SchemeObject} object
         */
        StorageManager.prototype.addObject = function (object) {
            this.objects.push(object);
            this.reCalcObjectsBoundingRect();
            this.requestBuildTree();
        };
        /**
         * Remove object
         * @param {SchemeObject} object
         */
        StorageManager.prototype.removeObject = function (object) {
            this.objects.filter(function (existObject) { return existObject !== object; });
            this.reCalcObjectsBoundingRect();
            this.requestBuildTree();
        };
        /**
         * Remove all objects
         */
        StorageManager.prototype.removeObjects = function () {
            this.objects = [];
            this.requestBuildTree();
        };
        /**
         * find objects by coordinates in tree
         * @param coordinates Coordinates
         * @returns {SchemeObject[]}
         */
        StorageManager.prototype.findObjectsByCoordinates = function (coordinates) {
            var result = [];
            // scale
            var x = coordinates.x;
            var y = coordinates.y;
            x = x / this.scheme.getZoomManager().getScale();
            y = y / this.scheme.getZoomManager().getScale();
            // scroll
            x = x - this.scheme.getScrollManager().getScrollLeft();
            y = y - this.scheme.getScrollManager().getScrollTop();
            // search node
            var rootNode = this.getTree();
            var node = this.findNodeByCoordinates(rootNode, { x: x, y: y });
            var nodeObjects = [];
            if (node) {
                nodeObjects = node.getObjects();
            }
            // search object in node
            for (var _i = 0, nodeObjects_1 = nodeObjects; _i < nodeObjects_1.length; _i++) {
                var schemeObject = nodeObjects_1[_i];
                var boundingRect = schemeObject.getBoundingRect();
                if (SchemeDesigner.Tools.pointInRect({ x: x, y: y }, boundingRect)) {
                    result.push(schemeObject);
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
            for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
                var schemeObject = _a[_i];
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
            this.rootTreeNode = new TreeNode(null, boundingRect, this.objects, 0);
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
            var leftNodeObjects = SchemeDesigner.Tools.filterObjectsByBoundingRect(leftBoundingRect, node.getObjects());
            var rightNodeObjects = SchemeDesigner.Tools.filterObjectsByBoundingRect(rightBoundingRect, node.getObjects());
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
         * Draw bounds of nodes for testing
         */
        StorageManager.prototype.showNodesParts = function () {
            var lastTreeNodes = this.getTree().getLastChildren();
            var context = this.scheme.getCanvas2DContext();
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
             * Objects in node
             */
            this.objects = [];
            this.parent = parent;
            this.boundingRect = boundingRect;
            this.objects = objects;
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
            return this.objects;
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
            return this.objects.length > 0;
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
         * Remove objects
         */
        TreeNode.prototype.removeObjects = function () {
            this.objects = [];
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
            var boundingRect = this.scheme.getStorageManager().getObjectsBoundingRect();
            var canScaleX = true;
            var canScaleY = true;
            var newScale = this.scale * factor;
            if (factor < 1) {
                /**
                 * Cant zoom less that 100% + padding
                 */
                canScaleX = this.scheme.getWidth() * (1 - this.padding) < boundingRect.right * newScale;
                canScaleY = this.scheme.getHeight() * (1 - this.padding) < boundingRect.bottom * newScale;
            }
            else {
                /**
                 * Cant zoom more that maxScale
                 */
                canScaleX = this.scheme.getWidth() * this.maxScale > boundingRect.right * newScale;
                canScaleY = this.scheme.getHeight() * this.maxScale > boundingRect.bottom * newScale;
            }
            if (canScaleX || canScaleY) {
                this.scheme.getCanvas2DContext().scale(factor, factor);
                this.scale = newScale;
                this.scheme.requestRenderAll();
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
            var prevScale = this.scheme.getZoomManager().getScale();
            var zoomed = this.scheme.getZoomManager().zoom(delta);
            this.scheme.getEventManager().setLastClientPositionFromEvent(e);
            if (zoomed) {
                // scroll to cursor
                var newScale = this.scheme.getZoomManager().getScale();
                var prevCenter = {
                    x: this.scheme.getEventManager().getLastClientX() / prevScale,
                    y: this.scheme.getEventManager().getLastClientY() / prevScale,
                };
                var newCenter = {
                    x: this.scheme.getEventManager().getLastClientX() / newScale,
                    y: this.scheme.getEventManager().getLastClientY() / newScale,
                };
                var leftOffsetDelta = newCenter.x - prevCenter.x;
                var topOffsetDelta = newCenter.y - prevCenter.y;
                this.scheme.getScrollManager().scroll(this.scheme.getScrollManager().getScrollLeft() + leftOffsetDelta, this.scheme.getScrollManager().getScrollTop() + topOffsetDelta);
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
