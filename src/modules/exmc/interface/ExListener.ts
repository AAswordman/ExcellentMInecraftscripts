export default interface ExListener<T> {
    subscribe: (callback: (arg: T) => void) => (((arg1: T) => void));
    unsubscribe: (callback: (arg: T) => void) => (((arg1: T) => void));
}