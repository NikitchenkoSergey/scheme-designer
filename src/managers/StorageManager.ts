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
         * All objects
         */
        protected objects: SchemeObject[];

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
         * Constructor
         * @param {SchemeDesigner.Scheme} scheme
         */
        constructor(scheme: Scheme)
        {
            this.scheme = scheme;

            this.objects = [];
        }

        /**
         * Get objects
         * @returns {SchemeObject[]}
         */
        public getObjects(): SchemeObject[]
        {
            return this.objects;
        }

        /**
         * Add object
         * @param {SchemeObject} object
         */
        public addObject(object: SchemeObject): void
        {
            this.objects.push(object);
            this.reCalcObjectsBoundingRect();
            this.requestBuildTree();
        }

        /**
         * Remove object
         * @param {SchemeObject} object
         */
        public removeObject(object: SchemeObject): void
        {
            this.objects.filter(existObject => existObject !== object);
            this.reCalcObjectsBoundingRect();
            this.requestBuildTree();
        }

        /**
         * Remove all objects
         */
        public removeObjects(): void
        {
            this.objects = [];
            this.requestBuildTree();
        }

        /**
         * find objects by coordinates in tree
         * @param coordinates Coordinates
         * @returns {SchemeObject[]}
         */
        public findObjectsByCoordinates(coordinates: Coordinates): SchemeObject[]
        {
            let result: SchemeObject[] = [];

            // scale
            let x = coordinates.x;
            let y = coordinates.y;

            x = x / this.scheme.getZoomManager().getScale();
            y = y / this.scheme.getZoomManager().getScale();

            // scroll
            x = x - this.scheme.getScrollManager().getScrollLeft();
            y = y - this.scheme.getScrollManager().getScrollTop();


            // search node
            let rootNode = this.getTree();
            let node = this.findNodeByCoordinates(rootNode, {x: x, y: y});

            let nodeObjects: SchemeObject[] = [];

            if (node) {
                nodeObjects = node.getObjects();
            }

            // search object in node
            for (let schemeObject of nodeObjects) {
                let boundingRect = schemeObject.getBoundingRect();

                if (Tools.pointInRect({x: x, y: y}, boundingRect)) {
                    result.push(schemeObject)
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

            for (let schemeObject of this.objects) {
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

            this.rootTreeNode = new TreeNode(null, boundingRect, this.objects, 0);

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

            let leftNodeObjects = Tools.filterObjectsByBoundingRect(leftBoundingRect, node.getObjects());
            let rightNodeObjects = Tools.filterObjectsByBoundingRect(rightBoundingRect, node.getObjects());

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

            var context = this.scheme.getCanvas2DContext();

            for (let lastTreeNode of lastTreeNodes) {
                var relativeX = lastTreeNode.getBoundingRect().left + this.scheme.getScrollManager().getScrollLeft();
                var relativeY = lastTreeNode.getBoundingRect().top + this.scheme.getScrollManager().getScrollTop();
                var width = lastTreeNode.getBoundingRect().right - lastTreeNode.getBoundingRect().left;
                var height = lastTreeNode.getBoundingRect().bottom - lastTreeNode.getBoundingRect().top;
                context.lineWidth = 1;
                context.strokeStyle = 'black';
                context.rect(relativeX, relativeY, width, height);
                context.stroke();
            }
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
         * Objects in node
         */
        protected objects: SchemeObject[] = [];

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
        constructor(parent: null | TreeNode, boundingRect: BoundingRect, objects: SchemeObject[], depth: number)
        {
            this.parent = parent;
            this.boundingRect = boundingRect;
            this.objects = objects;
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
            return this.objects;
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
            return this.objects.length > 0;
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
            this.objects = [];
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
