
import { MinecraftEntityTypes, MinecraftItemTypes } from "../../../../modules/vanilla-data/lib/index.js";
import PomClient from "../../PomClient.js";
import { langType } from "../langType.js";
import { PomTaskJSON } from "./PomTask.js";

export default function taskDaily_b(client:PomClient,lang: langType):PomTaskJSON {
    return {
        "name": "每日任务-稀有级",
        "tasks": [
            {
                "name": "粮食提交 I",
                "conditions": [
                    {
                        "name": "小麦",
                        "typeId": MinecraftItemTypes.Wheat,
                        "count": 16,
                        "type": "item"
                    },
                    {
                        "name": "南瓜",
                        "typeId": MinecraftItemTypes.Pumpkin,
                        "count": 16,
                        "type": "item"
                    },
                    {
                        "name": "西瓜片",
                        "typeId": MinecraftItemTypes.MelonSlice,
                        "count": 16,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": "模组经验",
                        "count": 800,
                        "unit": "点",
                        "type": "integral"
                    }
                ]
            },
            {
                "name": "粮食提交 II",
                "conditions": [
                    {
                        "name": "马铃薯",
                        "typeId": MinecraftItemTypes.Potato,
                        "count": 32,
                        "type": "item"
                    },
                    {
                        "name": "胡萝卜",
                        "typeId": MinecraftItemTypes.Carrot,
                        "count": 32,
                        "type": "item"
                    },
                    {
                        "name": "西瓜",
                        "typeId": MinecraftItemTypes.MelonBlock,
                        "count": 1,
                        "type": "item"
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
            },
            {
                "name": "盛宴",
                "conditions": [
                    {
                        "name": "熟鸡肉",
                        "typeId": MinecraftItemTypes.CookedChicken,
                        "count": 16,
                        "type": "item"
                    },
                    {
                        "name": "熟羊肉",
                        "typeId": MinecraftItemTypes.CookedMutton,
                        "count": 24,
                        "type": "item"
                    },
                    {
                        "name": "生牛肉",
                        "typeId": MinecraftItemTypes.Beef,
                        "count": 16,
                        "type": "item"
                    },
                    {
                        "name": "熟兔肉",
                        "typeId": MinecraftItemTypes.CookedRabbit,
                        "count": 3,
                        "type": "item"
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
            },
            {
                "name": "清缴怪物",
                "conditions": [
                    {
                        "name": "僵尸战士",
                        "typeId": "dec:zombie_warrior",
                        "count": 8,
                        "type": "kill"
                    },
                    {
                        "name": "地狱苦力怕",
                        "typeId": "dec:nether_creeper",
                        "count": 4,
                        "type": "kill"
                    },
                    {
                        "name": "末影女巫",
                        "typeId": "dec:ender_witch",
                        "count": 1,
                        "type": "kill"
                    }
                ],
                "rewards": [
                    {
                        "name": "模组经验",
                        "count": 1200,
                        "unit": "点",
                        "type": "integral"
                    }
                ]
            },
            {
                "name": "狩猎愉快!",
                "conditions": [
                    {
                        "name": "猪",
                        "typeId": "minecraft:pig",
                        "count": 24,
                        "type": "kill"
                    },
                    {
                        "name": "牛",
                        "typeId": "minecraft:cow",
                        "count": 16,
                        "type": "kill"
                    },
                    {
                        "name": "羊",
                        "typeId": "minecraft:sheep",
                        "count": 16,
                        "type": "kill"
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
            },
            {
                "name": "砍树!",
                "conditions": [
                    {
                        "name": "木头",
                        "typeId": "log",
                        "count": 84,
                        "type": "break"
                    }
                ],
                "rewards": [
                    {
                        "name": "模组经验",
                        "count": 800,
                        "unit": "点",
                        "type": "integral"
                    }
                ]
            },
            {
                "name": "成为矿工",
                "conditions": [
                    {
                        "name": "石头",
                        "typeId": MinecraftItemTypes.Stone,
                        "count": 128,
                        "type": "break"
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
            },
            {
                "name": "毒马铃薯",
                "conditions": [
                    {
                        "name": "毒马铃薯",
                        "typeId": MinecraftItemTypes.PoisonousPotato,
                        "count": 12,
                        "type": "item"
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
            },
            {
                "name": "改善伙食",
                "conditions": [
                    {
                        "name": "兔肉煲",
                        "typeId": MinecraftItemTypes.RabbitStew,
                        "count": 12,
                        "type": "item"
                    },
                    {
                        "name": "蘑菇煲",
                        "typeId": MinecraftItemTypes.MushroomStew,
                        "count": 12,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": "模组经验",
                        "count": 1200,
                        "unit": "点",
                        "type": "integral"
                    }
                ]
            },
            {
                "name": "僵尸大脑",
                "conditions": [
                    {
                        "name": "僵尸大脑",
                        "typeId": "dec:zombie_brain",
                        "count": 48,
                        "type": "item"
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
            },
            {
                "name": "附魔匠",
                "conditions": [
                    {
                        "name": "转移附魔书",
                        "typeId": "wb:book_cache",
                        "count": 3,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": "模组经验",
                        "count": 800,
                        "unit": "点",
                        "type": "integral"
                    }
                ]
            },
            {
                "name": "灵魂猎手",
                "conditions": [
                    {
                        "name": "灵魂",
                        "typeId": "dec:soul",
                        "count": 16,
                        "type": "item"
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
            },
            {
                "name": "海洋美食",
                "conditions": [
                    {
                        "name": "海胆",
                        "typeId": "dec:sea_urchin",
                        "count": 12,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": "模组经验",
                        "count": 900,
                        "unit": "点",
                        "type": "integral"
                    }
                ]
            }
        ]
    }
}