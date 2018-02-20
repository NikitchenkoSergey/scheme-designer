/**
 * SchemeDesigner class
 */
var SchemeDesigner = /** @class */ (function () {
    /**
     * Constructor
     * @param {HTMLCanvasElement} canvas
     */
    function SchemeDesigner(canvas) {
        /**
         * Frame interval delay
         */
        this.frameIntervalDelay = 20;
        /**
         * Requested render all
         */
        this.renderAllRequested = false;
        this.objects = [];
        this.canvas = canvas;
        this.canvas2DContext = this.canvas.getContext('2d');
        this.resetFrameInterval();
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
        this.canvas2DContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        var event = new CustomEvent('schemeDesigner.' + eventName, {
            detail: data
        });
        this.canvas.dispatchEvent(event);
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
        this.x = params.x;
        this.y = params.y;
        this.width = params.width;
        this.height = params.height;
        this.renderFunction = params.renderFunction;
        this.params = params;
    }
    /**
     * Rendering object
     */
    SchemeObject.prototype.render = function (schemeDesigner) {
        this.renderFunction(this, schemeDesigner);
    };
    return SchemeObject;
}());
