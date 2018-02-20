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
    protected isHovered: boolean = false;

    /**
     * Is selected
     */
    protected isSelected: boolean = false;

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

        this.params = params;
    }

    /**
     * Rendering object
     */
    public render(schemeDesigner: SchemeDesigner): void
    {
        this.renderFunction(this, schemeDesigner);
    }
}
