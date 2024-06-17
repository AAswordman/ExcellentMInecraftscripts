import MinPriorityQueue from "../queue/MinPriorityQueue.js";

export class KDPoint {
    coordinates: number[];

    constructor(...points: number[]) {
        this.coordinates = points;
    }

    equals(other: KDPoint): boolean {
        return this.coordinates.every((e, i) => e === other.coordinates[i]);
    }
}

export class KDNode {
    point: KDPoint;
    left: KDNode | undefined;
    right: KDNode | undefined;
    parent: KDNode | undefined; // 添加父节点引用
    axis: number;

    constructor(point: KDPoint, axis: number, parent: KDNode | undefined = undefined) {
        this.point = point;
        this.left = undefined;
        this.right = undefined;
        this.axis = axis;
        this.parent = parent; // 初始化父节点引用
    }
}

export default class KDTree {
    root: KDNode | undefined;
    k = 0;
    /**
     * Initializes a new instance of the KDTree class.
     * @param {number} dim - The dimensionality of the points to be stored in the tree.
     */
    constructor(dim: number) {
        this.root = undefined;
        this.k = dim;
    }
    /**
     * Inserts a point into the KDTree.
     * @param {KDPoint} point - The point to insert.
     */
    // 插入节点
    insert(point: KDPoint): void {
        this.root = this._insert(this.root, point, 0);
    }
    /**
       * Private method to recursively insert a point into the tree.
       * @private
       * @param {KDNode | undefined} node - The current node.
       * @param {KDPoint} point - The point to insert.
       * @param {number} depth - The current depth in the tree.
       * @returns {KDNode} - The new node after insertion.
       */
    private _insert(node: KDNode | undefined, point: KDPoint, depth: number): KDNode {
        if (node === undefined) {
            let newNode = new KDNode(point, depth % this.k);
            this.nodes.add(newNode);
            return newNode;
        }

        const axis = node.axis;
        if (point.coordinates[axis] < node.point.coordinates[axis]) {
            node.left = this._insert(node.left, point, depth + 1);
        } else {
            node.right = this._insert(node.right, point, depth + 1);
        }

        return node;
    }
    private nodes: Set<KDNode> = new Set();
    /**
    * Builds the KDTree from an array of points.
    * @param {KDPoint[]} points - Array of points to build the tree from.
    */
    build(points: KDPoint[]): void {
        this.nodes.clear();
        this.k = points[0].coordinates.length;
        this.root = this._buildTree(points, 0);
    }
    /**
     * Rebuilds the KDTree from the stored points.
     */
    rebuild(): void {
        // Clear the current tree
        this.root = undefined;
        // Rebuild using the current list of points (assuming you maintain such a list)
        if (this.nodes && this.nodes.size > 0) {
            this.build(this.getPoints());
        }
    }
    /**
     * Retrieves all points currently stored in the tree.
     * @returns {KDPoint[]} - An array of points.
     */
    getPoints() {
        return Array.from(this.nodes.values()).map(e => e.point);
    }

    /**
     * Retrieves all nodes currently stored in the tree.
     * @returns {Set<KDNode>} - A set of KDNodes.
     */
    getNodes() {
        return this.nodes;
    }

    private _buildTree(points: KDPoint[], depth: number, parent?: KDNode): KDNode | undefined {
        if (points.length === 0) return undefined;
        // 计算当前维度上的方差，决定分割维度
        const [splitDimension, splitIndex] = this._chooseSplitDimension(points, depth);
        // console.log("Split dimension:", splitDimension);
        // 根据选定的维度排序
        points.sort((a, b) => (a.coordinates)[splitDimension] - (b.coordinates)[splitDimension]);

        const medianIndex = splitIndex; // 使用方差最大位置作为分割点
        const node = new KDNode(points[medianIndex], splitDimension, parent);
        node.left = this._buildTree(points.slice(0, medianIndex), depth + 1, node);
        node.right = this._buildTree(points.slice(medianIndex + 1), depth + 1, node);
        this.nodes.add(node);
        return node;
    }
    /**
    * Private method to choose the split dimension and index for building the tree.
    * @private
    * @param {KDPoint[]} points - Points to analyze for splitting.
    * @param {number} depth - Current depth in the tree.
    * @returns {[number, number]} - Tuple containing the chosen dimension and index.
    */
    private _chooseSplitDimension(points: KDPoint[], depth: number): [number, number] {
        let maxVariance = -1;
        let splitDimension = 0;
        let splitIndex = 0;

        // 假设只有x和y两个维度，根据深度选择候选维度
        for (let dim = 0; dim < this.k; dim++) {
            const variance = this._calculateVariance(points, dim);
            if (variance > maxVariance) {
                maxVariance = variance;
                splitDimension = dim;
                splitIndex = Math.floor(points.length / 2);
            }
        }

        return [splitDimension, splitIndex];
    }
    /**
    * Calculates the variance of points along a given dimension.
    * @private
    * @param {KDPoint[]} points - Points to calculate variance for.
    * @param {number} dimension - The dimension to calculate variance on.
    * @returns {number} - The calculated variance.
    */
    private _calculateVariance(points: KDPoint[], dimension: number): number {
        const n = points.length;
        if (n === 0) return 0;

        const sum = points.reduce((acc, point) => acc + point.coordinates[dimension], 0);
        const mean = sum / n;

        const squareSum = points.reduce((acc, point) => acc + Math.pow((point).coordinates[dimension] - mean, 2), 0);
        return squareSum / n;
    }
    // 修正后的MinPriorityQueue类定义保持不变，这里不再重复展示

    /**
     * Searches for the nearest neighbor of a query point using the Best-Bin-First algorithm.
     * @param {KDPoint} queryPoint - The point to find the nearest neighbor for.
     * @returns {KDPoint | undefined} - The nearest neighbor or undefined if not found.
     */
    nearestNeighborBBF(queryPoint: KDPoint): KDPoint | undefined {
        if (!this.root) return undefined;
        const priorityQueue = new MinPriorityQueue<{ node: KDNode, dist: number }>();

        // 初始化时计算根节点到查询点的距离作为优先级
        let priority = manhattanDistance(queryPoint, this.root.point);
        priorityQueue.enqueue({ node: this.root!, dist: priority }, priority);

        let bestNode: KDNode | undefined = undefined;
        while (!priorityQueue.isEmpty()) {
            const { node, dist } = priorityQueue.dequeue();
            if (bestNode !== undefined && dist > manhattanDistance(queryPoint, bestNode.point) + 2) break; // 如果当前节点距离大于已找到的最佳距离，则停止搜索

            if (!bestNode || manhattanDistance(bestNode.point, queryPoint) > dist) { // 更新最佳节点
                bestNode = node;
            }

            const axis = node.axis;
            const compare = queryPoint.coordinates[axis] < node.point.coordinates[axis];
            const nextChild = compare ? node.left : node.right;
            const oppositeChild = compare ? node.right : node.left;

            if (nextChild !== undefined) {
                // 确保使用到nextChild的实际距离作为优先级
                priority = manhattanDistance(queryPoint, nextChild.point);
                priorityQueue.enqueue({ node: nextChild, dist: priority }, priority);
            }
            if (oppositeChild !== undefined) {
                // 对于oppositeChild，只有当父节点距离小于当前最小距离才加入队列，且使用实际距离作为优先级
                priority = manhattanDistance(queryPoint, oppositeChild.point);
                priorityQueue.enqueue({ node: oppositeChild, dist: priority }, priority);
            }
        }

        return bestNode?.point;
    }
    /**
     * Searches for the nearest neighbor of a query point.
     * @param {KDPoint} queryPoint - The point to find the nearest neighbor for.
     * @returns {KDPoint | undefined} - The nearest neighbor or undefined if not found.
     */
    nearestNeighbor(queryPoint: KDPoint) {
        return this._nearestNeighbor(this.root, queryPoint);
    }
    /**
     * Private method to recursively search for the nearest neighbor.
     * @private
     * @param {KDNode | undefined} node - The current node in the search.
     * @param {KDPoint} queryPoint - The query point.
     * @returns {KDPoint | undefined} - The nearest neighbor or undefined if not found.
     */
    private _nearestNeighbor(node: KDNode | undefined, queryPoint: KDPoint): KDPoint | undefined {
        if (node === undefined) return undefined;

        const dist = manhattanDistance(queryPoint, node.point);

        const axis = node.axis;
        const nextBranch = queryPoint.coordinates[axis] < node.point.coordinates[axis] ? node.left : node.right;
        const otherBranch = nextBranch === node.left ? node.right : node.left;

        let nearestInNext = this._nearestNeighbor(nextBranch, queryPoint);
        if (!nearestInNext || manhattanDistance(nearestInNext, queryPoint) > dist) nearestInNext = node.point;

        let curDist = manhattanDistance(nearestInNext, queryPoint);
        if (Math.abs(node.point.coordinates[axis] - queryPoint.coordinates[axis]) < curDist) {
            let nearestInOther = this._nearestNeighbor(otherBranch, queryPoint);
            if (!nearestInOther || manhattanDistance(nearestInOther, queryPoint) > curDist) return nearestInNext;
            return nearestInOther;
        }
        return nearestInNext;
    }
    /**
     * Conducts a range search within a specified radius of a center point.
     * @param {KDPoint} center - The center point for the search.
     * @param {number} radius - The radius of the search.
     * @returns {KDPoint[]} - An array of points within the range.
     */
    rangeSearch(center: KDPoint, radius: number): KDPoint[] {
        const result: KDPoint[] = [];
        this._rangeSearch(this.root, center, radius, result);
        return result;
    }
    /**
     * Private method to recursively conduct a range search.
     * @private
     * @param {KDNode | undefined} node - The current node in the search.
     * @param {KDPoint} center - The center point for the search.
     * @param {number} radius - The radius of the search.
     * @param {KDPoint[]} result - Array to collect points within the range.
     */
    private _rangeSearch(node: KDNode | undefined, center: KDPoint, radius: number, result: KDPoint[]): void {
        if (node === undefined) return;

        const axis = node.axis;
        const dist = Math.abs(node.point.coordinates[axis] - center.coordinates[axis]);

        if (dist <= radius) {
            if (manhattanDistance(node.point, center) <= radius) result.push(node.point);
            this._rangeSearch(node.left, center, radius, result);
            this._rangeSearch(node.right, center, radius, result);
        } else {
            const nextBranch = center.coordinates[axis] < node.point.coordinates[axis] ? node.left : node.right;
            this._rangeSearch(nextBranch, center, radius, result);
        }
    }
    private findMinNode(node: KDNode): KDNode {
        while (node.left !== undefined) {
            node = node.left;
        }
        return node;
    }
    /**
     * Deletes a point from the KDTree.
     * @param {KDPoint} point - The point to delete.
     */
    delete(point: KDPoint): void {
        this.root = this._delete(this.root, point);
    }
    /**
     * Private method to recursively delete a point from the tree.
     * @private
     * @param {KDNode | undefined} node - The current node.
     * @param {KDPoint} point - The point to delete.
     * @returns {KDNode | undefined} - The node after deletion.
     */
    private _delete(node: KDNode | undefined, point: KDPoint): KDNode | undefined {
        if (node === undefined) return undefined;

        if (point.coordinates[node.axis] < node.point.coordinates[node.axis]) {
            node.left = this._delete(node.left, point);
        } else if (point.coordinates[node.axis] > node.point.coordinates[node.axis]) {
            node.right = this._delete(node.right, point);
        } else { // Node to delete found
            if (node.left === undefined && node.right === undefined) { // No children
                return undefined;
            } else if (node.left === undefined) { // One right child
                this.nodes.delete(node.right!);
                return node.right;
            } else if (node.right === undefined) { // One left child
                this.nodes.delete(node.left!);
                return node.left;
            } else { // Two children, find and replace with inorder successor
                const minNode = this.findMinNode(node.right);
                node.point = minNode.point;
                node.right = this._delete(node.right, minNode.point);
            }
        }
        return node;
    }
    /**
     * Prints the KDTree structure to the console.
     * @param {KDNode | undefined} node - The current node to start printing from.
     * @param {number} depth - The current depth for indentation.
     */
    printTree(node?: KDNode, depth = 0): void {
        if (!node) node = this.root;
        if (node) {
            console.log(`${' '.repeat(depth * 4)}Depth: ${depth}, Point: (${node.point.coordinates}`);
            if (node.left) this.printTree(node.left, depth + 1);
            if (node.right) this.printTree(node.right, depth + 1);
        }
    }
}

//曼哈顿距离
function manhattanDistance(a: KDPoint, b: KDPoint): number {
    return a.coordinates.reduce((acc, curr, i) => acc + Math.abs(curr - b.coordinates[i]), 0);
}