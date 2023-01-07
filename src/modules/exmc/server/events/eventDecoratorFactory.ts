import ExEventManager from "../../interface/ExEventManager.js";
import ExSystem from "../../utils/ExSystem.js";

export function eventDecoratorFactory(manager: ExEventManager, target: any) {
    for (let i of ExSystem.keys(target)) {
        const v = Reflect.getMetadata("eventName", target, i);
        if (v) {
            manager.register(v, target[i].bind(target));
        }
    }
}

export function registerEvent(eventName: string) {
    return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
        Reflect.defineMetadata("eventName", eventName, target, propertyName);
    }
}
