namespace SchemeDesigner {
    /**
     * Custom types
     */

    export type Coordinates = {x: number, y: number};

    export type Dimensions = {width: number, height: number};

    export type BoundingRect = {left: number, top: number, right: number, bottom: number};

    export interface SchemeObjectsByLayers {
        [key: string]: SchemeObject[];
    }

    export interface Layers {
        [key: string]: Layer;
    }
}
