
import { MinecraftEntityTypes, MinecraftItemTypes } from "../../../../modules/vanilla-data/lib/index.js";
import PomClient from "../../PomClient.js";
import { langType } from "../langType.js";
import { PomTaskJSON } from './PomTask.js';

export default function taskDaily_a(client:PomClient,lang: langType):PomTaskJSON {
    return {
        "name": lang.menuUIMsgBailan265,
        "tasks": [
            {
                "name": lang.menuUIMsgBailan266,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan267,
                        "typeId": MinecraftItemTypes.Wheat,
                        "count": 6,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan268,
                        "typeId": MinecraftItemTypes.Carrot,
                        "count": 6,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan269,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan270,
                        "typeId": MinecraftItemTypes.Potato,
                        "count": 6,
                        "type": "item"
                    },
                    {
                        "name": lang.menuUIMsgBailan271,
                        "typeId": MinecraftItemTypes.Carrot,
                        "count": 6,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan272,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan273,
                        "typeId": MinecraftItemTypes.MelonBlock,
                        "count": 12,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan274,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan275,
                        "typeId": MinecraftItemTypes.Pumpkin,
                        "count": 6,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            
            {
                "name": lang.menuUIMsgBailan276,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan277,
                        "typeId": "minecraft:zombie",
                        "count": 8,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan278,
                        "typeId": "minecraft:creeper",
                        "count": 2,
                        "type": "kill"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan279,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan280,
                        "typeId": MinecraftEntityTypes.Blaze,
                        "count": 8,
                        "type": "kill"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan281,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan282,
                        "typeId": "minecraft:pig",
                        "count": 3,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan283,
                        "typeId": "minecraft:cow",
                        "count": 3,
                        "type": "kill"
                    },
                    {
                        "name": lang.menuUIMsgBailan284,
                        "typeId": "minecraft:sheep",
                        "count": 3,
                        "type": "kill"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan285,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan286,
                        "typeId": "log",
                        "count": 16,
                        "type": "break"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan287,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan288,
                        "typeId": MinecraftItemTypes.Stone,
                        "count": 32,
                        "type": "break"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan289,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan290,
                        "typeId": MinecraftItemTypes.Apple,
                        "count": 3,
                        "aux": 0,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan291,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan292,
                        "typeId": MinecraftItemTypes.PoisonousPotato,
                        "count": 2,
                        "aux": 0,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan293,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan294,
                        "typeId": MinecraftItemTypes.RabbitStew,
                        "count": 3,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan295,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan296,
                        "typeId": MinecraftItemTypes.RottenFlesh,
                        "count": 32,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan297,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan298,
                        "typeId": MinecraftItemTypes.PumpkinPie,
                        "count": 4,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan299,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan300,
                        "typeId": "wb:book_cache",
                        "count": 1,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            },
            {
                "name": lang.menuUIMsgBailan301,
                "conditions": [
                    {
                        "name": lang.menuUIMsgBailan302,
                        "typeId": "dec:soul",
                        "count": 2,
                        "type": "item"
                    }
                ],
                "rewards": [
                    {
                        "name": lang.modExperience,
                        "count": 500,
                        "unit": lang.points,
                        "type": "integral"
                    }
                ]
            }
        ]
    }
}