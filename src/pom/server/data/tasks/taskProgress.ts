import PomAncientStoneBoss from "../../entities/PomAncientStoneBoss.js";
import PomHeadlessGuardBoss from "../../entities/PomHeadlessGuardBoss.js";
import { PomIntentionsBoss3 } from "../../entities/PomIntentionsBoss.js";
import PomMagicStoneBoss from "../../entities/PomMagicStoneBoss.js";
import { langType } from "../langType.js";
import { PomTaskJSON, PomTaskProgressJSON } from "./PomTask.js";

export default function taskProgress(lang: langType): { [x: string]: PomTaskProgressJSON } {
    return {
        "main_dec_leavesgolem": {
            "name": lang.menuUIMsgBailan236,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan237,
                    "typeId": "dec:leaves_golem",
                    "damage": 1,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 2000,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        },
        "main_dec_king_of_pillager": {
            "name": lang.menuUIMsgBailan238,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan239,
                    "typeId": "dec:king_of_pillager",
                    "damage": 1,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 2500,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        },
        "main_dec_abyssal_controller": {
            "name": lang.menuUIMsgBailan240,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan241,
                    "typeId": "dec:abyssal_controller",
                    "damage": 1,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 3000,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        },
        "main_dec_predators": {
            "name": lang.menuUIMsgBailan242,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan243,
                    "typeId": "dec:predators",
                    "damage": 1,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 4500,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        },
        "main_dec_enchant_illager": {
            "name": lang.menuUIMsgBailan244,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan245,
                    "typeId": "dec:enchant_illager_2",
                    "damage": 1,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 4500,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        },
        "main_dec_evlghost": {
            "name": lang.menuUIMsgBailan246,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan247,
                    "typeId": "dec:everlasting_winter_ghast_1",
                    "damage": 1,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 8000,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        },
        "main_dec_escaped_soul": {
            "name": lang.menuUIMsgBailan248,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan249,
                    "typeId": "dec:escaped_soul_entity",
                    "damage": 1,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 9000,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        },
        "main_dec_host_of_deep": {
            "name": lang.menuUIMsgBailan250,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan251,
                    "typeId": "dec:host_of_deep_2",
                    "damage": 1,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 9000,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        },
        "main_dec_ash_knight": {
            "name": lang.menuUIMsgBailan252,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan253,
                    "typeId": "dec:ash_knight",
                    "damage": 1,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 7500,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        },
        "dragon": {
            "name": lang.menuUIMsgBailan254,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan255,
                    "typeId": "wb:magic_stoneman",
                    "type": "boss_tag",
                    "tagName": "wbstartkeyok"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 10000,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        },
        "main_pom_1": {
            "name": lang.menuUIMsgBailan256,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan257,
                    "typeId": PomMagicStoneBoss.typeId,
                    "damage": 100,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 15000,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        },
        "main_pom_2": {
            "name": lang.menuUIMsgBailan258,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan259,
                    "typeId": PomHeadlessGuardBoss.typeId,
                    "damage": 300,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 20000,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        },
        "main_pom_3": {
            "name": lang.menuUIMsgBailan260,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan261,
                    "typeId": PomAncientStoneBoss.typeId,
                    "damage": 400,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 30000,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        },
        "main_pom_4": {
            "name": lang.menuUIMsgBailan262,
            "conditions": [
                {
                    "name": lang.menuUIMsgBailan263,
                    "typeId": PomIntentionsBoss3.typeId,
                    "damage": 500,
                    "type": "boss"
                }
            ],
            "rewards": [
                {
                    "name": lang.modExperience,
                    "count": 40000,
                    "unit": lang.points,
                    "type": "integral"
                }
            ]
        }
    }
}