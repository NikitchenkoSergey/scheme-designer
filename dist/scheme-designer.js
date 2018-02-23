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
             * Current scale
             */
            this.scale = 1;
            this.objects = [];
            this.canvas = canvas;
            this.canvas2DContext = this.canvas.getContext('2d');
            this.requestFrameAnimation = this.getRequestAnimationFrameFunction();
            this.cancelFrameAnimation = this.getCancelAnimationFunction();
            this.devicePixelRatio = this.getDevicePixelRatio();
            /**
             * Managers
             */
            this.scrollManager = new SchemeDesigner.ScrollManager(this);
            this.eventManager = new SchemeDesigner.EventManager(this);
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
         * Get request animation frame function, polyfill
         * @returns {Object}
         */
        Scheme.prototype.getRequestAnimationFrameFunction = function () {
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
         * Get cancel animation function, polyfill
         * @returns {(handle:number)=>void}
         */
        Scheme.prototype.getCancelAnimationFunction = function () {
            return window.cancelAnimationFrame || window.clearTimeout;
        };
        /**
         * Get device pixel radio, polyfill
         * @returns {number}
         */
        Scheme.prototype.getDevicePixelRatio = function () {
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
        /**
         * Request animation
         * @param requestId
         * @returns {any}
         */
        Scheme.prototype.requestFrameAnimationApply = function (requestId) {
            return this.requestFrameAnimation.apply(window, [requestId]);
        };
        /**
         * Cancel animation
         * @param requestId
         * @returns {any}
         */
        Scheme.prototype.cancelAnimationFrameApply = function (requestId) {
            return this.cancelFrameAnimation.apply(window, [requestId]);
        };
        /**
         * Clear canvas context
         */
        Scheme.prototype.clearContext = function () {
            this.canvas2DContext.clearRect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);
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
            for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
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
            this.objects.push(object);
            this.reCalcObjectsBoundingRect();
        };
        /**
         * Remove object
         * @param {SchemeObject} object
         */
        Scheme.prototype.removeObject = function (object) {
            this.objects.filter(function (existObject) { return existObject !== object; });
            this.reCalcObjectsBoundingRect();
        };
        /**
         * Remove all objects
         */
        Scheme.prototype.removeObjects = function () {
            this.objects = [];
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
         * Set zoom
         * @param {number} delta
         * @returns {boolean}
         */
        Scheme.prototype.zoom = function (delta) {
            var factor = Math.pow(1.03, delta);
            var boundingRect = this.getObjectsBoundingRect();
            var canScaleX = true;
            var canScaleY = true;
            if (factor < 1) {
                canScaleX = this.canvas.width / 1.3 < boundingRect.right * this.scale;
                canScaleY = this.canvas.height / 1.3 < boundingRect.bottom * this.scale;
            }
            else {
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
        };
        /**
         * Get scale
         * @returns {number}
         */
        Scheme.prototype.getScale = function () {
            return this.scale;
        };
        /**
         * find objects by coordinates
         * @param x
         * @param y
         * @returns {SchemeObject[]}
         */
        Scheme.prototype.findObjectsByCoordinates = function (x, y) {
            var result = [];
            // scale
            x = x / this.scale;
            y = y / this.scale;
            // scroll
            x = x - this.scrollManager.getScrollLeft();
            y = y - this.scrollManager.getScrollTop();
            for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
                var schemeObject = _a[_i];
                var boundingRect = schemeObject.getBoundingRect();
                if (boundingRect.left <= x && boundingRect.right >= x
                    && boundingRect.top <= y && boundingRect.bottom >= y) {
                    result.push(schemeObject);
                }
            }
            return result;
        };
        /**
         * All objects
         * @returns {SchemeObject[]}
         */
        Scheme.prototype.getObjects = function () {
            return this.objects;
        };
        /**
         * Get default cursor style
         * @returns {string}
         */
        Scheme.prototype.getDefaultCursorStyle = function () {
            return this.defaultCursorStyle;
        };
        /**
         * Get bounding rect of all objects
         * @returns {{left: number, top: number, right: number, bottom: number}}
         */
        Scheme.prototype.getObjectsBoundingRect = function () {
            if (!this.objectsBoundingRect) {
                this.objectsBoundingRect = this.calculateObjectsBoundingRect();
            }
            return this.objectsBoundingRect;
        };
        /**
         * Recalculate bounding rect
         */
        Scheme.prototype.reCalcObjectsBoundingRect = function () {
            this.objectsBoundingRect = null;
        };
        /**
         * Get bounding rect of all objects
         * @returns {{left: number, top: number, right: number, bottom: number}}
         */
        Scheme.prototype.calculateObjectsBoundingRect = function () {
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
             * Is selected
             */
            this.isSelected = false;
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
            this.params = params;
        }
        /**
         * Rendering object
         */
        SchemeObject.prototype.render = function (Scheme) {
            this.renderFunction(this, Scheme);
        };
        /**
         * Click on object
         * @param {MouseEvent} e
         * @param {Scheme} schemeDesigner
         */
        SchemeObject.prototype.click = function (e, schemeDesigner) {
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
         * @returns {{left: number, top: number, right: number, bottom: number}}
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
             * Hovered objects
             */
            this.hoveredObjects = [];
            this.scheme = scheme;
            this.lastClientX = this.scheme.getCanvas().width / 2;
            this.lastClientY = this.scheme.getCanvas().height / 2;
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
            // todo touchstart
            // todo touchmove
        };
        /**
         * Mouse down
         * @param e
         */
        EventManager.prototype.onMouseDown = function (e) {
            this.setLastClientPosition(e);
            this.scheme.setCursorStyle('move');
            this.isDragging = true;
        };
        /**
         * Mouse up
         * @param e
         */
        EventManager.prototype.onMouseUp = function (e) {
            this.setLastClientPosition(e);
            this.scheme.setCursorStyle(this.scheme.getDefaultCursorStyle());
            this.isDragging = false;
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
                    schemeObject.isSelected = !schemeObject.isSelected;
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
            this.setLastClientPosition(e);
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
            this.setLastClientPosition(e);
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
            var delta = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;
            if (delta) {
                var zoomed = this.scheme.zoom(delta);
                this.setLastClientPosition(e);
                if (zoomed) {
                    // scroll to cursor, param for calc delta
                    var k = 0.18 / this.scheme.getScale();
                    var leftOffsetDelta = ((this.scheme.getCanvas().width / 2) - this.lastClientX) * k;
                    var topOffsetDelta = ((this.scheme.getCanvas().height / 2) - this.lastClientY) * k;
                    this.scheme.getScrollManager().scroll(this.scheme.getScrollManager().getScrollLeft() + leftOffsetDelta, this.scheme.getScrollManager().getScrollTop() + topOffsetDelta);
                }
            }
            return e.preventDefault() && false;
        };
        /**
         * Set last clent position
         * @param e
         */
        EventManager.prototype.setLastClientPosition = function (e) {
            var coordinates = this.getCoordinatesFromEvent(e);
            this.lastClientX = coordinates[0];
            this.lastClientY = coordinates[1];
        };
        /**
         * Find objects by event
         * @param e
         * @returns {SchemeObject[]}
         */
        EventManager.prototype.findObjectsForEvent = function (e) {
            var coordinates = this.getCoordinatesFromEvent(e);
            return this.scheme.findObjectsByCoordinates(coordinates[0], coordinates[1]);
        };
        /**
         * Get coordinates from event
         * @param e
         * @returns {number[]}
         */
        EventManager.prototype.getCoordinatesFromEvent = function (e) {
            var clientRect = this.scheme.getCanvas().getBoundingClientRect();
            var x = e.clientX - clientRect.left;
            var y = e.clientY - clientRect.top;
            return [x, y];
        };
        /**
         * Get last client x
         * @returns {number}
         */
        EventManager.prototype.getLastClientX = function () {
            return this.lastClientX;
        };
        /**
         * Get last client y
         * @returns {number}
         */
        EventManager.prototype.getLastClientY = function () {
            return this.lastClientY;
        };
        /**
         * Send event
         * @param {string} eventName
         * @param data
         */
        EventManager.prototype.sendEvent = function (eventName, data) {
            var fullEventName = 'schemeDesigner.' + eventName;
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
            var boundingRect = this.scheme.getObjectsBoundingRect();
            var leftScrollDelta = this.scrollLeft - left;
            this.scrollLeft = left;
            this.scrollTop = top;
            this.scheme.requestRenderAll();
        };
        /**
         * Set scheme to center og objects
         */
        ScrollManager.prototype.toCenter = function () {
            var boundingRect = this.scheme.getObjectsBoundingRect();
            var widthDelta = (boundingRect.right / this.scheme.getScale()) - this.scheme.getCanvas().width;
            var heightDelta = (boundingRect.bottom / this.scheme.getScale()) - this.scheme.getCanvas().height;
            var scrollLeft = widthDelta / 2;
            var scrollTop = heightDelta / 2;
            this.scroll(scrollLeft, scrollTop);
        };
        /**
         * Handle dragging
         * @param e
         */
        ScrollManager.prototype.handleDragging = function (e) {
            var lastClientX = this.scheme.getEventManager().getLastClientX();
            var lastClientY = this.scheme.getEventManager().getLastClientY();
            this.scheme.getEventManager().setLastClientPosition(e);
            var leftCenterOffset = this.scheme.getEventManager().getLastClientX() - lastClientX;
            var topCenterOffset = this.scheme.getEventManager().getLastClientY() - lastClientY;
            // scale
            leftCenterOffset = leftCenterOffset / this.scheme.getScale();
            topCenterOffset = topCenterOffset / this.scheme.getScale();
            var scrollLeft = leftCenterOffset + this.getScrollLeft();
            var scrollTop = topCenterOffset + this.getScrollTop();
            this.scroll(scrollLeft, scrollTop);
        };
        return ScrollManager;
    }());
    SchemeDesigner.ScrollManager = ScrollManager;
})(SchemeDesigner || (SchemeDesigner = {}));
