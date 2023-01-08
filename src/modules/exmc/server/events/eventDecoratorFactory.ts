import ExEventManager from "../../interface/ExEventManager.js";
import ExSystem from "../../utils/ExSystem.js";

export function eventDecoratorFactory<T extends Object>(manager: ExEventManager, target: T) {
    for (let i of ExSystem.keys(target)) {
        const v = Reflect.getMetadata("eventName", target, i);
        if (v) {
            const condition: ((obj: T, e: any) => boolean) | undefined = Reflect.getMetadata("eventCondition", target, i);
            if (condition) {
                manager.register(v, (e) => {
                    if (condition(target, e)) {
                        (target as any)[i].call(target, e);
                    }
                });
            } else {
                manager.register(v, (target as any)[i].bind(target));
            }
        }
    }
}
export function eventDecoratorDispose<T extends Object>(manager: ExEventManager, target: T) {
    for (let i of ExSystem.keys(target)) {
        const v = Reflect.getMetadata("eventName", target, i);
        if (v) {
            manager.cancelAll();
        }
    }
}

export function registerEvent<T>(eventName: string, condition?: (obj: T, e: any) => boolean) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata("eventName", eventName, target, propertyName);
        Reflect.defineMetadata("eventCondition", condition, target, propertyName);
    }
}
