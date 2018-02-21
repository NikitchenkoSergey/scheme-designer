/**
 * SchemeDesigner class
 */
var SchemeDesigner = /** @class */ (function () {
    /**
     * Constructor
     * @param {HTMLCanvasElement} canvas
     * @param {Object} params
     */
    function SchemeDesigner(canvas, params) {
        /**
         * Frame interval delay
         */
        this.frameIntervalDelay = 15;
        /**
         * Requested render all
         */
        this.renderAllRequested = false;
        /**
         * Hovered objects
         */
        this.hoveredObjects = [];
        /**
         * Default cursor style
         */
        this.defaultCursorStyle = 'default';
        /**
         * Current scale
         */
        this.scale = 1;
        /**
         * Scroll left
         */
        this.scrollLeft = 0;
        /**
         * Scroll top
         */
        this.scrollTop = 0;
        /**
         * Is dragging
         */
        this.isDragging = false;
        this.objects = [];
        this.canvas = canvas;
        this.canvas2DContext = this.canvas.getContext('2d');
        this.lastClientX = this.canvas.width / 2;
        this.lastClientY = this.canvas.height / 2;
        this.resetFrameInterval();
        this.bindEvents();
    }
    /**
     * Frame controller
     */
    SchemeDesigner.prototype.frame = function () {
        if (this.renderAllRequested) {
            this.renderAll();
            this.renderAllRequested = false;
        }
    };
    /**
     * Reset frame interval
     */
    SchemeDesigner.prototype.resetFrameInterval = function () {
        var _this = this;
        if (this.frameIntervalToken) {
            clearInterval(this.frameIntervalToken);
        }
        this.frameIntervalToken = setInterval(function () { return _this.frame(); }, this.frameIntervalDelay);
    };
    /**
     * Clear canvas context
     */
    SchemeDesigner.prototype.clearContext = function () {
        this.canvas2DContext.clearRect(0, 0, this.canvas.width / this.scale, this.canvas.height / this.scale);
        return this;
    };
    /**
     * Request render all
     */
    SchemeDesigner.prototype.requestRenderAll = function () {
        this.renderAllRequested = true;
        return this;
    };
    /**
     * todo render only visible objects
     * Render all objects
     */
    SchemeDesigner.prototype.renderAll = function () {
        this.sendEvent('renderAllStart');
        this.clearContext();
        for (var _i = 0, _a = this.objects; _i < _a.length; _i++) {
            var schemeObject = _a[_i];
            schemeObject.render(this);
        }
        this.sendEvent('renderAllEnd');
    };
    /**
     * Send event
     * @param {string} eventName
     * @param data
     */
    SchemeDesigner.prototype.sendEvent = function (eventName, data) {
        var fullEventName = 'schemeDesigner.' + eventName;
        if (typeof CustomEvent === 'function') {
            var event_1 = new CustomEvent(fullEventName, {
                detail: data
            });
            this.canvas.dispatchEvent(event_1);
        }
        else {
            var event_2 = document.createEvent('CustomEvent');
            event_2.initCustomEvent(fullEventName, false, false, data);
            this.canvas.dispatchEvent(event_2);
        }
    };
    /**
     * Add object
     * @param {SchemeObject} object
     */
    SchemeDesigner.prototype.addObject = function (object) {
        this.objects.push(object);
    };
    /**
     * Remove object
     * @param {SchemeObject} object
     */
    SchemeDesigner.prototype.removeObject = function (object) {
        this.objects.filter(function (existObject) { return existObject !== object; });
    };
    /**
     * Remove all objects
     */
    SchemeDesigner.prototype.removeObjects = function () {
        this.objects = [];
    };
    /**
     * Canvas getter
     * @returns {HTMLCanvasElement}
     */
    SchemeDesigner.prototype.getCanvas = function () {
        return this.canvas;
    };
    /**
     * Canvas context getter
     * @returns {CanvasRenderingContext2D}
     */
    SchemeDesigner.prototype.getCanvas2DContext = function () {
        return this.canvas2DContext;
    };
    /**
     * Set frame interval delay
     * @param frameIntervalDelay
     * @returns {SchemeDesigner}
     */
    SchemeDesigner.prototype.setFrameIntervalDelay = function (frameIntervalDelay) {
        this.frameIntervalDelay = frameIntervalDelay;
        return this;
    };
    /**
     * Set cursor style
     * @param {string} cursor
     * @returns {SchemeDesigner}
     */
    SchemeDesigner.prototype.setCursorStyle = function (cursor) {
        this.canvas.style.cursor = cursor;
        return this;
    };
    /**
     * Bind events
     */
    SchemeDesigner.prototype.bindEvents = function () {
        var _this = this;
        // mouse events
        this.canvas.addEventListener('mousedown', function (e) { _this.onMouseDown(e); });
        this.canvas.addEventListener('mouseup', function (e) { _this.onMouseUp(e); });
        this.canvas.addEventListener('click', function (e) { _this.onClick(e); });
        this.canvas.addEventListener('dblclick', function (e) { _this.onDoubleClick(e); });
        this.canvas.addEventListener('mousemove', function (e) { _this.onMouseMove(e); });
        this.canvas.addEventListener('mouseout', function (e) { _this.onMouseOut(e); });
        this.canvas.addEventListener('mouseenter', function (e) { _this.onMouseEnter(e); });
        this.canvas.addEventListener('contextmenu', function (e) { _this.onContextMenu(e); });
        // wheel
        this.canvas.addEventListener('mousewheel', function (e) { _this.onMouseWheel(e); });
        // touch events
        // todo touchstart
        // todo touchmove
    };
    /**
     * Mouse down
     * @param e
     */
    SchemeDesigner.prototype.onMouseDown = function (e) {
        this.setLastClientPosition(e);
        this.setCursorStyle('move');
        this.isDragging = true;
    };
    /**
     * Mouse up
     * @param e
     */
    SchemeDesigner.prototype.onMouseUp = function (e) {
        this.setLastClientPosition(e);
        this.setCursorStyle(this.defaultCursorStyle);
        this.isDragging = false;
    };
    /**
     * On click
     * @param e
     */
    SchemeDesigner.prototype.onClick = function (e) {
        if (!this.isDragging) {
            var objects = this.findObjectsForEvent(e);
            for (var _i = 0, objects_1 = objects; _i < objects_1.length; _i++) {
                var schemeObject = objects_1[_i];
                schemeObject.isSelected = !schemeObject.isSelected;
                this.sendEvent('clickOnObject', schemeObject);
            }
            if (objects.length) {
                this.requestRenderAll();
            }
        }
    };
    /**
     * todo
     * @param e
     */
    SchemeDesigner.prototype.onDoubleClick = function (e) {
    };
    /**
     * On mouse move
     * @param e
     */
    SchemeDesigner.prototype.onMouseMove = function (e) {
        if (!this.isDragging) {
            this.handleHover(e);
        }
        else {
            this.handleDragging(e);
        }
    };
    /**
     * Handling hover
     * @param e
     */
    SchemeDesigner.prototype.handleHover = function (e) {
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
                this.setCursorStyle(schemeObject.cursorStyle);
                this.sendEvent('mouseOverObject', schemeObject);
            }
        }
        this.hoveredObjects = objects;
        if (!objects.length) {
            this.setCursorStyle(this.defaultCursorStyle);
        }
        if (mustReRender) {
            this.requestRenderAll();
        }
    };
    /**
     * Handle dragging
     * @param e
     */
    SchemeDesigner.prototype.handleDragging = function (e) {
        var lastClientX = this.lastClientX;
        var lastClientY = this.lastClientY;
        this.setLastClientPosition(e);
        var scrollLeft = lastClientX - this.lastClientX + this.scrollLeft;
        var scrollTop = lastClientY - this.lastClientY + this.scrollTop;
        this.scroll(scrollLeft, scrollTop);
    };
    /**
     * Mouse out
     * @param e
     */
    SchemeDesigner.prototype.onMouseOut = function (e) {
        this.setLastClientPosition(e);
        this.isDragging = false;
        this.requestRenderAll();
    };
    /**
     * todo
     * @param e
     */
    SchemeDesigner.prototype.onMouseEnter = function (e) {
    };
    /**
     * Zoom by wheel
     * @param e
     */
    SchemeDesigner.prototype.onMouseWheel = function (e) {
        var delta = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;
        if (delta) {
            var oldScale = this.scale;
            this.zoom(delta);
            this.setLastClientPosition(e);
            // scroll to cursor
            var k = 0.2 / this.scale;
            var leftOffsetDelta = (this.lastClientX - (this.canvas.width / 2)) * k;
            var topOffsetDelta = (this.lastClientY - (this.canvas.height / 2)) * k;
            this.scroll(this.scrollLeft + leftOffsetDelta, this.scrollTop + topOffsetDelta);
        }
        return e.preventDefault() && false;
    };
    /**
     * Set last clent position
     * @param e
     */
    SchemeDesigner.prototype.setLastClientPosition = function (e) {
        var coordinates = this.getCoordinatesFromEvent(e);
        this.lastClientX = coordinates[0];
        this.lastClientY = coordinates[1];
    };
    /**
     * Set zoom
     * @param {number} delta
     */
    SchemeDesigner.prototype.zoom = function (delta) {
        var factor = Math.pow(1.03, delta);
        var boundingRect = this.getObjectsBoundingRect();
        var canScaleX = true;
        var canScaleY = true;
        if (factor < 1) {
            canScaleX = this.canvas.width / 1.5 < boundingRect.right * this.scale;
            canScaleY = this.canvas.height / 1.5 < boundingRect.bottom * this.scale;
        }
        else {
            canScaleX = true;
            canScaleY = true;
        }
        if (canScaleX || canScaleY) {
            this.canvas2DContext.scale(factor, factor);
            this.scale = this.scale * factor;
            this.requestRenderAll();
        }
    };
    /**
     * Get scale
     * @returns {number}
     */
    SchemeDesigner.prototype.getScale = function () {
        return this.scale;
    };
    /**
     * todo
     * @param e
     */
    SchemeDesigner.prototype.onContextMenu = function (e) {
    };
    /**
     * Find objects by event
     * @param e
     * @returns {SchemeObject[]}
     */
    SchemeDesigner.prototype.findObjectsForEvent = function (e) {
        var coordinates = this.getCoordinatesFromEvent(e);
        return this.findObjectsByCoordinates(coordinates[0], coordinates[1]);
    };
    /**
     * Get coordinates from event
     * @param e
     * @returns {number[]}
     */
    SchemeDesigner.prototype.getCoordinatesFromEvent = function (e) {
        var clientRect = this.canvas.getBoundingClientRect();
        var x = e.clientX - clientRect.left;
        var y = e.clientY - clientRect.top;
        return [x, y];
    };
    /**
     * find objects by coordinates
     * @param x
     * @param y
     * @returns {SchemeObject[]}
     */
    SchemeDesigner.prototype.findObjectsByCoordinates = function (x, y) {
        var result = [];
        // scale
        x = x / this.scale;
        y = y / this.scale;
        // scroll
        x = x + this.scrollLeft;
        y = y + this.scrollTop;
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
     * Get scroll left
     * @returns {number}
     */
    SchemeDesigner.prototype.getScrollLeft = function () {
        return this.scrollLeft;
    };
    /**
     * Get scroll top
     * @returns {number}
     */
    SchemeDesigner.prototype.getScrollTop = function () {
        return this.scrollTop;
    };
    /**
     * Set scroll
     * @param {number} left
     * @param {number} top
     */
    SchemeDesigner.prototype.scroll = function (left, top) {
        this.scrollLeft = left;
        this.scrollTop = top;
        this.requestRenderAll();
    };
    /**
     * All objects
     * @returns {SchemeObject[]}
     */
    SchemeDesigner.prototype.getObjects = function () {
        return this.objects;
    };
    /**
     * Get bounding rect of all objects
     * @returns {{left: number, top: number, right: number, bottom: number}}
     */
    SchemeDesigner.prototype.getObjectsBoundingRect = function () {
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
     * Set scheme to center og objects
     */
    SchemeDesigner.prototype.toCenter = function () {
        var boundingRect = this.getObjectsBoundingRect();
        var widthDelta = (boundingRect.right / this.scale) - this.canvas.width;
        var heightDelta = (boundingRect.bottom / this.scale) - this.canvas.height;
        var scrollLeft = -(widthDelta / 2);
        var scrollTop = -(heightDelta / 2);
        this.scroll(scrollLeft, scrollTop);
    };
    return SchemeDesigner;
}());

/**
 * SchemeObject class
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
    SchemeObject.prototype.render = function (schemeDesigner) {
        this.renderFunction(this, schemeDesigner);
    };
    /**
     * Click on object
     * @param {MouseEvent} e
     * @param {SchemeDesigner} schemeDesigner
     */
    SchemeObject.prototype.click = function (e, schemeDesigner) {
    };
    /**
     * Mouse over
     * @param {MouseEvent} e
     * @param {SchemeDesigner} schemeDesigner
     */
    SchemeObject.prototype.mouseOver = function (e, schemeDesigner) {
    };
    /**
     * Mouse leave
     * @param {MouseEvent} e
     * @param {SchemeDesigner} schemeDesigner
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
