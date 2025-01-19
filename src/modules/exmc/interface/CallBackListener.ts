export default interface CallBackListener<T, V> {
    subscribe(callback: (arg1: T) => V): ((arg1: T) => V);
    unsubscribe(callback: (arg1: T) => V): ((arg1: T) => V);
}