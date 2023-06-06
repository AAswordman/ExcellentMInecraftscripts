import { Events, TickEvent } from '@minecraft/server';
import ExEventManager from "../interface/ExEventManager.js";
import SetTimeOutSupport from "../interface/SetTimeOutSupport.js";

export default interface TickDelayTask {
    func ?: (e: TickEvent) => void;
    getDelay():number;
    delay(time: number):this;
    isStarted(): boolean;
    startOnce():void;
    start():void;
    stop():void;
}