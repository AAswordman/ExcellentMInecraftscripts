

/**
 * Represents a three-dimensional vector.
 */
class Vector3 {
    /**
     * The down vector, pointing straight down.
     */
    public static readonly down = new Vector3(0, -1, 0);
    /**
     * The forward vector, pointing straight ahead.
     */
    public static readonly forward = new Vector3(0, 0, 1);
    /**
     * The back vector, pointing straight back.
     */
    public static readonly back = new Vector3(0, 0, -1);
    /**
     * The left vector, pointing straight left.
     */
    public static readonly left = new Vector3(-1, 0, 0);
    /**
     * The one vector, with all components set to 1.
     */
    public static readonly one = new Vector3(1, 1, 1);
    /**
     * The right vector, pointing straight right.
     */
    public static readonly right = new Vector3(1, 0, 0);
    /**
     * The up vector, pointing straight up.
     */
    public static readonly up = new Vector3(0, 1, 0);
    /**
     * The zero vector, with all components set to 0.
     */
    public static readonly zero = new Vector3(0, 0, 0);

    /**
     * Creates a new Vector3 instance.
     * @param {number|IVector3} [x] - The x coordinate of the vector.
     * @param {number} [y] - The y coordinate of the vector.
     * @param {number} [z] - The z coordinate of the vector.
     */
    constructor()
    constructor(v: IVector3)
    constructor(x: number, y: number, z: number)
    constructor(a?: any, b?: any, c?: any) {
        if (typeof a === "number" && typeof b === "number" && typeof c === "number") {
            this.x = a;
            this.y = b;
            this.z = c;
        } else if (a === undefined && b === undefined && c === undefined) {
            this.x = 0;
            this.y = 0;
            this.z = 0;
        } else {
            this.x = a.x;
            this.y = a.y;
            this.z = a.z;
        }
    }
    x: number;
    y: number;
    z: number;

    /**
    * Sets the components of the vector.
    * @param {number|IVector3} x - The x coordinate of the vector, or an IVector3 object.
    * @param {number} [y] - The y coordinate of the vector.
    * @param {number} [z] - The z coordinate of the vector.
    * @returns {Vector3} This vector, after the components have been set.
    */
    public set(x: number | IVector3, y?: number, z?: number): Vector3 {
        if (typeof x === 'number') {
            if (typeof y === 'number' && typeof z === 'number') {
                this.x = x;
                this.y = y;
                this.z = z;
            } else {
                this.x = x;
                this.y = x;
                this.z = x;
            }
        } else {
            this.set(x.x, x.y, x.z);
        }
        return this;
    }

    /**
    * Sets the components of the vector to the minimum of the current components and the given values.
    * @param {IVector3|number} x - The x coordinate of the vector, or a number to compare to the current x component.
    * @param {number} [y] - The y coordinate of the vector, or a number to compare to the current y component.
    * @param {number} [z] - The z coordinate of the vector, or a number to compare to the current z component.
    * @returns {Vector3} This vector, after the components have been set.
    */
    public min(x: IVector3 | number, y?: number, z?: number): Vector3 {
        if (typeof x === 'number') {
            if (typeof y === 'number' && typeof z === 'number') {
                this.x = Math.min(this.x, x);
                this.y = Math.min(this.y, y);
                this.z = Math.min(this.z, z);
            } else {
                this.x = Math.min(this.x, x);
                this.y = Math.min(this.y, x);
                this.z = Math.min(this.z, x);
            }
        } else {
            this.min(x.x, x.y, x.z);
        }
        return this;
    }
    /**
     * Adds the given values to the components of the vector.
     * @param {IVector3|number} x - The x coordinate of the vector, or a number to add to the current x component.
     * @param {number} [y] - The y coordinate of the vector, or a number to add to the current y component.
     * @param {number} [z] - The z coordinate of the vector, or a number to add to the current z component.
     * @returns {Vector3} This vector, after the values have been added.
     */
    public add(x: IVector3 | number, y?: number, z?: number): Vector3 {
        if (typeof x === 'number') {
            if (typeof y === 'number' && typeof z === 'number') {
                this.x += x;
                this.y += y;
                this.z += z;
            } else {
                this.x += x;
                this.y += x;
                this.z += x;
            }
        } else {
            this.add(x.x, x.y, x.z);
        }
        return this;
    }
    /**
     * Subtracts the given values from the components of the vector.
     * @param {IVector3|number} x - The x coordinate of the vector, or a number to subtract from the current x component.
     * @param {number} [y] - The y coordinate of the vector, or a number to subtract from the current y component.
     * @param {number} [z] - The z coordinate of the vector, or a number to subtract from the current z component.
     * @returns {Vector3} This vector, after the values have been subtracted.
     */
    public sub(x: IVector3 | number, y?: number, z?: number): Vector3 {
        if (typeof x === 'number') {
            if (typeof y === 'number' && typeof z === 'number') {
                this.x -= x;
                this.y -= y;
                this.z -= z;
            } else {
                this.y -= x;
                this.z -= x;
                this.x -= x;
            }
        } else {
            this.sub(x.x, x.y, x.z);
        }
        return this;
    }
    /**
     * Multiplies the components of the vector by the given values.
     * @param {number|IVector3} x - The x coordinate of the vector, or a number to multiply the current x component by.
     * @param {number} [y] - The y coordinate of the vector, or a number to multiply the current y component by.
     * @param {number} [z] - The z coordinate of the vector, or a number to multiply the current z component by.
     * @returns {Vector3} This vector, after the components have been multiplied.
     */
    public scl(x: number | IVector3, y?: number, z?: number): Vector3 {
        if (typeof x === 'number') {
            if (typeof y === 'number' && typeof z === 'number') {
                this.x *= x;
                this.y *= y;
                this.z *= z;
            } else {
                this.x *= x;
                this.y *= x;
                this.z *= x;
            }
        } else {
            this.scl(x.x, x.y, x.z);
        }
        return this;
    }
    /**
     * Divides the components of the vector by the given values.
     * @param {number|IVector3} x - The x coordinate of the vector, or a number to divide the current x component by.
     * @param {number} [y] - The y coordinate of the vector, or a number to divide the current y component by.
     * @param {number} [z] - The z coordinate of the vector, or a number to divide the current z component by.
     * @returns {Vector3} This vector, after the components have been divided.
     */
    public div(x: number | IVector3, y?: number, z?: number): Vector3 {
        if (typeof x === 'number') {
            if (typeof y === 'number' && typeof z === 'number') {
                this.x /= x;
                this.y /= y;
                this.z /= z;
            } else {
                this.x /= x;
                this.y /= x;
                this.z /= x;
            }
        } else {
            this.div(x.x, x.y, x.z);
        }
        return this;
    }


    /**
     * Calculates the length of the vector.
     * @returns {number} The length of the vector.
     */
    public len(): number {
        return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
    }

    /**
     * Calculates the squared length of the vector.
     * @returns {number} The squared length of the vector.
     */
    public len2(): number {
        return this.x ** 2 + this.y ** 2 + this.z ** 2;
    }

    /**
     * Checks if this vector is equal to another vector.
     * @param {Vector3} other - The other vector to compare to.
     * @returns {boolean} Whether the two vectors are equal.
     */
    public equals(other: Vector3): boolean {
        return this.x.toFixed(2) === other.x.toFixed(2) &&
            this.y.toFixed(2) === other.y.toFixed(2) &&
            this.z.toFixed(2) === other.z.toFixed(2);
    }
    /**
     * 计算两个向量的叉积。
     * 
     * @param other 另一个向量，与当前向量进行叉积计算。
     * @returns 返回一个新的向量，表示两个向量的叉积。
     */
    public crs(other: IVector3): Vector3 {
        return new Vector3(this.y * other.z - this.z * other.y, this.z * other.x - this.x * other.z, this.x * other.y - this.y * other.x);
    }

    /**
     * Calculates the distance between this vector and another vector.
     * @param {Vector3} vec - The other vector to calculate the distance to.
     * @returns {number} The distance between the two vectors.
     */
    public distance(vec: IVector3): number {
        return this.cpy().sub(vec).len();
    }

    /**
     * Converts the vector to a string.
     * @returns {string} The string representation of the vector.
     */
    public toString(): string {
        return `(${this.x}, ${this.y}, ${this.z})`;
    }

    /**
     * Returns the string tag of the vector, which is its string representation.
     * @returns {string} The string representation of the vector.
     */
    [Symbol.toStringTag]() {
        return this.toString();
    }

    /**
     * Floors the components of the vector.
     * @returns {Vector3} This vector, after the components have been floored.
     */
    public floor(): Vector3 {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
        return this;
    }

    /**
     * Rounds the components of the vector.
     * @returns {Vector3} This vector, after the components have been rounded.
     */
    public round(): Vector3 {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        return this;
    }
    /**
     * Ceils the components of the vector.
     * @returns {Vector3} This vector, after the components have been ceiled.
     */
    public ceil(): Vector3 {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        this.z = Math.ceil(this.z);
        return this;
    }

    /**
     * Takes the absolute value of the components of the vector.
     * @returns {Vector3} This vector, after the components have been taken absolute.
     */
    public abs(): Vector3 {
        this.x = Math.abs(this.x);
        this.y = Math.abs(this.y);
        this.z = Math.abs(this.z);
        return this;
    }



    /**
     * Normalizes the vector.
     * @returns {Vector3} This vector, after it has been normalized.
     */
    public normalize(): Vector3 {
        this.div(this.len());
        return this;
    }
    /**
     * Clones the vector.
     * @returns {Vector3} A new vector with the same components as this vector.
     */
    public cpy(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    /**
     * Returns the components of the vector as an array.
     * @returns {number[]} An array containing the x, y, and z components of the vector.
     */
    public toArray(): number[] {
        return [this.x, this.y, this.z];
    }

    /**
     * Calculates the vertical rotation angle of the vector relative to the x-z plane.
     * The angle ranges from -90 to 90 degrees, with the y-axis pointing vertically upwards, in the left-hand coordinate system.
     * @returns {number} The vertical rotation angle of the vector.
     */
    public rotateAngleY(): number {
        let [x, y, z] = [this.x, this.y, this.z];
        let angle = Math.atan2(y, Math.sqrt(x * x + z * z));
        return angle * 180 / Math.PI;
    }
    /**
    * Calculates the horizontal rotation angle of the vector relative to the x-y vertical plane.
    * The angle ranges from 0 to 360 degrees, with the y-axis pointing vertically upwards, in the left-hand coordinate system.
    * @returns {number} The horizontal rotation angle of the vector.
    */
    public rotateAngleX(): number {
        let [x, y, z] = [this.x, this.y, this.z];
        let angle = Math.atan2(x, z);
        if (angle < 0) {
            angle += 2 * Math.PI;
        }
        return angle * 180 / Math.PI;
    }

}

interface IVector3 {
    x: number;
    y: number;
    z: number;
}


 class ListNode<T> {
    value: T;
    next: ListNode<T> | null;

    constructor(value: T) {
        this.value = value;
        this.next = null;
    }
}

 class LinkedList<T> {
    private head: ListNode<T> | null;
    private tail: ListNode<T> | null;
    public size: number;

    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    // 在链表末尾添加一个元素
    append(value: T): void {
        const newNode = new ListNode(value);
        if (this.head === null) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail!.next = newNode;
            this.tail = newNode;
        }
        this.size++;
    }

    // 在链表头部添加一个元素
    prepend(value: T): void {
        const newNode = new ListNode(value);
        newNode.next = this.head;
        this.head = newNode;
        if (this.tail === null) {
            this.tail = newNode;
        }
        this.size++;
    }

    // 删除第一个匹配的元素
    delete(value: T): boolean {
        if (this.head === null) return false;

        if (this.head.value === value) {
            this.head = this.head.next;
            if (this.head === null) {
                this.tail = null;
            }
            this.size--;
            return true;
        }

        let current = this.head;
        while (current.next !== null) {
            if (current.next.value === value) {
                current.next = current.next.next;
                if (current.next === null) {
                    this.tail = current;
                }
                this.size--;
                return true;
            }
            current = current.next;
        }

        return false;
    }

    // 删除头部元素
    deleteHead(): T | null {
        if (this.head === null) return null;

        const value = this.head.value;
        this.head = this.head.next;
        if (this.head === null) {
            this.tail = null;
        }
        this.size--;
        return value;
    }

    // 删除尾部元素
    deleteTail(): T | null {
        if (this.head === null) return null;

        if (this.head === this.tail) {
            const value = this.head.value;
            this.head = null;
            this.tail = null;
            this.size--;
            return value;
        }

        let current = this.head;
        while (current.next !== this.tail && current.next !== null) {
            current = current.next;
        }

        const value = this.tail!.value;
        this.tail = current;
        this.tail.next = null;
        this.size--;
        return value;
    }

    // 查找元素
    find(value: T): ListNode<T> | null {
        let current = this.head;
        while (current !== null) {
            if (current.value === value) {
                return current;
            }
            current = current.next;
        }
        return null;
    }

    // 获取链表大小
    getSize(): number {
        return this.size;
    }

    // 清空链表
    clear(): void {
        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    // 转换为数组
    toArray(): T[] {
        const array: T[] = [];
        let current = this.head;
        while (current !== null) {
            array.push(current.value);
            current = current.next;
        }
        return array;
    }

    // 打印链表
    print(): void {
        console.log(this.toArray().join(' -> '));
    }

    // 插入元素并实时排序
    insertSorted(value: T, compareFn: (a: T, b: T) => number): void {
        const newNode = new ListNode(value);

        if (this.head === null || compareFn(this.head.value, value) >= 0) {
            newNode.next = this.head;
            this.head = newNode;
            if (this.tail === null) {
                this.tail = newNode;
            }
        } else {
            let current = this.head;
            while (current.next !== null && compareFn(current.next.value, value) < 0) {
                current = current.next;
            }
            newNode.next = current.next;
            current.next = newNode;
            if (newNode.next === null) {
                this.tail = newNode;
            }
        }

        this.size++;
    }

    // 对链表进行排序
    sort(compareFn: (a: T, b: T) => number): void {
        const sortedArray = this.toArray().sort(compareFn);
        this.clear();
        for (const value of sortedArray) {
            this.append(value);
        }
    }

    // 获取链表的最后一个节点
    getTail(): ListNode<T> | null {
        return this.tail;
    }
}

// 示例用法
const list = new LinkedList<number>();

list.print(); // 输出: 3 -> 1 -> 2

// 使用插入排序
const compareNumbers = (a: number, b: number) => a - b;
list.insertSorted(4, compareNumbers);
list.insertSorted(2, compareNumbers);
list.insertSorted(3, compareNumbers);
list.deleteHead();
list.insertSorted(1, compareNumbers);
list.print(); // 输出: 1 -> 2 -> 3 -> 4

// 使用链表排序
list.sort(compareNumbers);
list.print(); // 输出: 1 -> 2 -> 3 -> 4

console.log(list.deleteHead()); // 输出: 1
list.print(); // 输出: 2 -> 3 -> 4

console.log(list.find(2)); // 输出: ListNode { value: 2, next: ListNode { value: 3, next: ListNode { value: 4, next: null } } }
console.log(list.delete(2)); // 输出: true
list.print(); // 输出: 3 -> 4

console.log(list.getSize()); // 输出: 2
list.clear();
console.log(list.getSize()); // 输出: 0

// // 使用字符串的示例
// const stringList = new LinkedList<string>();
// stringList.append("banana");
// stringList.append("apple");
// stringList.append("cherry");

// const compareStrings = (a: string, b: string) => a.localeCompare(b);
// stringList.sort(compareStrings);
// stringList.print(); // 输出: apple -> banana -> cherry
// let queue: LinkedList<[Vector3, number]> = new LinkedList();
// let nextQueue: LinkedList<[Vector3, number]> = new LinkedList();

// // 初始化队列，从中心点开始
// nextQueue.append([new Vector3().cpy().set(0, 0, 0), 0]);

// let currentLen = 0;
// let num = 0;
// while (currentLen < 10) {
//     console.warn(currentLen)
//     while (queue.size > 0) {
//         const current = queue.deleteHead()!;
//         let len = current[1];
//         if (len > currentLen) {
//             currentLen = len;
//         }
//         // 处理当前点
//         // 获取当前点的所有邻居
//         const neighbors = [
//             current[0].cpy().add(1, 0, 0),
//             current[0].cpy().add(-1, 0, 0),
//             current[0].cpy().add(0, 1, 0),
//             current[0].cpy().add(0, -1, 0),
//             current[0].cpy().add(0, 0, 1),
//             current[0].cpy().add(0, 0, -1)
//         ];

//         // 将未访问过的邻居加入队列
//         for (const neighbor of neighbors) {
//             let len = neighbor.len();
//             if (currentLen < len && len <= 50) {
//                 nextQueue.insertSorted([neighbor, len], (a, b) => a[1] - b[1]);
//             }
//         }

//     }
//     if (currentLen == null) break;
//     queue = nextQueue;
//     nextQueue = new LinkedList();
//     currentLen = queue.getTail()!.value[1];
//     console.log(currentLen)
// }
