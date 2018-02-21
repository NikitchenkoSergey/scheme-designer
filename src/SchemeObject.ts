/**
 * SchemeObject class
 */
class SchemeObject
{
    /**
     * X position
     */
    protected x: number;

    /**
     * Y position
     */
    protected y: number;

    /**
     * Width
     */
    protected width: number;

    /**
     * Height
     */
    protected height: number;

    /**
     * Is hovered
     */
    public isHovered: boolean = false;

    /**
     * Is selected
     */
    public isSelected: boolean = false;

    /**
     * Cursor style
     */
    public cursorStyle: string = 'pointer';

    /**
     * Render function
     */
    protected renderFunction: any;

    /**
     * All params of object
     */
    protected params: any;

    /**
     * Constructor
     * @param {Object} params
     */
    constructor(params: any)
    {
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
    public render(schemeDesigner: SchemeDesigner): void
    {
        this.renderFunction(this, schemeDesigner);
    }

    /**
     * Bounding rect
     * @returns {{left: number, top: number, right: number, bottom: number}}
     */
    public getBoundingRect(): any
    {
        return {
            left: this.x,
            top: this.y,
            right: this.x + this.width,
            bottom: this.y + this.height
        };
    }
}
