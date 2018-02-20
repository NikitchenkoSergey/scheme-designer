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
    protected frameIntervalDelay: number = 20;

    /**
     * Requested render all
     */
    protected renderAllRequested: boolean = false;

    /**
     * Constructor
     * @param {HTMLCanvasElement} canvas
     */
    constructor (canvas: HTMLCanvasElement)
    {
        this.objects = [];

        this.canvas = canvas;

        this.canvas2DContext = this.canvas.getContext('2d');

        this.resetFrameInterval();
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
        this.canvas2DContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        let event = new CustomEvent('schemeDesigner.' + eventName, {
            detail: data
        });
        this.canvas.dispatchEvent(event);
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
}
