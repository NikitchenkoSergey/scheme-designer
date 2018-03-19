namespace SchemeDesigner {
    /**
     * Storage manager
     * @author Nikitchenko Sergey <nikitchenko.sergey@yandex.ru>
     */
    export class StorageManager {
        /**
         * Scheme object
         */
        protected scheme: Scheme;

        /**
         * Objects bounding rect
         */
        protected objectsBoundingRect: BoundingRect;

        /**
         * Root of tree
         */
        protected rootTreeNode: TreeNode;

        /**
         * Depth of tree
         */
        protected treeDepth: number = 6;

        /**
         * Layers
         */
        protected layers: Layers = {};

        /**
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        constructor(scheme: Scheme)
        {
            this.scheme = scheme;
        }

        /**
         * Get layer by id
         * @param {string} id
         * @return {SchemeDesigner.Layer | null}
         */
        public getLayerById(id: string): Layer|null
        {
           if (typeof this.layers[id] != 'undefined') {
               return this.layers[id];
           }
            return null;
        }


        /**
         * Get objects from visible layers
         * @return {SchemeDesigner.SchemeObject[]}
         */
        public getVisibleObjects(): SchemeObject[]
        {
            let result: SchemeObject[]  = [];

            let visibleObjectsByLayers = this.getVisibleObjectsByLayers();

            for (let layerId in visibleObjectsByLayers) {
                let objects = visibleObjectsByLayers[layerId];
                if (typeof objects !== 'undefined' && objects.length) {
                    result = [...result, ...objects];
                }
            }

            return result;
        }

        /**
         * Get visible objects by layers
         * @returns {SchemeObjectsByLayers}
         */
        public getVisibleObjectsByLayers(): SchemeObjectsByLayers
        {
            let result: SchemeObjectsByLayers = {};

            let layers = this.getSortedLayers();

            for (let layer of layers) {
                if (layer.getVisible()) {
                    let objects = layer.getObjects();
                    if (typeof objects !== 'undefined' && objects.length) {
                        result[layer.getId()] = objects;
                    }
                }
            }

            return result;
        }

        /**
         * Set layers
         * @param {SchemeDesigner.Layer[]} layers
         */
        public setLayers(layers: Layer[]): void
        {
            for (let layer of layers) {
                this.addLayer(layer);
            }
        }

        /**
         * Get layers
         * @returns {Layers}
         */
        public getLayers(): Layers
        {
            return this.layers;
        }

        /**
         * Get sorted layers by z-index
         * @returns {Layer[]}
         */
        public getSortedLayers(): Layer[]
        {
            let layers: Layer[] = [];
            for (let layerId in this.layers) {
                let layer = this.layers[layerId];
                if (layer.getVisible()) {
                    layers.push(layer);
                }
            }

            // sort layers by z-index
            layers.sort(function (a: Layer, b: Layer): number {
                if (a.getZIndex() < b.getZIndex()) {
                    return -1;
                }
                if (a.getZIndex() > b.getZIndex()) {
                    return 1;
                }
                return 0;
            });

            return layers;
        }

        /**
         * Add layer
         * @param {SchemeDesigner.Layer} layer
         */
        public addLayer(layer: Layer): void
        {
            let existLayer = this.getLayerById(layer.getId());
            if (existLayer instanceof Layer) {
                throw new Error('Layer with such id already exist');
            }
            this.layers[layer.getId()] = layer;
        }

        /**
         * Remove all layers
         */
        public removeLayers(): void
        {
            this.layers = {};

            this.applyStructureChange();
        }

        /**
         * Remove layer
         */
        public removeLayer(layerId: string): void
        {
            delete this.layers[layerId];

            this.applyStructureChange();
        }

        /**
         * Set layer visibility
         * @param {string} layerId
         * @param {boolean} visible
         */
        public setLayerVisibility(layerId: string, visible: boolean): void
        {
            let layer = this.getLayerById(layerId);
            if (!(layer instanceof Layer)) {
                throw new Error('Layer not found');
            }

            layer.setVisible(visible);

            this.applyStructureChange();
        }

        /**
         * Set layer activity
         * @param layerId
         * @param active
         */
        public setLayerActivity(layerId: string, active: boolean): void
        {
            let layer = this.getLayerById(layerId);
            if (!(layer instanceof Layer)) {
                throw new Error('Layer not found');
            }

            layer.setActive(active);
        }

        /**
         * Apple structure change
         */
        public applyStructureChange(): void
        {
            this.requestBuildTree();
            this.reCalcObjectsBoundingRect();
            this.scheme.updateCache(false);
            this.scheme.requestRenderAll();
        }

        /**
         * find objects by coordinates in tree
         * @param coordinates Coordinates
         * @returns {SchemeObject[]}
         */
        public findObjectsByCoordinates(coordinates: Coordinates): SchemeObject[]
        {
            let result: SchemeObject[] = [];

            let x = coordinates.x;
            let y = coordinates.y;


            // scroll
            x = x - this.scheme.getScrollManager().getScrollLeft();
            y = y - this.scheme.getScrollManager().getScrollTop();

            // scale
            x = x / this.scheme.getZoomManager().getScale();
            y = y / this.scheme.getZoomManager().getScale();

            // search node
            let rootNode = this.getTree();
            let node = this.findNodeByCoordinates(rootNode, {x: x, y: y});

            let nodeObjectsByLayers: SchemeObjectsByLayers = {};

            if (node) {
                nodeObjectsByLayers = node.getObjectsByLayers();
            }

            // search object in node
            for (let layerId in nodeObjectsByLayers) {
                let layer = this.getLayerById(layerId);
                if (!layer.isActive()) {
                    continue;
                }

                let objects = nodeObjectsByLayers[layerId];
                for (let schemeObject of objects) {

                    if (!schemeObject.isActive()) {
                        continue;
                    }

                    let boundingRect = schemeObject.getBoundingRect();
                    if (Tools.pointInRect({x: x, y: y}, boundingRect, schemeObject.getRotation())) {
                        result.push(schemeObject)
                    }
                }
            }

            return result;
        }

        /**
         * Get bounding rect of all objects
         * @returns BoundingRect
         */
        public getObjectsBoundingRect(): BoundingRect
        {
            if (!this.objectsBoundingRect) {
                this.objectsBoundingRect = this.calculateObjectsBoundingRect();
            }
            return this.objectsBoundingRect;
        }

        /**
         * All objects dimensions
         * @returns {Dimensions}
         */
        public getObjectsDimensions(): Dimensions
        {
            let boundingRect = this.getObjectsBoundingRect();

            return {
                width: boundingRect.right - boundingRect.left,
                height: boundingRect.bottom - boundingRect.top
            };
        }

        /**
         * Recalculate bounding rect
         */
        public reCalcObjectsBoundingRect(): void
        {
            this.objectsBoundingRect = null;
        }


        /**
         * Get bounding rect of all objects
         * @returns {{left: number, top: number, right: number, bottom: number}}
         */
        public calculateObjectsBoundingRect(): BoundingRect
        {
            let top: number;
            let left: number;
            let right: number;
            let bottom: number;

            let visibleObjects = this.getVisibleObjects();
            if (visibleObjects.length) {
                for (let schemeObject of visibleObjects) {
                    let schemeObjectBoundingRect = schemeObject.getBoundingRect();

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
        }

        /**
         * Set tree depth
         * @param value
         */
        public setTreeDepth(value: number): void
        {
            this.treeDepth = value;
        }

        /**
         * Request build tree
         */
        public requestBuildTree(): void
        {
            this.rootTreeNode = null;
        }

        /**
         * Get tree
         * @returns {TreeNode}
         */
        public getTree(): TreeNode
        {
            if (!this.rootTreeNode) {
                this.rootTreeNode = this.buildTree();
            }

            return this.rootTreeNode;
        }


        /**
         * Build tree
         * @returns {TreeNode}
         */
        public buildTree(): TreeNode
        {
            let boundingRect = this.getObjectsBoundingRect();

            this.rootTreeNode = new TreeNode(null, boundingRect, this.getVisibleObjectsByLayers(), 0);

            this.explodeTreeNodes(this.rootTreeNode, this.treeDepth);

            return this.rootTreeNode;
        }

        /**
         * Recursive explode node
         * @param node
         * @param depth
         */
        protected explodeTreeNodes(node: TreeNode, depth: number)
        {
            this.explodeTreeNode(node);
            depth--;
            if (depth > 0) {
                for (let childNode of node.getChildren()) {
                    this.explodeTreeNodes(childNode, depth);
                }
            }
        }

        /**
         * Explode node to children
         * @param node
         */
        protected explodeTreeNode(node: TreeNode): void
        {
            let nodeBoundingRect = node.getBoundingRect();
            let newDepth = node.getDepth() + 1;

            let leftBoundingRect = Tools.clone(nodeBoundingRect) as BoundingRect;
            let rightBoundingRect = Tools.clone(nodeBoundingRect) as BoundingRect;

            /**
             * Width or height explode
             */
            if (newDepth % 2 == 1) {
                let width = nodeBoundingRect.right - nodeBoundingRect.left;
                let delta = width / 2;
                leftBoundingRect.right = leftBoundingRect.right - delta;
                rightBoundingRect.left = rightBoundingRect.left + delta;
            } else {
                let height = nodeBoundingRect.bottom - nodeBoundingRect.top;
                let delta = height / 2;
                leftBoundingRect.bottom = leftBoundingRect.bottom - delta;
                rightBoundingRect.top = rightBoundingRect.top + delta;
            }

            let leftNodeObjects = Tools.filterLayersObjectsByBoundingRect(leftBoundingRect, node.getObjectsByLayers());
            let rightNodeObjects = Tools.filterLayersObjectsByBoundingRect(rightBoundingRect, node.getObjectsByLayers());

            let leftNode = new TreeNode(node, leftBoundingRect, leftNodeObjects, newDepth);
            let rightNode = new TreeNode(node, rightBoundingRect, rightNodeObjects, newDepth);

            node.addChild(leftNode);
            node.addChild(rightNode);

            node.removeObjects();
        }

        /**
         * Find node by coordinates
         * @param node
         * @param coordinates
         * @returns {TreeNode|null}
         */
        public findNodeByCoordinates(node: TreeNode, coordinates: Coordinates): TreeNode | null
        {
            let childNode = node.getChildByCoordinates(coordinates);

            if (!childNode) {
                return null;
            }

            if (childNode.isLastNode()) {
                return childNode;
            } else {
                return this.findNodeByCoordinates(childNode, coordinates);
            }
        }

        /**
         * Find nodes by rect
         * @param node
         * @param boundingRect
         * @returns {TreeNode[]}
         */
        public findNodesByBoundingRect(node: TreeNode | null, boundingRect: BoundingRect): TreeNode[]
        {
            if (!node) {
                node = this.getTree();
            }

            let result: TreeNode[] = [];

            let childNodes = node.getChildrenByBoundingRect(boundingRect);

            for (let childNode of childNodes) {
                if (childNode.isLastNode()) {
                    result.push(childNode);
                } else {
                    let subChildNodes = this.findNodesByBoundingRect(childNode, boundingRect);
                    for (let subChildNode of subChildNodes) {
                        result.push(subChildNode);
                    }
                }
            }


            return result;
        }

        /**
         * Draw bounds of nodes for testing
         */
        public showNodesParts(): void
        {
            let lastTreeNodes = this.getTree().getLastChildren();

            let context = this.scheme.getView().getContext();

            for (let lastTreeNode of lastTreeNodes) {
                let relativeX = lastTreeNode.getBoundingRect().left + this.scheme.getScrollManager().getScrollLeft();
                let relativeY = lastTreeNode.getBoundingRect().top + this.scheme.getScrollManager().getScrollTop();
                let width = lastTreeNode.getBoundingRect().right - lastTreeNode.getBoundingRect().left;
                let height = lastTreeNode.getBoundingRect().bottom - lastTreeNode.getBoundingRect().top;
                context.lineWidth = 1;
                context.strokeStyle = 'black';
                context.rect(relativeX, relativeY, width, height);
                context.stroke();
            }
        }

        /**
         * Return image storage
         * @param id
         * @returns {ImageStorage}
         */
        public getImageStorage(id: string): ImageStorage
        {
            return new ImageStorage(id, this.scheme);
        }
    }

    /**
     * Tree node
     */
    export class TreeNode {

        /**
         * Parent node
         */
        protected parent: TreeNode;

        /**
         * Children nodes
         */
        protected children: TreeNode[] = [];

        /**
         * Bounding rect of node
         */
        protected boundingRect: BoundingRect;

        /**
         * Objects in node by layers
         */
        protected objectsByLayers: SchemeObjectsByLayers = {};

        /**
         * Depth
         */
        protected depth: number;

        /**
         * Constructor
         * @param parent
         * @param boundingRect
         * @param objects
         * @param depth
         */
        constructor(parent: null | TreeNode, boundingRect: BoundingRect, objects: SchemeObjectsByLayers, depth: number)
        {
            this.parent = parent;
            this.boundingRect = boundingRect;
            this.objectsByLayers = objects;
            this.depth = depth;
        }

        /**
         * Add child
         * @param child
         */
        public addChild(child: TreeNode): void
        {
            this.children.push(child);
        }

        /**
         * Get objects
         * @returns {SchemeObject[]}
         */
        public getObjects(): SchemeObject[]
        {
            let result: SchemeObject[] = [];
            for (let layerId in this.objectsByLayers) {
                let objects = this.objectsByLayers[layerId];
                if (typeof objects !== 'undefined' && objects.length) {
                    result = [...result, ...objects];
                }
            }
            return result;
        }

        /**
         * Get objects in layer
         * @param layerId
         * @returns {SchemeObject[]}
         */
        public getObjectsByLayer(layerId: string): SchemeObject[]
        {
            if (typeof this.objectsByLayers[layerId] != 'undefined') {
                return this.objectsByLayers[layerId];
            }
            return [];
        }

        /**
         * Get objects by layers
         * @returns {SchemeObjectsByLayers}
         */
        public getObjectsByLayers(): SchemeObjectsByLayers
        {
            return this.objectsByLayers;
        }

        /**
         * Get children
         * @returns {TreeNode[]}
         */
        public getChildren(): TreeNode[]
        {
            return this.children;
        }

        /**
         * Is last node
         * @returns {boolean}
         */
        public isLastNode(): boolean
        {
            return Object.keys(this.objectsByLayers).length > 0;
        }

        /**
         * Get last children
         * @returns {TreeNode[]}
         */
        public getLastChildren(): TreeNode[]
        {
            let result: TreeNode[] = [];
            for (let childNode of this.children) {
                if (childNode.isLastNode()) {
                    result.push(childNode);
                } else {
                    let lastChildNodeChildren = childNode.getLastChildren();
                    for (let lastChildNodeChild of lastChildNodeChildren) {
                        result.push(lastChildNodeChild);
                    }
                }
            }

            return result;
        }

        /**
         * Get child by coordinates
         * @param coordinates
         * @returns {TreeNode|null}
         */
        public getChildByCoordinates(coordinates: Coordinates): TreeNode | null
        {
            for (let childNode of this.children) {
                if (Tools.pointInRect(coordinates, childNode.getBoundingRect())) {
                    return childNode;
                }
            }

            return null;
        }

        /**
         * Get child by bounding rect
         * @param boundingRect
         * @returns {TreeNode[]}
         */
        public getChildrenByBoundingRect(boundingRect: BoundingRect): TreeNode[]
        {
            let result: TreeNode[] = [];

            for (let childNode of this.children) {
                if (Tools.rectIntersectRect(childNode.getBoundingRect(), boundingRect)) {
                    result.push(childNode);
                }
            }

            return result;
        }

        /**
         * Remove objects
         */
        public removeObjects(): void
        {
            this.objectsByLayers = {};
        }

        /**
         * Get bounding rect
         * @returns {BoundingRect}
         */
        public getBoundingRect(): BoundingRect
        {
            return this.boundingRect;
        }

        /**
         * Get  depth
         * @returns {number}
         */
        public getDepth(): number
        {
            return this.depth;
        }
    }
}
