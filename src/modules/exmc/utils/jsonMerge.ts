export type Merge<A, B> = {
    [K in keyof (A | B)]: (K extends keyof A ? A[K]:B[K]);
};

export default function jsonMerge<A, B>(a: A, b: B): Merge<A, B> {
    for (let i in b) {
        if (!(i in <any>a)) {
            (<any>a)[i] = b[i];
        }
    }
    return <any>a;
}