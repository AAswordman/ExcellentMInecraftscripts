import SetTimeOutSupport from "../interface/SetTimeOutSupport.js";
import ExErrorQueue, { to } from "../server/ExErrorQueue.js";

export default function notUtillTask(m: SetTimeOutSupport, f: (() => boolean) | (() => Promise<boolean>), run: () => void) {
    let func = async () => {
        try {
            let res = f();
            if (res instanceof Promise) res = await res;
            if (res) {
                run();
            } else {
                m.setTimeout((func), 1000);
            }
        } catch (e) {
            ExErrorQueue.throwError(e);
        }
    };
    m.setTimeout(func, 100);
}