import DisposeAble from "../interface/DisposeAble.js";
import { TickEvent } from "../server/events/events.js";

export default interface TickDelayTask extends DisposeAble{
    func ?: (e: TickEvent) => void;
    getDelay():number;
    delay(time: number):this;
    isStarted(): boolean;
    startOnce():this;
    start():this;
    stop():this;
    
}