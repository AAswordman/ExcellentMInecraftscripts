// 用于在 worldLoad 后延迟初始化静态属性
import { world } from "@minecraft/server";

/**
 * 直接装饰静态变量，worldLoad后自动赋值
 * 用法：@lateinit(() => world.gameRules) static gamerules: GameRules;
 */
export default function lateinit(initializer: () => any) {
    return function (target: any, propertyKey: string) {
        world.afterEvents.worldLoad.subscribe(() => {
            target[propertyKey] = initializer()
        })
    }
}