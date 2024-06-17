export default class MinPriorityQueue<T> {
    private heap: Array<{ priority: number, value: T }>;
    constructor() {
        this.heap = [];
    }

    private swap(i: number, j: number): void {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    private heapifyUp(index: number): void {
        let parent = Math.floor((index - 1) / 2);
        while (index > 0 && this.heap[parent].priority > this.heap[index].priority) {
            this.swap(parent, index);
            index = parent;
            parent = Math.floor((index - 1) / 2);
        }
    }

    private heapifyDown(index: number): void {
        let left = 2 * index + 1;
        let right = 2 * index + 2;
        let smallest = index;
        if (left < this.heap.length && this.heap[left].priority < this.heap[index].priority) {
            smallest = left;
        }
        if (right < this.heap.length && this.heap[right].priority < this.heap[smallest].priority) {
            smallest = right;
        }
        if (smallest !== index) {
            this.swap(smallest, index);
            this.heapifyDown(smallest);
        }
    }

    enqueue(value: T, priority: number): void {
        this.heap.push({ priority, value });
        this.heapifyUp(this.heap.length - 1);
    }

    dequeue(): T {
        if (this.heap.length === 0) throw new Error('Queue is empty');
        const item = this.heap[0];
        this.heap[0] = this.heap[this.heap.length - 1];
        this.heap.pop();
        this.heapifyDown(0);
        return item.value;
    }

    isEmpty(): boolean {
        return this.heap.length === 0;
    }
}
