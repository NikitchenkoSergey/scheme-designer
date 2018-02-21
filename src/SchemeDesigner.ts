/**
 * SchemeDesigner class
 */
class SchemeDesigner
{
    /**
     * All objects
     */
    protected objects: SchemeObject[];

    /**
     * Canvas element
     */
    protected canvas: HTMLCanvasElement;

    /**
     * Canvas context
     */
    protected canvas2DContext: CanvasRenderingContext2D;

    /**
     * Frame interval
     */
    protected frameIntervalToken: number;

    /**
     * Frame interval delay
     */
    protected frameIntervalDelay: number = 15;

    /**
     * Requested render all
     */
    protected renderAllRequested: boolean = false;

    /**
     * Hovered objects
     */
    protected hoveredObjects: SchemeObject[] = [];

    /**
     * Default cursor style
     */
    protected defaultCursorStyle: string = 'default';

    /**
     * Last client x
     */
    protected lastClientX: number;

    /**
     * Last client Y
     */
    protected lastClientY: number;

    /**
     * Current scale
     */
    protected scale: number = 1;

    /**
     * Scroll left
     */
    protected scrollLeft: number = 0;

    /**
     * Scroll top
     */
    protected scrollTop: number = 0;

    /**
     * Constructor
     * @param {HTMLCanvasElement} canvas
     * @param {Object} params
     */
    constructor (canvas: HTMLCanvasElement, params?: any)
    {
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
    protected frame(): void
    {
        if (this.renderAllRequested) {
            this.renderAll();
            this.renderAllRequested = false;
        }
    }

    /**
     * Reset frame interval
     */
    protected resetFrameInterval(): void
    {
        if (this.frameIntervalToken) {
            clearInterval(this.frameIntervalToken);
        }
        this.frameIntervalToken = setInterval(() => this.frame(), this.frameIntervalDelay);
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
        this.renderAllRequested = true;
        return this;
    }

    /**
     * todo render only visible objects
     * Render all objects
     */
    protected renderAll(): void
    {
        this.sendEvent('renderAllStart');

        this.clearContext();

        for (let schemeObject of this.objects) {
            schemeObject.render(this);
        }
        this.sendEvent('renderAllEnd');
    }

    /**
     * Send event
     * @param {string} eventName
     * @param data
     */
    protected sendEvent(eventName: string, data?: any): void
    {
        let fullEventName = 'schemeDesigner.' + eventName;

        if (typeof CustomEvent === 'function') {
            let event = new CustomEvent(fullEventName, {
                detail: data
            });
            this.canvas.dispatchEvent(event);
        } else {
            let event = document.createEvent('CustomEvent');
            event.initCustomEvent(fullEventName, false, false, data);
            this.canvas.dispatchEvent(event);
        }


    }

    /**
     * Add object
     * @param {SchemeObject} object
     */
    public addObject(object: SchemeObject): void
    {
        this.objects.push(object);
    }

    /**
     * Remove object
     * @param {SchemeObject} object
     */
    public removeObject(object: SchemeObject): void
    {
        this.objects.filter(existObject => existObject !== object);
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
     * Set frame interval delay
     * @param frameIntervalDelay
     * @returns {SchemeDesigner}
     */
    public setFrameIntervalDelay(frameIntervalDelay: number): this
    {
        this.frameIntervalDelay = frameIntervalDelay;
        return this;
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
     * Bind events
     */
    protected bindEvents(): void {
        // mouse events
        this.canvas.addEventListener('mousedown', (e: MouseEvent) => {this.onMouseDown(e)});
        this.canvas.addEventListener('click', (e: MouseEvent) => {this.onClick(e)});
        this.canvas.addEventListener('dblclick', (e: MouseEvent) => {this.onDoubleClick(e)});
        this.canvas.addEventListener('mousemove', (e: MouseEvent) => {this.onMouseMove(e)});
        this.canvas.addEventListener('mouseout', (e: MouseEvent) => {this.onMouseOut(e)});
        this.canvas.addEventListener('mouseenter', (e: MouseEvent) => {this.onMouseEnter(e)});
        this.canvas.addEventListener('contextmenu', (e: MouseEvent) => {this.onContextMenu(e)});

        // wheel
        this.canvas.addEventListener('mousewheel', (e: MouseWheelEvent) => {this.onMouseWheel(e)});

        // touch events
        // todo touchstart
        // todo touchmove
    }

    /**
     * todo
     * @param e
     */
    protected onMouseDown(e: MouseEvent)
    {

    }

    /**
     * On click
     * @param e
     */
    protected onClick(e: MouseEvent)
    {
        let objects = this.findObjectsForEvent(e);
        for (let schemeObject of objects) {
            schemeObject.isSelected = !schemeObject.isSelected;

            this.sendEvent('clickOnObject', schemeObject);
        }
        if (objects.length) {
            this.requestRenderAll();
        }
    }

    /**
     * todo
     * @param e
     */
    protected onDoubleClick(e: MouseEvent)
    {

    }

    /**
     * On mouse move
     * @param e
     */
    protected onMouseMove(e: MouseEvent)
    {
        let coordinates = this.getCoordinatesFromEvent(e);
        this.lastClientX = coordinates[0];
        this.lastClientY = coordinates[1];

        let objects = this.findObjectsForEvent(e);
        let mustReRender = false;
        let hasNewHovers = false;

        if (this.hoveredObjects.length) {
            for (let schemeHoveredObject of this.hoveredObjects) {
                // already hovered
                let alreadyHovered = false;

                for (let schemeObject of objects) {
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
            for (let schemeObject of objects) {
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
    }

    /**
     * todo
     * @param e
     */
    protected onMouseOut(e: MouseEvent)
    {

    }

    /**
     * todo
     * @param e
     */
    protected onMouseEnter(e: MouseEvent)
    {

    }

    /**
     * Zoom by wheel
     * @param e
     */
    protected onMouseWheel(e: MouseWheelEvent)
    {
        let delta = e.wheelDelta ? e.wheelDelta / 40 : e.detail ? -e.detail : 0;
        if (delta) {
            this.zoom(delta);

            // todo scroll to cursor
            //this.scroll(mousePointTo.x, mousePointTo.y);
        }

        return e.preventDefault() && false;
    }

    /**
     * Set zoom
     * @param {number} delta
     */
    public zoom(delta: number): void
    {
        let factor = Math.pow(1.03, delta);

        this.canvas2DContext.scale(factor, factor);
        this.scale = this.scale * factor;

        this.requestRenderAll();
    }

    /**
     * todo
     * @param e
     */
    protected onContextMenu(e: MouseEvent)
    {

    }


    /**
     * Find objects by event
     * @param e
     * @returns {SchemeObject[]}
     */
    protected findObjectsForEvent(e: MouseEvent)
    {
        let coordinates = this.getCoordinatesFromEvent(e);
        return this.findObjectsByCoordinates(coordinates[0], coordinates[1]);
    }

    /**
     * Get coordinates from event
     * @param e
     * @returns {number[]}
     */
    protected getCoordinatesFromEvent(e: MouseEvent): [number, number]
    {
        let clientRect = this.canvas.getBoundingClientRect();
        let x = e.clientX - clientRect.left;
        let y = e.clientY - clientRect.top;

        return [x, y];
    }

    /**
     * find objects by coordinates
     * @param x
     * @param y
     * @returns {SchemeObject[]}
     */
    protected findObjectsByCoordinates(x: number, y: number): SchemeObject[]
    {
        let result: SchemeObject[] = [];

        // scroll
        x = x + this.scrollLeft;
        y = y + this.scrollTop;

        // scale
        x = x / this.scale;
        y = y / this.scale;


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
     * Get scroll left
     * @returns {number}
     */
    public getScrollLeft(): number
    {
        return this.scrollLeft;
    }

    /**
     * Get scroll top
     * @returns {number}
     */
    public getScrollTop(): number
    {
        return this.scrollTop;
    }

    /**
     * Set scroll
     * @param {number} left
     * @param {number} top
     */
    public scroll(left: number, top: number): void
    {
        this.scrollLeft = left;
        this.scrollTop = top;
        this.requestRenderAll();
    }
}
