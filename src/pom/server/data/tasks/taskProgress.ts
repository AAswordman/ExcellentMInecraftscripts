import { langType } from "../langType.js";
import { PomTaskJSON, PomTaskProgressJSON } from "./PomTask.js";

export default function taskProgress(lang: langType): { [x: string]: PomTaskProgressJSON } {
    return {
        "main_pom_1": {
            "name": "新的开始",
            "conditions": [
                {
                    "name": "魔化石块BOSS",
                    "typeId": "wb:magic_stoneman",
                    "damage": 100,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": "模组经验",
                    "count": 1000,
                    "unit": "点",
                    "type": "integral"
                }
            ]
        }
    }
}