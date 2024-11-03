import { MinecraftEntityTypes, MinecraftItemTypes } from "../../../../modules/vanilla-data/lib/index.js";
import PomClient from "../../PomClient.js";
import { langType } from "../langType.js";
import { PomTaskJSON } from "./PomTask.js";

export default function taskDaily_x(client:PomClient,lang: langType):PomTaskJSON {
    return {
        "name": lang.menuUIMsgBailan394,
        "tasks": [
            {
                "name": lang.menuUIMsgBailan395,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan396,
                        "typeId": MinecraftItemTypes.Wheat,
                        "count": 256,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan397,
                        "typeId": MinecraftItemTypes.Potato,
                        "count": 256,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan398,
                        "typeId": MinecraftItemTypes.Carrot,
                        "count": 256,
                        "type": "item"
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
            {
                "name": lang.menuUIMsgBailan399,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan400,
                        "typeId": MinecraftItemTypes.CookedChicken,
                        "count": 256,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan401,
                        "typeId": MinecraftItemTypes.CookedMutton,
                        "count": 256,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan402,
                        "typeId": MinecraftItemTypes.CookedBeef,
                        "count": 256,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan403,
                        "typeId": MinecraftItemTypes.CookedRabbit,
                        "count": 64,
                        "type": "item"
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
            {
                "name": lang.menuUIMsgBailan404,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan405,
                        "typeId": "dec:zombie_warrior",
                        "count": 64,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan406,
                        "typeId": "dec:ender_witch",
                        "count": 32,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan407,
                        "typeId": "dec:stone_golem",
                        "count": 4,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan408,
                        "typeId": "dec:obsidian_golem",
                        "count": 2,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan409,
                        "typeId": "dec:skeleton_warrior",
                        "count": 64,
                        "type": "kill"
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
            {
                "name": lang.menuUIMsgBailan410,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan411,
                        "typeId": MinecraftItemTypes.DiamondOre,
                        "count": 16,
                        "type": "break"
                    },
                    {
                        "name": lang.menuUIMsgBailan412,
                        "typeId": MinecraftItemTypes.CoalOre,
                        "count": 64,
                        "type": "break"
                    },
                    {
                        "name": lang.menuUIMsgBailan413,
                        "typeId": MinecraftItemTypes.GoldOre,
                        "count": 64,
                        "type": "break"
                    },
                    {
                        "name": lang.menuUIMsgBailan414,
                        "typeId": MinecraftItemTypes.IronOre,
                        "count": 64,
                        "type": "break"
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
            {
                "name": lang.menuUIMsgBailan415,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan416,
                        "typeId": "dec:sea_urchin",
                        "count": 8,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan417,
                        "typeId": "dec:ender_fish",
                        "count": 12,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan418,
                        "typeId": "dec:a_piece_of_salmon",
                        "count": 64,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan419,
                        "typeId": "dec:gold_fish",
                        "count": 12,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan420,
                        "typeId": "dec:coal_fish",
                        "count": 16,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan421,
                        "typeId": "dec:diamond_fish",
                        "count": 6,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 2100,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan422,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan423,
                        "typeId": "minecraft:ender_dragon",
                        "count": 1,
                        "type": "kill"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 4000,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            }
        ]
    }
}