
import Random from './Random.js';
export default class ExSystem {

    public static idMap = new Map<any, number>();
    public static getId(x: any) {
        if (this.idMap.has(x)) {
            return this.idMap.get(x);
        } else {
            this.idMap.set(x, Math.floor(Math.random() * Random.MAX_VALUE));
            return this.idMap.get(x);
        }
    }

    static chineseCharMatcher = /^([\u4E00-\u9FA5])*$/;
    public static hasChineseCharacter(str: string) {
        return this.chineseCharMatcher.test(str);
    }
    public static keys(obj: any) {
        const keys = Reflect.ownKeys(obj);
        let i = obj.__proto__;
        while (i) {
            for(let key of Reflect.ownKeys(i)){
                keys.push(key);
            }
            i = i.__proto__;
        }
        return keys;
    }
}