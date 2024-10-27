export class ListNode<T> {
    value: T;
    next: ListNode<T> | null;

    constructor(value: T) {
        this.value = value;
        this.next = null;
    }
}

export default class LinkedList<T> {
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