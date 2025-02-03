interface FormatString {
    [key: string]: string;
}

interface ConsoleMethod {
    (this: Console, ...args: any[]): void;
}

// 格式字符串映射
const FORMATTINGS: FormatString = {
    Red: "§c", DarkRed: "§4", Yellow: "§e",
    Gold: "§6", Orange: "§6", MineCoinGold: "§g",
    Green: "§a", DarkGreen: "§2", Blue: "§9",
    DarkBlue: "§1", Aqua: "§b", DarkAqua: "§3",
    Cyan: "§3", LightPurple: "§d", Pink: "§d",
    Purple: "§5", White: "§f", Gray: "§7",
    DarkGray: "§8", Grey: "§8", Black: "§0",
    Reset: "§r", Obfuscated: "§k", RandomText: "§k",
    Garbled: "§k", Bold: "§l", Italic: "§o"
};

// 保存原始控制台方法
const originalConsole = {
    debug: console.debug,
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
};

// 日志等级映射
const levelMap = {
    debug: ['DEBUG', FORMATTINGS.Gray],
    log: ['INFO', FORMATTINGS.White],
    info: ['INFO', FORMATTINGS.White],
    warn: ['WARN', FORMATTINGS.Yellow],
    error: ['ERROR', FORMATTINGS.Red]
};

// 获取调用者信息（兼容多浏览器格式）
function getCallerInfo(): string {
    try {
        throw new Error();
    } catch (e) {
        const stack = (e as Error).stack!.split('\n');
        let caller = 'unknown - 0';

        // 跳过自身堆栈帧
        let i = 2;
        const line = stack[i].trim();

        let file = line.split('/').pop();
        file = file?.substring(0, file.length-1);
        caller = `${file} - ${line.substring(line.lastIndexOf('at ') + 3, line.indexOf('('))}`;

        return caller;
    }
}

// 时间格式化（HH:mm:ss）
function formatTime(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

// 重写控制台方法
Object.keys(levelMap).forEach(method => {
    (console as any)[method] = function (this: Console, ...args: any[]): void {
        const level = (levelMap as any)[method];
        const timestamp = formatTime(new Date());
        const caller = getCallerInfo();
        (originalConsole as any)[method].call(
            console,
            `${level[1]}[${level[0]}](${caller}) ${timestamp} -`,
            ...args
        );
    };
});