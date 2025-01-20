(() => {
    class BidirectionalMap<K, V> extends Map<K | V, V | K> {
        override has<T extends (K | V)>(key: T): boolean {
            return super.has(key);
        }
        override get<T extends (K | V)>(key: T): (T extends K ? V : K) | undefined {
            return super.get(key) as any;
        }
        override set(key: K | V, value: K | V): this {
            super.set(key, value);
            super.set(value, key);
            return this;
        }
        override delete(key: K | V): boolean {
            if (!this.has(key)) return false;

            const value = this.get(key);
            if (value === undefined) return false;

            super.delete(key);
            super.delete(value);

            return true;
        }
    }

    const bidirectionalMap = new BidirectionalMap<number, string>();
    bidirectionalMap.set(1, 'one');
    console.log(bidirectionalMap.get(1)); // 输出 'one'
    console.log(bidirectionalMap.get('one')); // 输出 1
    bidirectionalMap.delete(1);
    console.log(bidirectionalMap.has(1)); // 输出 false
    console.log(bidirectionalMap.has('one')); // 输出 false
})()