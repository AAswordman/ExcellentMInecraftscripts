
import ExServerTickDelayTask from '../server/ExServerTickDelayTask.js';
import Random from './Random.js';
import TickDelayTask from './TickDelayTask.js';
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

    static chineseCharMatcher = /([\u4E00-\u9FA5])+/;
    public static hasChineseCharacter(str: string) {
        return this.chineseCharMatcher.test(str);
    }
    public static keys(obj: any) {
        const keys = Reflect.ownKeys(obj);
        let i = obj.__proto__;
        while (i) {
            for (let key of Reflect.ownKeys(i)) {
                keys.push(key);
            }
            i = i.__proto__;
        }
        return keys;
    }
    static parseObj(obj: any) {
        let k = ExSystem.keys(obj);
        let res = '{\n';
        for (const key of k) {
            const val = obj[key];
            if (val === null) (res += `${String(key)}: null\n`);
            if (typeof val != 'object') (res += `${String(key)}: ${typeof val === 'number' ? val : val}\n`);
            else (res += `${String(key)}: {...}\n`);
        }
        return res + '}';
    }
    public static isServer(){
        return true;
    }

    public static tickTask(tasks:()=>void):TickDelayTask{
        if(this.isServer()){
            return new ExServerTickDelayTask(tasks);
        }else{
            return new ExServerTickDelayTask(tasks);
        }
    }
}