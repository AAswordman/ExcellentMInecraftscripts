/*
 * 原版接口
 */
import * as server from "@minecraft/server";
import ExErrorQueue from "../exmc/server/ExErrorQueue.js";
/**
 * * 定义JSON值类型, 可以是字符串、布尔值、数字、JSON对象、JSON数组
 */
export type JSONValue = string | boolean | number | JSONObject | JSONArray;
/**
 * * 定义JSON对象, 键值对的值可以是JSON值类型
 */
export interface JSONObject { [key: string]: JSONValue };
/**
 * * 定义JSON数组, 数组中的元素可以是JSON值类型
 */
export interface JSONArray extends Array<JSONValue> { };
/**
 * * 定义游戏对象类型, 可以是实体、方块、玩家、维度或物品堆
 */
export type GameObject = server.Entity | server.Block | server.Player | server.Dimension | server.ItemStack | server.Container | server.RawMessage;
/**
 * * 定义传输数据类型, 可以是JSON值、服务器实体、方块、玩家、维度、物品堆或它们的数组
 */
export type TransmissionDataType = TransmissionDataType[] | JSONValue | GameObject | undefined | void | RemoteCtrlObject | SignType;
/**
 * * 定义一个导出函数类型, 它可以接受一个或多个TransmissionDataType类型的参数, 并返回一个TransmissionDataType类型的值。
 */
export type ExportFunctionType = (...para: (TransmissionDataType)[]) => TransmissionDataType;

export interface RemoteCtrlObject {
    __remote: true;
}


/**
 * * 从函数类型T中提取参数类型。
 * 
 * * 如果函数类型T可以被...para: (infer P)所匹配, 那么 P 就是参数类型, 否则返回 never。
*/
type ExportFunctionPara<T extends (...args: any) => any> = (T extends ((...para: (infer P)) => TransmissionDataType) ? P : never);


export type ExportPromiseSetter<T extends { [K in keyof T]: T[K] extends (...para: any) => any ? (ExportFunctionPara<T[K]> extends TransmissionDataType ? T[K] : never) : T[K] }> =
    { [K in keyof T]: T[K] extends (...para: any[]) => any ? (T[K] extends (...args: any[]) => any ? ExportFunctionTypeTrans<T[K]> : any) : Promise<T[K]> }
/**
 * * 根据给定的函数类型T, 创建一个新的函数类型。
 * 
 * * 新的函数类型可以接受与 T 相同类型的参数, 并返回一个Promise, 其中包含T的返回值类型。
 */
type ExportFunctionTypeTrans<T extends (...args: any) => any> =
    (...para: (T extends ((...para: (infer P)) => TransmissionDataType) ? P : never)) => (ReturnType<T> extends { [K in keyof T]: T[K] extends (...para: any) => any ? (ExportFunctionPara<T[K]> extends TransmissionDataType ? T[K] : never) : T[K] }
        ? Promise<ExportPromiseSetter<ReturnType<T>>> : Promise<ReturnType<T>>);

export class SignType {
    constructor(public name: string, public transName: string) {

    }
    equals(sign: SignType) {
        return this.name == sign.name;
    }
}

export const SIGN = {
    TypeGetterSign: new SignType("TypeGetterSign", "sign<tg>"),
    FunctionCallSign: new SignType("FunctionCallSign", "sign<fc>"),
    VarAddressGetterSign: new SignType("VarAddressGetterSign", "sign<vag>"),
    IsFunctionSign: new SignType("IsFunctionSign", "sign<isf>"),
    IsNotFunctionSign: new SignType("IsNotFunctionSign", "sign<isnf>")
}

function keys(obj: any) {
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

/**
 * * 定义一个事件监听器接口, 用于订阅和取消事件监
 */
interface EventListener<T> {
    /**
     * * 订阅事件, 当事件触发时调用指定的回调函数
     * 
     * @param {(arg: T) => void} [callback] 回调函数
     * 
     * @returns {void}
     */
    subscribe: (callback: (arg: T) => void) => void;
    /**
     * * 取消对事件的订阅, 不再接收该事件的回调函数
     * 
     * @param {(arg: T) => void} [callback] 回调函数
     * 
     * @returns 
     */
    unsubscribe: (callback: (arg: T) => void) => void;
};
/**
 * * 定义导出函数联合类型, 包含导出ID和其他未知键值对
 */
export interface ExportFunctionUnion {
    /**
     * * 导出函数的唯一标识符, 用于在导出函数列表中识别该函数
     */
    exportId: string;
};
/**
 * * 定义脚本消息的接口
 * 
 * * 用于标准化脚本执行时的消息格式
 */
export interface ScriptMessage {
    /**
     * * 标记消息来源的ID
     */
    id: string;
    /**
     * * 消息的文本内容
     */
    message: string;
    /**
     * * 可选的源实体, 用于指示消息的发送者
     */
    sourceEntity?: server.Entity;
};


/**
 * * 创建一个 Promise, 该 Promise 在指定事件发生时解析
 * 
 * @param {EventListener<T>} [lis] 事件监听器对象, 用于订阅和取消订阅事件
 * 
 * @param {number} [timeout] 超时时间, 默认为200毫秒
 * 
 * @param {(e: T) => boolean} [filter] 过滤函数, 用于判断事件是否满足条件
 * 
 * @returns {Promise<T>} 返回一个Promise, 当满足条件的事件发生时解析, 否则在超时后拒绝
 */
function eventGetter<T>(lis: EventListener<T>, timeout: number = 20 * 10, filter: ((e: T) => boolean)): Promise<T> {
    return new Promise<T>(
        (resolve, reject) => {
            /**
             * * 定义过滤函数, 当事件满足条件时, 取消订阅并返回事件
             * 
             * @param {T} [e] 事件对象
             */
            const f = (e: T) => {
                if (filter(e)) {
                    lis.unsubscribe(f);
                    resolve(e);
                }
            }
            // 订阅事件
            lis.subscribe(f);
            // 设置超时, 如果超时未触发事件, 则取消订阅并拒绝 Promise
            server.system.runTimeout(
                () => {
                    lis.unsubscribe(f);
                    reject(`Timeout after ${timeout}ms`);
                },
                timeout
            );
        }
    );
};
/**
 * * 生成指定范围内的随机整数
 * 
 * @param {number} min - 范围的最小值（包含在内）
 * 
 * @param {number} max - 范围的最大值（包含在内）
 * 
 * @returns {number} 返回 min 和 max 之间的一个随机整数, 包括 min 和 max
 */
function randomFloor(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
};
/**
 * * 生成符合规范的简化序列号
 * 
 * @returns {string} - 返回一个基于当前时间戳和随机数的简化序列号
 */
function BriefID(): string {
    /**
     * * 获取当前时间戳的后16位作为时间部分
     */
    const timePart = (server.system.currentTick & 0xFFFF).toString(16).padStart(4, '0').toUpperCase();
    /**
     * * 获取一个随机数作为随机部分
     */
    const randomPart = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0').toUpperCase();
    /**
     * * 计算时间部分和随机部分之间的差值
     */
    const difference = (parseInt(randomPart, 16) - parseInt(timePart, 16) + 0x10000) % 0x10000;
    /**
     * * 将差值转换为4位十六进制字符串
     */
    const differencePart = difference.toString(16).padStart(4, '0').toUpperCase();
    // 拼接各部分以形成完整的ID字符串
    return `${randomPart}-${differencePart}-${timePart}`;
};
/**
 * * 定义了一个协议拦截器类, 用于处理函数调用前后的一些自定义逻辑
 */
export class ProtocolInterceptors {
    /**
     * * 当函数被调用时触发, 执行具体的函数并返回结果
     * 
     * @param {ExportFunctionType} [func] 要被调用的函数
     * 
     * @param {string} [name] 函数名
     * 
     * @param {TransmissionDataType[]} [parameters] 函数参数列表
     * 
     * @returns {Promise<TransmissionDataType>} - 返回函数执行的结果
     */
    onCalled(func: ExportFunctionType, name: string, parameters: TransmissionDataType[]): TransmissionDataType {
        return func(...parameters);
    };
    /**
     * * 在调用函数之前触发, 可以用于修改函数参数或执行一些前置处理
     * 
     * @param callback 调用函数的回调
     * 
     * @param {string} functionName 函数名
     * 
     * @param {TransmissionDataType[]} parameters 函数参数列表
     * 
     * @param {number} timeout 超时时间, 默认为200秒
     * 
     * @param {server.Entity | server.Player | undefined} source 调用源, 可以是玩家或实体
     * 
     * @returns {Promise<TransmissionDataType[]>} 返回回调执行的结果
     */
    onCalling(callback: (functionName: string, parameters: TransmissionDataType[], timeout: number, source?: server.Player | server.Entity) => Promise<TransmissionDataType[]>, functionName: string, parameters: TransmissionDataType[], timeout: number, source?: server.Player | server.Entity): Promise<TransmissionDataType[]> {
        return callback(functionName, parameters, timeout, source);
    };
};
/**
 * * 统一推送协议
 */
export default class BridgeProtocol {
    /**
     * * 协议信息
     */
    private protocolMessage = {
        /**
         * * 协议版本
         */
        protocolVersion: "v1.0.4.24.11.15",
        /**
         * * 架构作者
         */
        architectureAuthor: "aa剑侠",
        /**
         * * 协议作者
         */
        protocolAuthor: "钛宇-星光阁",
        /**
         * * 协议发布时间
         */
        releaseDate: "2024-11-14",
        /**
         * * 联系方式
         */
        contactEmail: "1965304849@qq.com"
    };
    /**
     * * 创建项目标识符 (用于标识项目) 默认采用简化序列号
     */
    public projectId: string = BriefID();
    /**
     * * 接入 统一推送协议 的 函数列表
     */
    private functionList: Map<string, ExportFunctionType> = new Map([['help', this.help]]);
    /**
     * * 拦截器
     */
    private protocolInterceptors: ProtocolInterceptors;

    private memoryAddress: Map<number, unknown>;
    private memoryAddressGetter: Map<Object, number>;

    /**
     * * 当前包函数 的 文本描述 用于 在游戏中反馈给调用者
     */
    private describe: (server.RawMessage | string)[] = [];
    /**
     * * 构建 统一推送协议 对象 并 初始化拦截器
     */
    constructor() {
        // 初始化协议拦截器对象
        this.protocolInterceptors = new ProtocolInterceptors();

        this.memoryAddress = new Map();
        this.memoryAddressGetter = new Map();
        // 初始化接收处理
        this.initReceive();
    };

    /**
     * * 初始化接收事件处理
     * 
     * * 该方法用于订阅脚本事件接收通道, 处理接收到的数据并调用相应的功能函数
     */
    private initReceive() {
        // 订阅脚本事件接收通道, 当有事件到达时处理数据
        server.system.afterEvents.scriptEventReceive.subscribe(
            async (data) => {
                // 忽略带有返回结果的事件, 避免循环处理
                if (data.message.startsWith('return+')) return;

                const name = data.id.split(':')[1];

                let getFunction: ExportFunctionType | undefined | number | string | boolean = this.functionList.get(name);
                if (name.indexOf(".") !== -1) {
                    const [moduleLocation, functionName] = name.split(".");
                    const object = this.memoryAddress.get(parseInt(moduleLocation));
                    getFunction = (object as any)[functionName];
                }

                let sendbackMsg = (msg: string) => {
                    console.warn("return+" + msg);
                    server.world.getDimension('overworld').runCommand(`scriptevent ${data.id} return+${msg}`);
                }

                /**
                 * * 将接收到的 数据 转换为 函数可用 的 参数数组
                 */
                const parameters = this.dataToTransmitString(data);
                //其他获取
                let result: TransmissionDataType[] | undefined;
                if (parameters.length === 1 && parameters[0] instanceof SignType) {
                    if (parameters[0].equals(SIGN.TypeGetterSign)) {
                        if (getFunction instanceof Function) {
                            result = [SIGN.IsFunctionSign];
                        } else {
                            result = [SIGN.IsNotFunctionSign, getFunction];
                        }
                    }
                } else {
                    // 函数调用
                    // 如果未找到对应的函数, 则不进行后续处理
                    if (getFunction === undefined) return;
                    // 捕获函数执行过程中的异常
                    try {
                        if (getFunction instanceof Function) {
                            result = [this.protocolInterceptors.onCalled(getFunction, name, parameters)];
                        } else {
                            result = [getFunction];
                            // throw new Error(`${name} is not a function`);
                        }
                        // 将处理结果通过命令形式返回给发送方
                    }
                    catch (error) {
                        //如果报错，返回报错
                        let errorFlow = '';
                        if (error instanceof Error) errorFlow = (error.name + " : " + error.message + "\n" + error.stack);
                        else errorFlow = errorFlow + (error);
                        result = [errorFlow];
                    }
                }
                if (!result) throw new Error('result is undefined');
                sendbackMsg(this.arrayToTransmitString(result));
            }
        );
    };

    /**
     * * 向统一推送 的 功能列表 中 添加 或 更新功能
     * 
     * * 此方法允许通过 键值对 的形式, 将 功能函数 添加 或 更新到 功能列表 中
     * 
     * @param {Function} [func] - 要导出的函数
     * 
     * @param {string} [functionName] - 函数公开名, 默认为函数名
     */
    public exportFunction(func: ExportFunctionType, functionName: string = func.name) {
        this.functionList.set(functionName, func);
    };
    /**
     * * 设置导出功能函数
     * 
     * * 该方法允许传入多种形式的参数来定义导出函数
     * 
     * * 可以是单个函数, 函数数组, 或者包含函数名称和函数本身的数组, 以适应不同的使用场景
     * 
     * @param func 导出函数的定义, 可以是以下多种形式：
     * 
     * - ExportFunctionType<any>：单个导出函数
     * 
     * - ExportFunctionType<any>[]：导出函数的数组
     * 
     * - [string, ExportFunctionType<any>][]：包含函数名称和函数本身的数组
     * 
     * - [string, ExportFunctionType<any>]：单一的包含函数名称和函数本身的数组
     */
    public set exportFunctions(func: ExportFunctionType[] | ExportFunctionType | [string, ExportFunctionType][] | [string, ExportFunctionType]) {
        // 如果传入的是一个函数实例, 则直接调用exportFunction方法
        if (func instanceof Function) {
            this.exportFunction(func);
        }
        // 如果传入的是一个长度为2的数组, 且第一个元素是字符串, 第二个元素是函数, 则调用exportFunction方法, 并传入函数名称
        else if (func instanceof Array && func.length === 2 && typeof func[0] === 'string' && typeof func[1] === 'function') {
            this.exportFunction(func[1], func[0]);
        }
        // 对于其他情况, 遍历数组, 递归调用exportFunctions方法
        else {
            for (const item of func) {
                this.exportFunctions = item as any;
            }
        }
    };

    /**
     * * 显示帮助信息
     * 
     * * 此方法用于输出模块的描述信息作为帮助文档如果模块的描述为空, 则抛出错误
     * 
     * * 描述信息可以是字符串, 也可以是包含文本的对象, 方法会根据类型进行相应的处理
     */
    public help() {
        // 将协议版本信息添加到描述信息数组的开头
        this.describe.unshift('协议版本: ' + this.protocolMessage.protocolVersion);
        // 检查描述信息数组是否至少包含两条信息
        if (this.describe.length >= 2) {
            // 遍历描述信息数组，将每条信息发送到世界聊天并打印到控制台
            this.describe.forEach(
                value => {
                    // 发送到世界聊天栏
                    server.world.sendMessage(value);
                    // 根据值的类型，选择合适的打印方式
                    console.log(typeof value === 'string' ? value : value.text);
                }
            );
        }
        else {
            // 如果描述信息数组为空或信息不足，抛出错误
            throw new Error('模块描述为空, 无法输出帮助文档');
        }
        // 向世界聊天发送函数列表的标题，并在控制台打印相同的标题
        server.world.sendMessage('=+==+==+==+==+=< 函数列表 >=+==+==+==+==+=');
        console.log('=+==+==+==+==+=< 函数列表 >=+==+==+==+==+=');
        // 从函数列表映射中提取所有函数名称，并将它们发送到世界聊天以及打印到控制台
        [...this.functionList.values()].map(item => item.name).forEach(
            item => {
                server.world.sendMessage(item);
                console.log(item);
            }
        );
    };
    /**
     * * 对一个模块进行解析，并返回一个可以进行调用的模块
     * 
     * 
     * @param {ExportFunctionUnion} [module] 模块实例, 该实例应为 ExportFunctionUnion 类型, 表示它可以是多个可能的导出函数类型
     * 
     * @returns {T} 返回一个可被调用的模块
     */
    public solve<T extends ExportFunctionUnion & { [K in keyof T]: T[K] extends (...para: any) => any ? ExportFunctionPara<T[K]> extends TransmissionDataType ? T[K] : never : T[K]; }>(module: T): ExportPromiseSetter<T> {
        return <any>new Proxy<T>(module,
            {
                /**
                 * 当尝试设置代理对象的属性时触发
                 * 
                 * 此处通过抛出错误来禁止设置属性, 确保模块的导出函数不会被外部直接修改
                 */
                "set": () => {
                    throw new Error("Cannot set property");
                },
                /**
                 * 当访问代理对象的属性时触发
                 * 
                 * 该方法拦截对模块导出函数的调用, 并允许在实际调用之前执行额外的操作, 如参数处理等
                 * 
                 * @param {ExportFunctionUnion} [_target] 代理的目标对象, 即传入的模块实例
                 * 
                 * @param {string | symbol}  [name] 被访问的属性名称, 此处应为导出函数的名称
                 * 
                 * @returns 返回一个函数, 该函数在被调用时会调用call方法, 并传入函数名和参数
                 */
                "get": (_target: ExportFunctionUnion, name: string | symbol) => {
                    return (...para: TransmissionDataType[]) => {
                        return this.call(name.toString(), para);
                    }
                }
            }
        );
    };

    public async call(functionName: string, parameters: TransmissionDataType[], timeout: number = 20 * 10, source?: server.Player | server.Entity): Promise<TransmissionDataType> {
        const data = await this.protocolInterceptors.onCalling(
            (_functionName, _parameters, _timeout, _source) => {
                let res = this.post(_functionName, SIGN.FunctionCallSign, _parameters, _timeout, _source);
                return res;
            },
            functionName,
            parameters,
            timeout,
            source
        );
        return data[0];
    };


    public async post(functionName: string, typePost: SignType, parameters?: TransmissionDataType[], timeout: number = 20 * 10, source?: server.Player | server.Entity): Promise<TransmissionDataType[]> {
        const callId = '-' + randomFloor(1000, 9999);
        if (!(typePost.equals(SIGN.FunctionCallSign))) parameters = [typePost];
        if (!parameters) throw new Error('Error in parameters');
        const arrayTransData = this.arrayToTransmitString(parameters);
        console.warn("postMessage: " + functionName + arrayTransData);
        const testDeclare = (data: string): boolean => data.split(/:/)[0] == this.projectId + callId && data.split(/:/)[1] == functionName;
        // 执行命令以触发脚本事件, 并传递调用ID和参数
        (source ?? server.world.getDimension('overworld')).runCommand(`scriptevent ${this.projectId + callId}:${functionName} ${arrayTransData}`);
        // 等待脚本事件接收, 并在指定时间内返回结果
        const data = this.dataToTransmitString(await eventGetter(server.system.afterEvents.scriptEventReceive, timeout, (data) => testDeclare(data.id) && data.message.split('+')[0] == 'return'));
        // 返回处理后的数据
        return data;
    };



    public async callObject(objectAddress: number, functionName: string, parameters?: TransmissionDataType[], timeout: number = 20 * 10, source?: server.Player | server.Entity): Promise<TransmissionDataType> {
        const data = this.call(objectAddress + "." + functionName, parameters ?? [], timeout, source);
        return data;
    }


    /**
     * * 将接收到的服务器脚本事件命令消息转换为 JSONArray
     * 
     * * 此函数处理的消息格式特殊, 包含多种数据类型表示, 如数字、布尔值、字符串和数组
     * 
     * * 它通过一系列的条件判断和转换操作, 将字符串形式的数据转换为相应的JavaScript数据类型
     * 
     * @param {server.ScriptEventCommandMessageAfterEvent} [data] 从服务器接收到的脚本事件命令消息, 包含待转换的字符串信息
     * 
     * @returns {JSONArray} - 返回一个转换后的 JSONArray, 包含各种 JavaScript 数据类型
     */
    private dataToArray(data: server.ScriptEventCommandMessageAfterEvent): JSONArray {
        /**
         * * 待转换的字符串数组
         * 
         * * 根据消息是否以"return+"开头, 决定是否分割字符串以获取实际待转换的部分
         * 
         * * 然后按分号分割字符串, 得到每个单独的值进行后续处理
         */
        const strArray = (data.message.startsWith("return+") ? data.message.split("+")[1] : data.message).split(/;/);
        /**
         * *将字符串转换为 JSONArray
         * 
         * *遍历每个字符串值, 尝试将其转换为相应的数据类型
         */
        const convertedArray: JSONArray = strArray.map(
            value => {
                /**
                 * * 尝试转换为数字
                 */
                const number = Number(value.trim());
                // 如果值是数值的字符串形式, 转换为数值
                if (!isNaN(number)) return number;
                // 如果值是 "true", 转换为布尔值 true
                else if (value.toLowerCase() === 'true') return true;
                // 如果值是 "false", 转换为布尔值 false
                else if (value.toLowerCase() === 'false') return false;
                // 如果值是一个数组, 移除方括号并按逗号分割
                else if (value.startsWith('[') && value.endsWith(']')) return value.slice(1, -1).split(',').map(
                    value => {
                        /**
                         * * 尝试将数组元素转换为数字
                         */
                        const parsedNumber = Number(value.trim());
                        // 如果值是数值的字符串形式, 转换为数值
                        if (!isNaN(parsedNumber)) return parsedNumber;
                        // 如果不是, 返回原始字符串
                        return value.trim();
                    }
                );
                try {
                    /**
                     * * 尝试将字符串转换为 JSON 对象
                     */
                    const json = JSON.parse(value);
                    // 如果解析成功 则 返回 JSON 对象
                    if (typeof json === 'object' && json !== null) return json;
                }
                // 如果解析失败, 返回原始字符串
                catch {
                    // 返回原始字符串
                    return value.trim();
                }
            }
        );
        // 返回转换后的数组
        return convertedArray;
    };
    /**
     * * 将接收到的 数据 转换为 传输数据 类型数组
     * 
     * * 此函数主要用于处理从服务器接收到的脚本事件命令消息, 并将其转换为适合传输的数据类型数组
     * 
     * @param {server.ScriptEventCommandMessageAfterEvent} [data] 从服务器接收到的脚本事件命令消息, 包含源实体和命令数据
     * 
     * @returns {TransmissionDataType[]} 返回一个传输数据类型数组, 包含转换后的数据
     */
    private dataToTransmitString(data: server.ScriptEventCommandMessageAfterEvent): (TransmissionDataType)[] {
        /**
         * * 获取 发送推送信息 的 实体的本身
         */
        const self = data.sourceEntity;
        /**
         * * 获取 发送推送信息 的 实体的目标
         * 
         * * 如果源实体有目标, 则使用目标实体；否则, 尝试从源实体的视角方向获取实体列表中的第一个实体作为目标
         */
        const target = data.sourceEntity?.target ?? data.sourceEntity?.getEntitiesFromViewDirection()[0]?.entity;
        /**
         * * 将字符串转换为实体或数字或字符串
         * 
         * * 此步骤旨在将接收到的字符串数据转换为更具体的数据类型, 以便后续处理和传输
         */
        const parameters = this.dataToArray(data).map(
            type => {
                // 如果是字符串, 则尝试将其转换为 游戏实例对象 或 数字 或 字符串
                if (typeof type === 'string') return this.typeConversion(type, self, target);
                // 如果是数组, 则尝试将其转换为 游戏实例对象 或 数字 或 字符串 的 数组
                else if (Array.isArray(type)) return type.map(
                    value => {
                        // 对数组中的每个字符串, 尝试将其转换为 游戏实例对象 或 数字 或 字符串
                        if (typeof value === 'string') return this.typeConversion(value, self, target)
                    }
                );
                // 如果不是字符串或数组, 则直接返回原始值
                else return type;
            }
        );

        // 返回转换后的参数数组
        return parameters;

    };
    /**
     * * 解析特定的转义字符, 并将其转换为相应的对象引用。
     * 
     * @param {string} [data] - 要解析的字符串数据。
     * 
     * @param {server.Entity} [self] - 可选的自身实体对象, 用于获取块或维度信息。
     * 
     * @param {server.Entity} [target] - 可选的目标实体对象, 用于替换'target'字符串。
     * 
     * @returns {server.Entity | server.Block | server.Dimension | string} 解析后的对象或原始字符串。
     */
    public typeConversion(data: string, self?: server.Entity, target?: server.Entity): TransmissionDataType {

        // 如果数据是'target', 返回目标实体对象
        if (data === 'target') return target;
        // 如果数据是'self', 返回自身实体对象
        else if (data === 'self') return self;
        // 如果数据以'e<'开头并以'>'结尾, 解析为实体标识符并返回相应的实体对象
        else if (data.startsWith('e<') && data.endsWith('>')) {
            /**
             * * 提取实体标识符
             */
            const entityId = data.slice(2, -1);
            // 获取并返回实体对象
            return server.world.getEntity(entityId);
        }
        // 解析以'es<'开头并以'>'结尾的数据, 将其转换为实体查询选项, 并获取符合条件的实体列表
        else if (data.startsWith('es<') && data.endsWith('>')) {
            /**
             * * 移除前后标记并解析为 JSON 对象
             */
            const proto = this.dataToJSON(data.slice(3, -1));
            /**
             * * 创建一个空对象, 用于存储实体查询选项
             */
            const options: server.EntityQueryOptions = {};
            /**
             * * 创建一个映射, 用于将简写键替换为实际的查询选项键
             */
            const replace = new Map<string, string>(
                [
                    ['c', 'closest'],
                    ['r', 'maxDistance'],
                    ['rm', 'minDistance'],
                    ['tags', 'tags'],
                    ['_tags', 'excludeTags'],
                    ['familys', 'families'],
                    ['_familys', 'excludeFamilies'],
                    ['name', 'name'],
                    ['_names', 'excludeNames'],
                    ['type', 'type'],
                    ['_types', 'excludeTypes'],
                    ['rx', 'maxVerticalRotation'],
                    ['rxm', 'minVerticalRotation'],
                    ['ry', 'maxHorizontalRotation'],
                    ['rym', 'minHorizontalRotation'],
                ]
            );
            // 遍历解析后的JSON对象的键
            Object.keys(proto).forEach(
                key => {
                    /**
                     * * 将简写键替换为实际的查询选项键
                     */
                    const newKey = replace.get(key);
                    // 如果替换成功, 则将该选项添加到查询选项中
                    if (newKey) (options as any)[newKey] = proto[key];
                }
            );
            // 如果没有指定发信源实体, 则抛出错误
            if (!self) throw new Error('实体转义符 => 解析错误: 需要指定 发信源实体');
            // 使用查询选项获取符合条件的实体列表
            return self.dimension.getEntities({ location: self.location, ...options });
        }
        // 如果数据以'b<'开头并以'>'结尾, 解析为块位置并返回相应的块对象
        else if (data.startsWith('b<') && data.endsWith('>')) {
            /**
             * * 获取 转义符信息
             */
            const split = data.slice(2, -1).split('.');
            /**
             * * 提取方块位置
             */
            const [x, y, z] = split.map(x => x.trim()).map(Number);
            // 检查是否提供了正确的参数数量
            if (split.length !== 4) throw new Error('方块转义符 => 解析错误: 正确格式为: b<x.y.z.dimension>');
            // 检查[x, y, z]是否都是数值
            if (isNaN(x) || isNaN(y) || isNaN(z)) throw new Error('方块转义符 => 解析错误: x, y, z 必须是数值');
            // 检查split[3]是否是字符串
            if (typeof split[3] !== 'string') throw new Error('方块转义符 => 解析错误: dimension 必须是字符串');
            // 使用自身实体的维度获取块对象
            return server.world.getDimension(split[3])?.getBlock({ x, y, z });
        }
        // 如果数据以'd<'开头并以'>'结尾, 解析为维度名称并返回相应的维度对象
        else if (data.startsWith('d<') && data.endsWith('>')) {
            /**
             * * 提取维度名称
             */
            const dimensionName = data.slice(2, -1);
            // 获取并返回维度对象
            return server.world.getDimension(dimensionName);
        }
        // 如果数据以'x<'开头并以'>'结尾, 解析为JSON字符串并返回相应的对象
        else if (data.startsWith('x<') && data.endsWith('>')) return this.dataToJSON(data.slice(2, -1));
        else if (data.startsWith('object<') && data.endsWith('>')) {
            const [addressStr, keysStr] = data.slice(7, -1).split("|");
            const address = parseInt(addressStr);
            const keys: String[] = JSON.parse(keysStr);
            const inferrence = this;
            return new Proxy(new Object(), {
                "get": function (target, prop) {
                    console.warn("listen: " + prop.toString());
                    if (!keys.includes(String(prop))) {
                        return inferrence.callObject(address, String(prop), []).then(type => {
                            return type;
                        })
                    } else {
                        return (...args: TransmissionDataType[]) => {
                            return inferrence.callObject(address, String(prop), args);
                        }
                    }
                }
            })
        }
        else if (data === SIGN.IsFunctionSign.transName) return SIGN.IsFunctionSign;
        else if (data === SIGN.IsNotFunctionSign.transName) return SIGN.IsNotFunctionSign;
        else if (data === SIGN.TypeGetterSign.transName) return SIGN.TypeGetterSign;
        else if (data === SIGN.VarAddressGetterSign.transName) return SIGN.VarAddressGetterSign;
        // 如果数据不包含任何转义字符, 直接返回原始数据
        else return data;

    };
    /**
     * * 将字符串数据转换为JSON对象
     * 
     * * 此函数旨在处理特定格式的字符串, 将其转换为易于操作的JSON对象
     * 
     * * 它通过解析字符串中的键值对, 并根据特定规则转换值的类型（如数字、布尔值等）, 来构建JSON对象
     * 
     * 
     * @param {string} [data] - 以特定格式传递的字符串数据, 格式为"key1=value1:key2=value2"
     * 
     * @returns {JSONObject} 返回一个JSONObject, 其中包含解析后的键值对
     */
    private dataToJSON(data: string): JSONObject {
        /**
         * * 初始化一个空对象来存储键值对
         */
        const result: JSONObject = {};
        /**
         * * 分割字符串以获取键值对
         */
        const pairs = data.split(':');
        // 遍历每个键值对
        pairs.forEach(
            pair => {
                /**
                 * * 获取 当前键值对 的键
                 */
                const key = pair.split('=')[0];
                /**
                 * * 获取 当前键值对 的值
                 */
                const value = pair.split('=')[1];
                /**
                 * * 尝试转换为数字
                 */
                const number = Number(value.trim());
                // 如果值是一个数组, 移除方括号并按逗号分割
                if (value.startsWith('[') && value.endsWith(']')) result[key] = value.slice(1, -1).split(',').map(
                    value => {
                        /**
                         * * 尝试将数组元素转换为数字
                         */
                        const parsedNumber = Number(value.trim());
                        // 如果值是数值的字符串形式, 转换为数值
                        if (!isNaN(parsedNumber)) return parsedNumber;
                        // 如果不是, 返回原始字符串
                        return value.trim();
                    }
                );
                // 如果值是 "true", 转换为布尔值 true
                else if (value.toLowerCase() === 'true') result[key] = true;
                // 如果值是 "false", 转换为布尔值 false
                else if (value.toLowerCase() === 'false') result[key] = false;
                // 如果值是数值的字符串形式, 转换为数值
                else if (!isNaN(number)) result[key] = number;
                // 否则, 直接使用字符串值
                else result[key] = value;
            }
        );
        return result;
    };
    /**
     * * 将数组转换为自定义字符串表示, 方便传输
     * * 并将它们用分号( ; )分隔
     */
    private arrayToTransmitString(array: TransmissionDataType[]): string {
        /**
         * * 将数组中的每个元素根据其类型转换为字符串
         */
        const elements = array.map(
            (element) => {
                // 如果元素为null，直接返回字符串"null"
                if (element === null) return 'null';
                // 对于 undefined, 直接返回字符串"undefined"
                if (element === undefined) return 'undefined';
                // 对于布尔类型, 使用其toString方法转换为字符串
                if (typeof element === 'boolean') return element.toString();
                // 对于字符串类型, 直接使用其toString方法
                if (typeof element === 'string') return element.toString();
                // 对于数字类型, 使用其toString方法转换为字符串
                if (typeof element === 'number') return element.toString();
                // 如果元素是数组
                if (Array.isArray(element)) {
                    // 如果数组中每个元素都是 Block 实例，调用 blockToString 方法
                    if (element.every(value => value instanceof server.Block)) return this.blockToString(element as server.Block[]);
                    // 如果数组中每个元素都是 Entity 实例，调用 entityToString 方法
                    if (element.every(value => value instanceof server.Entity)) return this.entityToString(element as server.Entity[]);
                    // 如果数组中每个元素都是 Dimension 实例，调用 dimensionToString 方法
                    if (element.every(value => value instanceof server.Dimension)) return this.dimensionToString(element as server.Dimension[]);
                    // 如果数组中元素不是特定类型，使用join方法拼接为字符串
                    return '[' + element.join(',') + ']';
                }
                // 如果元素是Block实例，调用blockToString方法
                if (element instanceof server.Block) return this.blockToString(element);
                // 如果元素是Entity实例，调用entityToString方法
                if (element instanceof server.Entity) return this.entityToString(element);
                // 如果元素是Dimension实例，调用dimensionToString方法
                if (element instanceof server.Dimension) return this.dimensionToString(element);
                if (element instanceof SignType) {
                    if (element.equals(SIGN.FunctionCallSign)) return SIGN.FunctionCallSign.transName;
                    if (element.equals(SIGN.IsFunctionSign)) return SIGN.IsFunctionSign.transName;
                    if (element.equals(SIGN.IsNotFunctionSign)) return SIGN.IsNotFunctionSign.transName;
                    if (element.equals(SIGN.TypeGetterSign)) return SIGN.TypeGetterSign.transName;
                    if (element.equals(SIGN.VarAddressGetterSign)) return SIGN.VarAddressGetterSign.transName;
                }
                if ("__remote" in element) {
                    if (this.memoryAddressGetter.has(element)) {
                        return this.memoryAddressGetter.get(element)!;
                    } else {
                        const address = randomFloor(-1000000, 10000000);
                        this.memoryAddressGetter.set(element, address);
                        this.memoryAddress.set(address, element);
                        return `object<${address}|${JSON.stringify(keys(element).filter(e => {
                            return (element as any)[e] instanceof Function && !e.toString().startsWith("_")
                        }))}>`;
                    }
                }
                // 对于其他对象类型，使用JSON.stringify方法转换为字符串
                return JSON.stringify(element);
            }
        );
        // 将转换后的元素字符串用分号( ; )连接, 形成最终的字符串表示
        return elements.join(';');
    };
    /**
     * * 将 方块 或 方块数组 转换为 字符串形式
     * 
     * @param {server.Block | server.Block[]} [input] - 方块 或 方块数组 
     * 
     * @returns {string} - 游戏对象的字符串表示
     * 
     * @throws {Error} - 如果输入的参数类型错误时, 则抛出错误
     */
    public blockToString(input: server.Block | server.Block[]): string {
        /**
         * * 将 游戏对象 转换为 字符串表示
         */
        const toString = (_block: server.Block) => `b<${_block.x}.${_block.y}.${_block.z}.${_block.dimension.id.split(':')[1]}>`;
        // 检查 输入 是否为 对象数组
        if (Array.isArray(input) && input.every(value => value instanceof server.Block)) {
            // 使用逗号分隔数组中的每个元素, 并包裹在方括号中
            return `[${input.map(toString).join(',')}]`;
        }
        // 检查 输入 是否为 单个对象
        else if (input instanceof server.Block) {
            // 直接转换 单个对象
            return toString(input);
        }
        // 如果输入既不是 数组 也不是 单个对象, 抛出错误
        else {
            throw new Error('无效输入：输入必须是 server.Block 对象或 server.Block 对象数组');
        }
    };
    /**
     * * 将 实体 或 实体数组 转换为 字符串形式
     * 
     * @param {server.Entity | server.Entity[]} [input] - 实体 或 实体数组 
     * 
     * @returns {string} - 游戏对象的字符串表示
     * 
     * @throws {Error} - 如果输入的参数类型错误时, 则抛出错误
     */
    public entityToString(input: server.Entity | server.Entity[]): string {
        /**
         * * 将 游戏对象 转换为 字符串表示
         */
        const toString = (_entity: server.Entity) => `e<${_entity.id}>`;
        // 检查 输入 是否为 对象数组
        if (Array.isArray(input) && input.every(value => value instanceof server.Entity)) {
            // 使用逗号分隔数组中的每个元素, 并包裹在方括号中
            return `[${input.map(toString).join(',')}]`;
        }
        // 检查 输入 是否为 单个对象
        else if (input instanceof server.Entity) {
            // 直接转换单个对象
            return toString(input);
        }
        // 如果输入既不是数组也不是单个对象, 抛出错误
        else {
            throw new Error('无效输入：输入必须是 server.Entity 对象或 server.Entity 对象数组');
        }
    };
    /**
     * * 将 维度 或 维度数组 转换为 字符串形式
     * 
     * @param {server.Dimension | server.Dimension[]} [input] - 维度 或 维度数组 
     * 
     * @returns {string} - 游戏对象的字符串表示
     * 
     * @throws {Error} - 如果输入的参数类型错误时, 则抛出错误
     */
    public dimensionToString(input: server.Dimension | server.Dimension[]): string {
        /**
         * * 将 维度对象 转换为 字符串表示
         */
        const toString = (_dimension: server.Dimension) => `d<${_dimension.id}>`;
        // 检查 输入 是否为 对象数组
        if (Array.isArray(input) && input.every(value => value instanceof server.Dimension)) {
            // 使用逗号分隔数组中的每个元素, 并包裹在方括号中
            return `[${input.map(toString).join(',')}]`;
        }
        // 检查 输入 是否为 单个对象
        else if (input instanceof server.Dimension) {
            // 直接转换单个对象
            return toString(input);
        }
        // 如果输入既不是 数组 也不是 单个对象, 抛出错误
        else {
            throw new Error('无效输入：输入必须是 server.Dimension 对象或 server.Dimension 对象数组');
        }
    };
    /**
     * * 将实体查询选项转换为字符串
     * 
     * * 该方法用于将服务器端的实体查询选项格式化为一个简化的字符串表示
     * 
     * @param {server.EntityQueryOptions} [options] - 实体查询选项的对象, 包含多种查询参数, 如距离、标签、家族、名称、类型等
     * 
     * @returns {string} 返回格式化后的查询字符串
     */
    public entityFilterToString(options: server.EntityQueryOptions): string {
        /**
         * * 创建一个映射, 用于将实际的查询选项键替换为简写键
         */
        const reverseReplace = new Map<string, string>(
            [
                ['closest', 'c'],
                ['maxDistance', 'r'],
                ['minDistance', 'rm'],
                ['tags', 'tags'],
                ['excludeTags', '_tags'],
                ['families', 'familys'],
                ['excludeFamilies', '_familys'],
                ['name', 'name'],
                ['excludeNames', '_names'],
                ['type', 'type'],
                ['excludeTypes', '_types'],
                ['maxVerticalRotation', 'rx'],
                ['minVerticalRotation', 'rxm'],
                ['maxHorizontalRotation', 'ry'],
                ['minHorizontalRotation', 'rym'],
            ]
        );
        /**
         * * 创建一个数组, 用于存储简写键和值的字符串对
         */
        const pairs: string[] = [];
        // 遍历输入的查询选项
        Object.keys(options).forEach(
            key => {
                /**
                 * * 将实际的查询选项键替换为简写键
                 */
                const newKey = reverseReplace.get(key);
                // 将键和值转换为字符串对, 并添加到数组中
                if (newKey) pairs.push(`${newKey}=${(options as any)[key]}`);
            }
        );
        /**
         * * 将数组中的字符串对连接成一个字符串, 并用冒号分隔
         */
        const resultString = pairs.join(':');
        // 返回格式化的字符串
        return `es<${resultString}>`;
    };
};
/**
 *
 * * 本系统仅为一套协议, 不涉及任何具体功能
 *
 * * 各项功能应由各个模组自己独立实现
 *
 * * 推送系统仅作为推送数据的载体
 *
 * * 推送系统不涉及任何数据处理
 *
 * * 推送系统不涉及任何数据存储
 *
 */
export const bridge = new BridgeProtocol();