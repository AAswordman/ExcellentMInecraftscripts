export function zeroIfNaN(i: number | string) {
    const s = (typeof i === "string" ? parseFloat(i) : i);
    return isNaN(s) ? 0 : s;
}

export function falseIfError<T>(func: () => T) {
    try {
        return func();
    } catch (err) {
        return false;
    }
}
export function undefIfError<T>(func: () => T) {
    try {
        return func();
    } catch (err) {
        return undefined;
    }
}


export type ExTend<T> = Menu extends (infer I)[] ?
    (I extends object ? I & { active: boolean } : I)[] :
    never
export type AlsoInstanceType<T extends { prototype: any }> =
    T["prototype"];
