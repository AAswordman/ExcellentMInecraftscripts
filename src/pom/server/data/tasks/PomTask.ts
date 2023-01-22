export interface PomTaskJSON {
    name: string;
    tasks: PomTaskSingle[];
}
export interface PomTaskSingle {
    name: string;
    conditions: {
        name: string;
        typeId: string;
        count: number;
        type: "item" | "kill" | "break";
        aux?: number;
    }[],
    rewards: {
        name: string;
        unit: string;
        count: number;
        type: "integral";
    }[]
}

export default class PomTask {
    constructor() {

    }
}


export interface PomTaskProgressJSON {
    name: string;
    conditions: {
        name: string;
        typeId: string;
        type: "boss";
        damage?: number;
    }[],
    rewards: {
        name: string;
        unit: string;
        count: number;
        type: "integral";
    }[]
}
