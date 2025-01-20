export default interface SetTimeOutSupport{
    runTimeout(fun:() => void, timeout:number):void;
}