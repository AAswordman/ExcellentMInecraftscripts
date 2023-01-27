
const task_arr = ["Ao", "Jf", "Sk", "Ch", "Om", "Bs", "Hd", "Oa", "Gx", "Xe"];
function taskTranToNum(t: string) {
    return t.split(" ").map(e => task_arr.indexOf(e)).join('');
}
console.log(taskTranToNum("003"));