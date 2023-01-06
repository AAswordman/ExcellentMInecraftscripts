import MathUtil from "../math/MathUtil.js";

export default function(command:string) {
    if (!(typeof command === "string")) {
        throw new Error("Command is not the expected type");
    }
    if (command.startsWith("/") || command.startsWith("$")) {
        command = command.substring(1, command.length);
    }
    let arr = command.split(" ");
    let res:string[] = [];

    for (let i of arr) {
        res.push(i);
    }
    return res;
}