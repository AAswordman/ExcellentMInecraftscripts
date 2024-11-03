import { MinecraftEntityTypes, MinecraftItemTypes } from "../../../../modules/vanilla-data/lib/index.js";
import PomClient from "../../PomClient.js";
import { langType } from "../langType.js";
import { PomTaskJSON } from "./PomTask.js";

export default function taskDaily_c(client:PomClient,lang: langType):PomTaskJSON {
    return {
        "name": lang.menuUIMsgBailan342,
        "tasks": [
            {
                "name": lang.menuUIMsgBailan343,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan344,
                        "typeId": MinecraftItemTypes.EndCrystal,
                        "count": 6,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1400,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan345,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan346,
                        "typeId": MinecraftItemTypes.Wheat,
                        "count": 64,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan347,
                        "typeId": MinecraftItemTypes.Potato,
                        "count": 64,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan348,
                        "typeId": MinecraftItemTypes.Pumpkin,
                        "count": 32,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1800,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan349,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan350,
                        "typeId": MinecraftItemTypes.Wheat,
                        "count": 64,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan351,
                        "typeId": MinecraftItemTypes.Potato,
                        "count": 64,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan352,
                        "typeId": MinecraftItemTypes.Carrot,
                        "count": 64,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan353,
                        "typeId": MinecraftItemTypes.Beetroot,
                        "count": 64,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan354,
                        "typeId": MinecraftItemTypes.MelonBlock,
                        "count": 32,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan355,
                        "typeId": MinecraftItemTypes.Pumpkin,
                        "count": 16,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 2400,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan356,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan357,
                        "typeId": MinecraftItemTypes.CookedChicken,
                        "count": 64,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan358,
                        "typeId": MinecraftItemTypes.CookedMutton,
                        "count": 64,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan359,
                        "typeId": MinecraftItemTypes.CookedBeef,
                        "count": 64,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan360,
                        "typeId": MinecraftItemTypes.CookedRabbit,
                        "count": 16,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan361,
                        "typeId": MinecraftItemTypes.MushroomStew,
                        "count": 3,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 2200,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan362,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan363,
                        "typeId": "dec:zombie_warrior",
                        "count": 32,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan364,
                        "typeId": "dec:nether_creeper",
                        "count": 8,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan365,
                        "typeId": "dec:ender_witch",
                        "count": 6,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan366,
                        "typeId": "dec:stone_golem",
                        "count": 3,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan367,
                        "typeId": "dec:obsidian_golem",
                        "count": 2,
                        "type": "kill"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 2200,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan368,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan369,
                        "typeId": "minecraft:wither",
                        "count": 1,
                        "type": "kill"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 2400,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan370,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan371,
                        "typeId": "minecraft:pig",
                        "count": 32,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan372,
                        "typeId": "minecraft:cow",
                        "count": 64,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan373,
                        "typeId": "minecraft:sheep",
                        "count": 64,
                        "type": "kill"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 2200,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan374,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan375,
                        "typeId": MinecraftItemTypes.DiamondOre,
                        "count": 5,
                        "type": "break"
                    },
                    {
                        "name": lang.menuUIMsgBailan376,
                        "typeId": MinecraftItemTypes.CoalOre,
                        "count": 32,
                        "type": "break"
                    },
                    {
                        "name": lang.menuUIMsgBailan377,
                        "typeId": MinecraftItemTypes.GoldOre,
                        "count": 5,
                        "type": "break"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1800,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan378,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan379,
                        "typeId": MinecraftItemTypes.RabbitStew,
                        "count": 8,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan380,
                        "typeId": MinecraftItemTypes.MushroomStew,
                        "count": 8,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan381,
                        "typeId": "dec:apple_juice",
                        "count": 2,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan382,
                        "typeId": "dec:perch_cooked",
                        "count": 32,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1400,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan383,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan384,
                        "typeId": "wb:mineral_senior_equipment",
                        "count": 5,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 2800,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan385,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan386,
                        "typeId": "wb:book_cache",
                        "count": 7,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 1800,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan387,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan388,
                        "typeId": "dec:sea_urchin",
                        "count": 10,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan389,
                        "typeId": "dec:ender_fish",
                        "count": 8,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan390,
                        "typeId": "dec:a_piece_of_salmon",
                        "count": 32,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan391,
                        "typeId": "dec:gold_fish",
                        "count": 4,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan392,
                        "typeId": "dec:coal_fish",
                        "count": 4,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan393,
                        "typeId": "dec:diamond_fish",
                        "count": 2,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 2600,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            }
        ]
    }
}