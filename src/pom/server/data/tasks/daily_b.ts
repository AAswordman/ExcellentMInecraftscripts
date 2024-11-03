
import { MinecraftEntityTypes, MinecraftItemTypes } from "../../../../modules/vanilla-data/lib/index.js";
import PomClient from "../../PomClient.js";
import { langType } from "../langType.js";
import { PomTaskJSON } from "./PomTask.js";

export default function taskDaily_b(client:PomClient,lang: langType):PomTaskJSON {
    return {
        "name": lang.menuUIMsgBailan303,
        "tasks": [
            {
                "name": lang.menuUIMsgBailan304,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan305,
                        "typeId": MinecraftItemTypes.Wheat,
                        "count": 16,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan306,
                        "typeId": MinecraftItemTypes.Pumpkin,
                        "count": 16,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan307,
                        "typeId": MinecraftItemTypes.MelonSlice,
                        "count": 16,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 800,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan308,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan309,
                        "typeId": MinecraftItemTypes.Potato,
                        "count": 32,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan310,
                        "typeId": MinecraftItemTypes.Carrot,
                        "count": 32,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan311,
                        "typeId": MinecraftItemTypes.MelonBlock,
                        "count": 1,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1000,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan312,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan313,
                        "typeId": MinecraftItemTypes.CookedChicken,
                        "count": 16,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan314,
                        "typeId": MinecraftItemTypes.CookedMutton,
                        "count": 24,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan315,
                        "typeId": MinecraftItemTypes.Beef,
                        "count": 16,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan316,
                        "typeId": MinecraftItemTypes.CookedRabbit,
                        "count": 3,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1000,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan317,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan318,
                        "typeId": "dec:zombie_warrior",
                        "count": 8,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan319,
                        "typeId": "dec:nether_creeper",
                        "count": 4,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan320,
                        "typeId": "dec:ender_witch",
                        "count": 1,
                        "type": "kill"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1200,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan321,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan322,
                        "typeId": "minecraft:pig",
                        "count": 24,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan323,
                        "typeId": "minecraft:cow",
                        "count": 16,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan324,
                        "typeId": "minecraft:sheep",
                        "count": 16,
                        "type": "kill"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1000,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan325,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan326,
                        "typeId": "log",
                        "count": 84,
                        "type": "break"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 800,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan327,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan328,
                        "typeId": MinecraftItemTypes.Stone,
                        "count": 128,
                        "type": "break"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1000,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan329,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan330,
                        "typeId": MinecraftItemTypes.PoisonousPotato,
                        "count": 12,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1000,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan331,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan332,
                        "typeId": MinecraftItemTypes.RabbitStew,
                        "count": 12,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan333,
                        "typeId": MinecraftItemTypes.MushroomStew,
                        "count": 12,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1200,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan334,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan335,
                        "typeId": "dec:zombie_brain",
                        "count": 48,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1000,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan336,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan337,
                        "typeId": "wb:book_cache",
                        "count": 3,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 800,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan338,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan339,
                        "typeId": "dec:soul",
                        "count": 16,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1000,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan340,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan341,
                        "typeId": "dec:sea_urchin",
                        "count": 12,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 900,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            }
        ]
    }
}