import ExEventManager from "../../interface/ExEventManager.js";
import ExSystem from "../../utils/ExSystem.js";
import { ExEventNames, ExOtherEventNames } from './events.js';

export function eventDecoratorFactory<T extends Object>(manager: ExEventManager, target: T) {
    for (let i of ExSystem.keys(target)) {
        const v = Reflect.getMetadata("eventName", target, i);
        if (v) {
            const condition: ((obj: T, e: any) => boolean)[] = Reflect.getMetadata("eventCondition", target, i);
            for (let index = 0; index < v.length; index++) {
                if (condition[index]) {
                    manager.register(v[index], (e) => {
                        if (condition[index](target, e)) {
                            (target as any)[i].call(target, e);
                        }
                    });
                } else {
                    manager.register(v[index], (target as any)[i].bind(target));
                }
            }
        }
    }
}


export function registerEvent<T>(eventName: keyof (typeof ExEventNames & typeof ExOtherEventNames), condition?: (obj: T, e: any) => boolean) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        let v1 = Reflect.getMetadata("eventName", target, propertyName), v2 = Reflect.getMetadata("eventCondition", target, propertyName);
        if (!v1) {
            v1 = [], v2 = [];
            Reflect.defineMetadata("eventName", v1, target, propertyName);
            Reflect.defineMetadata("eventCondition", v2, target, propertyName);
        }
        v1.push(eventName);
        v2.push(condition);
    }
}
