import PomClient from "../PomClient.js";
import MenuUIAlert, { MenuUIAlertView, MenuUIJson } from '../ui/MenuUIAlert.js';
import ExMessageAlert from "../../../modules/exmc/server/ui/ExMessageAlert.js";
import { Dimension, EasingType, HudElement, ItemStack, world } from '@minecraft/server';
import TalentData, { Occupation, Talent } from "../cache/TalentData.js";
import PomServer from '../PomServer.js';
import { ModalFormData } from "@minecraft/server-ui";
import Vector3 from '../../../modules/exmc/utils/math/Vector3.js';
import { langType } from './langType.js';
import ExPlayer from "../../../modules/exmc/server/entity/ExPlayer.js";
import ExErrorQueue, { to } from "../../../modules/exmc/server/ExErrorQueue.js";
import ExGameConfig from "../../../modules/exmc/server/ExGameConfig.js";
import getCharByNum, { PROGRESS_CHAR, TALENT_CHAR } from "./getCharByNum.js";
import POMLICENSE from "./POMLICENSE.js";
import MathUtil from "../../../modules/exmc/utils/math/MathUtil.js";
import ExActionAlert from "../../../modules/exmc/server/ui/ExActionAlert.js";
import WarningAlertUI from "../ui/WarningAlertUI.js";
import { pomDifficultyMap } from "./GameDifficulty.js";
import { getArmorData, hasArmorData } from "../items/getArmorData.js";
import Canvas from "../../../modules/exmc/canvas/Canvas.js";
import Bitmap from "../../../modules/exmc/canvas/Bitmap.js";
import Paint, { Style } from "../../../modules/exmc/canvas/Paint.js";
import ColorRGBA from "../../../modules/exmc/canvas/ColorRGBA.js";
import ExTerrain from "../../../modules/exmc/server/block/ExTerrain.js";
import getBlockThemeColor from '../../../modules/exmc/server/block/blockThemeColor.js';
import ExTaskRunner from "../../../modules/exmc/server/ExTaskRunner.js";
import ColorHSV from "../../../modules/exmc/canvas/ColorHSV.js";
import { eventGetter } from "../../../modules/exmc/server/events/EventHandle.js";
import { MinecraftItemTypes } from "../../../modules/vanilla-data/lib/index.js";
import { ExBlockArea } from "../../../modules/exmc/server/block/ExBlockArea.js";
import { MinecraftDimensionTypes } from "../../../modules/vanilla-data/lib/index.js";
import WorldCache from "../../../modules/exmc/server/storage/cache/WorldCache.js";
import ExEntity from "../../../modules/exmc/server/entity/ExEntity.js";
import { MinecraftCameraPresetsTypes } from "../../../modules/vanilla-data/lib/index.js";
import { MinecraftEffectTypes } from "../../../modules/vanilla-data/lib/index.js";
import ExTimeLine from "../../../modules/exmc/utils/ExTimeLine.js";
import format from "../../../modules/exmc/utils/format.js";
// import { http } from '@minecraft/server-net';

export default function menuFunctionUI(lang: langType): MenuUIJson<PomClient> {
    function tpPlayer(client: PomClient, v: Vector3, dim: string | Dimension) {

        const off = new Vector3().add(0, 5, 0).add(client.exPlayer.viewDirection.scl(-5));
        new ExTimeLine(client, {
            "0.0": () => {
                client.player.addEffect(MinecraftEffectTypes.Resistance, 20 * 6, {
                    "amplifier": 3
                });
                client.player.camera.setCamera(MinecraftCameraPresetsTypes.Free, {
                    "location": client.exPlayer.position.add(off),
                    "facingLocation": client.exPlayer.position.add(0, 1, 0),
                    "easeOptions": {
                        "easeType": EasingType.InOutSine,
                        "easeTime": 1
                    }
                });
                if (v.distance(client.player.location) > 16 * 10) {
                    client.player.camera.fade({
                        "fadeColor": ColorRGBA.BLACK.toGameRGBA(),
                        "fadeTime": {
                            "fadeInTime": 1,
                            "fadeOutTime": 1,
                            "holdTime": 3
                        }
                    });
                }
            },
            "1.0": () => {
                client.player.playSound("menu.tp.common", {
                    "volume": 1.4
                });
                client.exPlayer.setPosition(v, typeof dim === "string" ? client.getDimension(dim) : dim);
                client.player.playSound("menu.tp.common", {
                    "volume": 1.4
                });
                client.player.camera.setCamera(MinecraftCameraPresetsTypes.Free, {
                    "location": client.exPlayer.position.add(off),
                    "facingLocation": client.exPlayer.position.add(0, 1, 0),
                    "easeOptions": {
                        "easeType": EasingType.InOutSine,
                        "easeTime": 3
                    }
                });
            },
            "4.0": () => {
                client.player.camera.setCamera(MinecraftCameraPresetsTypes.Free, {
                    "easeOptions": {
                        "easeType": EasingType.InCirc,
                        "easeTime": 2
                    },
                    "facingLocation": client.exPlayer.viewDirection.add(client.exPlayer.position.add(0, 1.2, 0)),
                    "location": client.exPlayer.position.add(0, 1.2, 0)
                });
            },
            "6.0": () => {
                client.sayTo(lang.menuUIMsgBailan37);
                client.player.camera.clear();
            }
        }).start();
    }
    return {
        "main": {
            "img": "textures/items/wet_paper",
            "text": lang.menuUIMsgBailan1,
            "default": "notice",
            "page": {
                "notice": {
                    "text": lang.menuUISubtitleGonggao,
                    "page": [
                        {
                            "type": "img_adjustToScreen",
                            "msg": "textures/ui/title.png"
                        },
                        {
                            "type": "padding"
                        },
                        {
                            "type": "text",
                            "msg": lang.menuUIMsgGonggao1
                        }
                    ]
                },
                "version": {
                    "text": lang.menuUIMsgBailan5,
                    "page": (client, ui) => {
                        return (<MenuUIAlertView<PomClient>[]>[
                            {
                                "type": "text_title",
                                "msg": lang.menuUIMsgBanben1
                            },
                            {
                                "type": "text",
                                "msg": lang.menuUIMsgBanben2
                            },
                            {
                                "type": "text",
                                "msg": ExGameConfig.config.addonVersion
                            },
                            {
                                "type": "padding"
                            },
                            {
                                "type": "text_title",
                                "msg": lang.menuUIMsgBanben4
                            },
                            {
                                "type": "padding"
                            },
                            {
                                "type": "text",
                                "msg": lang.bugAndIssueLink
                            },
                            {
                                "type": "img_50x50",
                                "msg": "textures/pom_ui/github_issue.png"
                            },
                            {
                                "type": "padding"
                            },
                            {
                                "type": "text",
                                "msg": lang.noticeLink
                            },
                            {
                                "type": "img_50x50",
                                "msg": "textures/pom_ui/github.png"
                            },
                            {
                                "type": "padding"
                            },
                            {
                                "type": "text_title",
                                "msg": lang.menuUIMsgBanben6

                            },
                            {
                                "type": "padding"
                            }
                        ]).concat(MenuUIAlert.getLabelViews(lang.creatorList.split("\n")));
                    }
                },
                "imp": {
                    "text": lang.menuUIMsgBailan6,
                    "page": (client, ui) => {
                        return MenuUIAlert.getLabelViews(POMLICENSE.split("\n"));
                    }
                },
                "QA": {
                    "text": "Q & A",
                    "page": [
                        {
                            "type": "padding"
                        },
                        {
                            "type": "text_title",
                            "msg": lang.menuUIMsgBailan103
                        },
                        {
                            "type": "padding"
                        },

                        {
                            "type": "text",
                            "msg": lang.menuUIMsgBailan104
                        },
                        {
                            "type": "padding"
                        },
                        {
                            "type": "text_title",
                            "msg": lang.menuUIMsgBailan7
                        },
                        {
                            "type": "padding"
                        },

                        {
                            "type": "text",
                            "msg": lang.menuUIMsgBailan8
                        },
                        {
                            "type": "padding"
                        },
                        {
                            "type": "text_title",
                            "msg": lang.menuUIMsgBailan9
                        },
                        {
                            "type": "padding"
                        },

                        {
                            "type": "text",
                            "msg": lang.menuUIMsgBailan10
                        },
                        {
                            "type": "padding"
                        },
                        {
                            "type": "text_title",
                            "msg": lang.menuUIMsgBailan11
                        },
                        {
                            "type": "padding"
                        },

                        {
                            "type": "text",
                            "msg": lang.menuUIMsgBailan12
                        }

                    ]
                }
            }
        },
        "person": {
            "img": "textures/items/amethyst_chestplate.png",
            "text": lang.menuUIMsgBailan13,
            "default": "info",
            "page": {
                "info": {
                    "text": lang.menuUIMsgBailan14,
                    "page": (client, ui) => {
                        let source = client.player;
                        let scores = ExPlayer.getInstance(source).getScoresManager();
                        const armors = [
                            client.talentSystem.headComp,
                            client.talentSystem.chestComp,
                            client.talentSystem.legComp,
                            client.talentSystem.feetComp
                        ];
                        let armorData = 0;
                        armors.forEach(v => {
                            if (!v) return;
                            let id = ((v?.manager as ItemStack).type.id);
                            if (hasArmorData(id)) {
                                armorData += getArmorData(id);
                            } else if (v?.hasComponent("armor_protection")) {
                                armorData += v.getComponentWithGroup("armor_protection");
                            }
                        });

                        let msg = [`   ${lang.menuUIMsgBailan94}: ${client.gameId}`,
                        `   ${lang.menuUIMsgBailan96}: ${scores.getScore("wbfl")}`,
                        `   ${lang.armorProtection}: ${armorData}`,
                        `   ${lang.physicalReduction}: ${MathUtil.round(1 - (1 - client.getDifficulty().physicalDefenseAddFactor) * (1 - client.talentSystem.armor_protection[1] / 100), 3) * 100}％ + ${Math.round(client.talentSystem.armor_protection[3])}`,
                        `   ${lang.magicalReduction}: ${MathUtil.round(1 - (1 - client.getDifficulty().magicDefenseAddFactor) * (1 - client.talentSystem.armor_protection[0] / 100), 3) * 100}％ + ${Math.round(client.talentSystem.armor_protection[2])}`,
                        `   ${lang.menuUIMsgBailan97}: ${scores.getScore("wbwqlq")}`,
                        `   ${lang.menuUIMsgBailan98}: ${scores.getScore("wbkjlqcg")}`,
                        `   ${lang.menuUIMsgBailan99}: ${source.hasTag("wbmsyh") ? lang.yes : lang.no}`,
                        `   ${lang.gameDifficulty}: ${client.getDifficulty().name}`
                        ];
                        let arr: MenuUIAlertView<PomClient>[] = MenuUIAlert.getLabelViews(msg);
                        arr.unshift({
                            "type": "text_title",
                            "msg": lang.personalInformation
                        });
                        let g = client.data.gameGrade;

                        const addPoint = (num: number) => {
                            return () => {
                                for (let i = 0; i <= num; i++) {
                                    client.magicSystem.checkUpgrade();
                                }
                                return true;
                            }
                        };
                        arr.push({
                            "type": "textWithBg",
                            "msg": `${lang.menuUIMsgBailan95}: ${g} ${lang.nowExpeiencePoints}: ${client.magicSystem.getGradeNeedExperience(g) + client.data.gameExperience}/${client.magicSystem.getGradeNeedExperience(g + 1)}
${getCharByNum(client.data.gameExperience / (client.magicSystem.getGradeNeedExperience(g + 1) - client.magicSystem.getGradeNeedExperience(g)), 10, PROGRESS_CHAR)}`
                        },
                            {
                                "type": "buttonList3",
                                "msgs": ["+1", "+2", "+5"],
                                "buttons": [addPoint(1), addPoint(2), addPoint(5)]
                            });
                        return arr;
                    }
                },
                "add": {
                    "text": lang.menuUIMsgBailan19,
                    "page": [
                        // {
                        //     "type": "text_title",
                        //     "msg": lang.menuUIMsgBailan20
                        // },
                        // {
                        //     "type": "padding"
                        // },
                        // {
                        //     "type": "text",
                        //     "msg": lang.menuUIMsgBailan21
                        // },
                        // {
                        //     "type": "padding"
                        // },
                        // {
                        //     "type": "toggle",
                        //     "msg": lang.menuUIMsgBailan22,
                        //     "state": (client, ui) => client.player.hasTag("wbdjeff"),
                        //     "function": (client, ui) => {
                        //         if (!client.player.hasTag("wbdjeff")) {
                        //             client.player.addTag("wbdjeff");
                        //         } else {
                        //             client.player.removeTag("wbdjeff");
                        //         }
                        //         return true;
                        //     }
                        // },
                        // {
                        //     "type": "padding"
                        // },
                        {
                            "type": "text_title",
                            "msg": lang.menuUIMsgBailan23
                        },
                        {
                            "type": "padding"
                        },
                        {
                            "type": "text",
                            "msg": lang.menuUIMsgBailan24
                        },
                        {
                            "type": "padding"
                        },
                        {
                            "type": "button",
                            "msg": lang.menuUIMsgBailan25,
                            "function": (client, ui) => {
                                client.player.removeTag("pflame");
                                return true;
                            }
                        },
                        {
                            "type": "button",
                            "msg": lang.menuUIMsgBailan26,
                            "function": (client, ui) => {
                                client.player.removeTag("phalo");
                                return true;
                            }
                        },
                        {
                            "type": "button",
                            "msg": lang.menuUIMsgBailan27,
                            "function": (client, ui) => {
                                client.player.removeTag("prune");
                                return true;
                            }
                        },
                        {
                            "type": "button",
                            "msg": lang.menuUIMsgBailan28,
                            "function": (client, ui) => {
                                client.player.removeTag("plove");
                                return true;
                            }
                        }
                    ]
                },
                "talent": {
                    "text": lang.menuUIMsgBailan29,
                    "page": (client, ui): MenuUIAlertView<PomClient>[] => {
                        let arr: MenuUIAlertView<PomClient>[];
                        if (TalentData.hasOccupation(client.data.talent)) {
                            const canUsePoint = (client.data.gameGrade * 2 - (client.data.talent.pointUsed ?? 0));
                            arr = [
                                {
                                    "type": "text",
                                    "msg": lang.menuUIMsgBailan30 + canUsePoint
                                }
                            ];
                            for (let i of client.data.talent.talents) {
                                arr.push(
                                    {
                                        "type": "text",
                                        "msg": TalentData.getDescription(client.getLang(), client.data.talent.occupation, i.id, i.level)
                                    },
                                    {
                                        "type": "textWithBg",
                                        "msg": Talent.getCharacter(client.getLang(), i.id) + ": " + i.level + "\n" + (function () {
                                            return getCharByNum(i.level / 40, 10, TALENT_CHAR);
                                        }())
                                    });
                                let addPoint = (point: number) => {
                                    return () => {
                                        if (canUsePoint > 0 && i.level < 40) {
                                            point = Math.min(Math.min(point, 40 - i.level), canUsePoint);
                                            i.level += point;
                                            client.data.talent.pointUsed = point + (client.data.talent.pointUsed ?? 0);
                                            client.data.talent.talents.splice(client.data.talent.talents.findIndex(t => t.id === i.id), 1);
                                            client.data.talent.talents.unshift(i);
                                            client.talentSystem.updateTalentRes();
                                        }
                                        return true;
                                    }
                                };
                                arr.push(
                                    {
                                        "type": "buttonList3",
                                        "msgs": ["+1", "+2", "+5"],
                                        "buttons": [addPoint(1), addPoint(2), addPoint(5)]
                                    },
                                    {
                                        "type": "padding"
                                    });
                            }
                            if (client.data.gameGrade > (client.data.occupationChooseNum ?? 0) + 1) {
                                arr.push({
                                    "type": "button",
                                    "msg": lang.clearOccupation,
                                    "function": (client, ui) => {
                                        client.data.occupationChooseNum = (client.data.occupationChooseNum ?? 0) + 1;
                                        client.data.gameGrade -= client.data.occupationChooseNum ?? 0;
                                        client.data.talent.occupation = Occupation.EMPTY;
                                        client.data.talent.talents = [];
                                        client.data.talent.pointUsed = 0;

                                        client.magicSystem.upDateGrade();
                                        client.talentSystem.updateTalentRes();

                                        return true;
                                    }
                                });
                            }
                        } else {
                            arr = [
                                {
                                    "type": "text_title",
                                    "msg": lang.menuUIMsgBailan31
                                },
                                {
                                    "type": "padding",
                                }
                            ];
                            for (const i of Occupation.keys) {
                                arr.push({
                                    "type": "button",
                                    "msg": i.getCharacter(client.getLang()),
                                    "function": (client, ui) => {
                                        TalentData.chooseOccupation(client.data.talent, i);
                                        client.talentSystem.updateTalentRes();
                                        return true;
                                    }
                                });
                            }
                        }
                        return arr;
                    }
                },
                "back": {
                    "text": lang.menuUIMsgBailan32,
                    "page": (client, ui): MenuUIAlertView<PomClient>[] => {
                        let arr = <MenuUIAlertView<PomClient>[]>[
                            {
                                "type": "text_title",
                                "msg": lang.menuUIMsgBailan33
                            },
                            {
                                "type": "padding"
                            }
                        ]

                        if (client.globalSettings.tpPointRecord && !client.ruinsSystem.isInRuinJudge && client.territorySystem.inTerritotyLevel !== 0) {
                            client.data.pointRecord.point.sort((a, b) => (a[1] || "").localeCompare(b[1] || ""));
                            for (let j = 0; j < client.data.pointRecord.point.length; j++) {
                                const i = client.data.pointRecord.point[j];
                                const v = new Vector3(i[2]);
                                arr.push(
                                    {
                                        "type": "textWithBg",
                                        "msg": lang.menuUIMsgBailan34 + (i[0] + v.toString()) + "\n" + i[1]
                                    },
                                    {
                                        "type": "buttonList3",
                                        "msgs": [
                                            lang.menuUIMsgBailan35,
                                            lang.menuUIMsgBailan38,
                                            lang.menuUIMsgBailan40
                                        ],
                                        "buttons": [(client, ui) => {
                                            let bag = client.exPlayer.getBag();
                                            if (!bag.hasItem("wb:conveyor_issue") && client.globalSettings.tpNeedItem) {
                                                client.sayTo(lang.menuUIMsgBailan36);
                                                return false;
                                            }
                                            if (client.globalSettings.tpNeedItem) {
                                                bag.clearItem("wb:conveyor_issue", 1);
                                            }

                                            tpPlayer(client, v, i[0]);

                                            return false;
                                        },
                                        (client, ui) => {
                                            new ModalFormData().textField(lang.menuUIMsgBailan39, (i[0] + v.toString()), i[1])
                                                .show(client.player)
                                                .then(e => {
                                                    if (e.canceled) return;
                                                    i[1] = String(e?.formValues?.[0] || "");
                                                }).catch(e => {
                                                    ExErrorQueue.throwError(e);
                                                })
                                            return false;
                                        },
                                        (client, ui) => {
                                            new ExMessageAlert().title(lang.ensure)
                                                .body(`${lang.whetherToDeletePoint} ${client.data.pointRecord.point[j].map(e => typeof e === "object" ? new Vector3(e).toString() : e).join(" / ")}`)
                                                .button1(lang.yes, () => {
                                                    client.data.pointRecord.point.splice(j, 1);
                                                })
                                                .button2(lang.no, () => {
                                                })
                                                .show(client.player);
                                            return false;
                                        }
                                        ]
                                    },

                                    {
                                        "type": "padding"
                                    }
                                );
                            }
                            arr.push({
                                "msg": lang.menuUIMsgBailan41 + client.exPlayer.position.floor().toString(),
                                "type": "button",
                                "function": (client, ui) => {
                                    let nowNum = Math.max(2, Math.floor(client.data.gameGrade * client.globalSettings.tpPointRecordMaxNum / 100));
                                    if ((client.data.pointRecord.point.length ?? 0) < nowNum) {
                                        client.data.pointRecord.point.push([client.exPlayer.dimension.id, "", client.exPlayer.position.floor()]);
                                        return true;
                                    } else {
                                        client.sayTo(format(lang.menuUIMsgBailan106, nowNum));
                                        return false;
                                    }
                                }
                            });

                        } else {
                            arr.push(
                                {
                                    "type": "text",
                                    "msg": lang.menuUIMsgBailan42
                                }
                            )
                        }

                        // if (client.globalSettings.deathRecord) {
                        // 	for (let j = 0; j < client.data.pointRecord.deathPoint.length; j++) {
                        // 		let i = client.data.pointRecord.deathPoint[j];
                        // 		let v = new Vector3(i[1]);
                        // 		arr.push(
                        // 			{
                        // 				"type": "text",
                        // 				"msg": lang.menuUIMsgBailan43 + v.toString()
                        // 			},
                        // 			{
                        // 				"type": "button",
                        // 				"msg": lang.menuUIMsgBailan44 + v.toString()
                        // 			},
                        // 			{
                        // 				"type": "padding"
                        // 			}
                        // 		);
                        // 	}
                        // } else {
                        // 	arr.push(
                        // 		{
                        // 			"type": "text",
                        // 			"msg": lang.menuUIMsgBailan45
                        // 		}
                        // 	)
                        // }
                        return arr;
                    }
                },
                "deathBack": {
                    "text": lang.menuUIMsgBailan107,
                    "page": (client, ui): MenuUIAlertView<PomClient>[] => {
                        let arr = <MenuUIAlertView<PomClient>[]>[
                            {
                                "type": "text_title",
                                "msg": lang.menuUIMsgBailan108
                            },
                            {
                                "type": "padding"
                            }
                        ]
                        if (client.globalSettings.deathBackRecord && !client.ruinsSystem.isInRuinJudge && client.territorySystem.inTerritotyLevel !== 0) {
                            for (let j = 0; j < client.data.pointRecord.deathPoint.length; j++) {
                                const i = client.data.pointRecord.deathPoint[j];
                                const v = new Vector3(i[1]);
                                arr.push(
                                    {
                                        "type": "textWithBg",
                                        "msg": lang.menuUIMsgBailan34 + (i[0] + v.toString())
                                    },
                                    {
                                        "type": "button",
                                        "msg": lang.menuUIMsgBailan35,
                                        "function": (client: PomClient, ui: MenuUIAlert<PomClient>) => {
                                            let bag = client.exPlayer.getBag();
                                            if (!bag.hasItem("wb:conveyor_issue") && client.globalSettings.tpNeedItem) {
                                                client.sayTo(lang.menuUIMsgBailan36);
                                                return false;
                                            }
                                            if (client.globalSettings.tpNeedItem) {
                                                bag.clearItem("wb:conveyor_issue", 1);
                                            }
                                            tpPlayer(client, v, client.getDimension(i[0]));
                                            return false;
                                        }
                                    },

                                    {
                                        "type": "padding"
                                    }
                                );
                            }
                            arr.push(
                                {
                                    "type": "text",
                                    "msg": lang.menuUIMsgBailan109
                                }
                            )
                        } else {
                            arr.push(
                                {
                                    "type": "text",
                                    "msg": lang.menuUIMsgBailan110
                                }
                            )
                        }
                        return arr;
                    }
                },
                "territory": {
                    "text": lang.menuUIMsgBailan111,
                    "page": (client, ui) => {
                        let arr: MenuUIAlertView<PomClient>[] = [];
                        //领地参数设置
                        const num = Math.floor(client.data.gameGrade / 25);
                        const minSize = new Vector3(16, 10, 16);
                        const maxSize = new Vector3(36, 32, 36).sub(minSize).sub(4).scl((client.data.gameGrade - 25) / 75)
                            .floor().add(minSize).add(4);
                        const coolingTime = 3000;

                        arr.push({
                            "type": "text_title",
                            "msg": lang.menuUIMsgBailan112
                        });
                        client.data.territory.data = client.data.territory.data.filter(e => !(e.isRemoved && e.coolingTime === 0));
                        for (const d of client.data.territory.data) {
                            const areaMsg = client.territorySystem.territoryData?.getAreaIn(new Vector3(d.position), 2);
                            arr.push({
                                "type": "textWithBigBg",
                                "msg": `${lang.state}: ${(d.isUnderBuilding ?
                                    `${lang.isBuilding}(${d.coolingTime}s)` : (d.isRemoved ? `${lang.isDestroying}(${d.coolingTime}s)` : (areaMsg ? lang.menuUIMsgBailan113 : lang.menuUIMsgBailan114)))}
${lang.position}: ${new Vector3(d.position).toString()}
${lang.size}: ${areaMsg?.[0].getWidth().toString()}
`
                            });
                            if (areaMsg && !d.isRemoved) {
                                arr.push({
                                    "type": "buttonList3",
                                    "msgs": [lang.menuUIMsgBailan115, lang.menuUIMsgBailan116, lang.menuUIMsgBailan117],
                                    "buttons": [() => {
                                        new ExMessageAlert().title(lang.ensure)
                                            .body(`${lang.whetherDeleteTerritory} ${areaMsg[0].center()}`)
                                            .button1(lang.yes, () => {
                                                //删除服务器缓存领地，删除玩家缓存
                                                client.territorySystem.territoryData?.removeArea(areaMsg[0]);
                                                d.isRemoved = true;
                                                d.coolingTime = coolingTime;

                                                client.getServer().cache.save();
                                                client.cache.save();
                                            })
                                            .button2(lang.no, () => {
                                            })
                                            .show(client.player);
                                        return false;
                                    }, () => {
                                        client.sayTo(lang.menuUIMsgBailan118);
                                        return false;
                                    }, () => {
                                        const data = new ModalFormData()
                                            .title(lang.menuUIMsgBailan119)
                                            .dropdown(lang.menuUIMsgBailan120, [lang.menuUIMsgBailan121])
                                            .show(client.player).then(e => {
                                                if (e.canceled || !e.formValues) {
                                                    client.sayTo(lang.menuUIMsgBailan122);
                                                    return;
                                                }
                                                areaMsg[1].parIndex = e.formValues[0] as number;
                                            })
                                        return false;
                                    }]
                                })
                            }
                        }
                        if (num === 0) {
                            arr.push({
                                "type": "padding"
                            },
                                {
                                    "type": "text",
                                    "msg": lang.menuUIMsgBailan123
                                });
                        }
                        if (client.data.territory.data.length < num) {
                            arr.push({
                                "type": "padding"
                            },
                                {
                                    "type": "button",
                                    "msg": lang.menuUIMsgBailan124,
                                    "function": (client, ui) => {
                                        to((async () => {
                                            if (client.getDimension().id !== MinecraftDimensionTypes.Overworld) {
                                                client.sayTo(lang.menuUIMsgBailan125);
                                                return;
                                            }
                                            if (client.getDefaultSpawnLocation().distance(new Vector3(client.player.location)) <= 128) {
                                                client.sayTo(lang.menuUIMsgBailan126);
                                                return;
                                            }
                                            client.sayTo(lang.menuUIMsgBailan127);
                                            const p1 = new Vector3((await eventGetter(client.getEvents().exEvents.beforeItemUseOn,
                                                (e) => e.itemStack.typeId === MinecraftItemTypes.Stick)).block);
                                            const actions = client.magicSystem.registActionbarPass("facingBlockGetter");
                                            actions.push("", "");
                                            const sizeJedge = (width: Vector3) => {
                                                return width.cpy().sub(minSize).toArray().some(e => e < 0) || width.cpy().sub(maxSize).toArray().some(e => e > 0);
                                            }
                                            const facingBlockGetter = () => {
                                                const vec = new Vector3(client.player.getBlockFromViewDirection({
                                                    maxDistance: 6
                                                })?.block ?? { x: 0, y: 0, z: 0 }).floor();
                                                const area = new ExBlockArea(p1, vec, true);
                                                const width = area.getWidth();
                                                actions[0] = lang.menuUIMsgBailan128 + vec.toString();
                                                actions[1] = lang.menuUIMsgBailan129 + (sizeJedge(width) ? lang.menuUIMsgBailan130 : lang.menuUIMsgBailan131) + width.toString();
                                            }
                                            if (client.getDefaultSpawnLocation())
                                                client.getEvents().exEvents.onLongTick.subscribe(facingBlockGetter);
                                            client.sayTo(format(lang.choosePoint2, `${minSize.toString()}-${maxSize.toString()}`));
                                            const p2 = new Vector3((await eventGetter(client.getEvents().exEvents.beforeItemUseOn,
                                                (e) => e.itemStack.typeId === MinecraftItemTypes.Stick)).block);
                                            //二次判断防止转空子
                                            if (client.getDimension().id !== MinecraftDimensionTypes.Overworld) {
                                                client.sayTo(lang.menuUIMsgBailan132);
                                                return;
                                            }
                                            client.getEvents().exEvents.onLongTick.unsubscribe(facingBlockGetter);
                                            client.magicSystem.deleteActionbarPass("facingBlockGetter");

                                            const area = new ExBlockArea(p1, p2, true);
                                            if (client.getDefaultSpawnLocation().distance(area.center()) <= 196) {
                                                client.sayTo(lang.menuUIMsgBailan133);
                                                return;
                                            }
                                            const width = area.getWidth();
                                            if ((client.territorySystem.territoryData!.getAreasByNearby(area.center(), 3).some(e => e[0].contains(area)))) {
                                                client.sayTo(lang.menuUIMsgBailan134)
                                                return;
                                            }
                                            if (sizeJedge(width)) {
                                                client.sayTo(lang.menuUIMsgBailan135)
                                                return;
                                            }

                                            //成功创建，选择粒子
                                            const data = await new ModalFormData()
                                                .title(lang.menuUIMsgBailan136)
                                                .dropdown(lang.menuUIMsgBailan137, [lang.menuUIMsgBailan138])
                                                .show(client.player);
                                            if (data.canceled || !data.formValues) {
                                                client.sayTo(lang.menuUIMsgBailan139);
                                                return;
                                            }
                                            client.territorySystem.territoryData?.addArea(area, {
                                                ownerId: client.gameId,
                                                ownerName: client.playerName,
                                                parIndex: data.formValues[0] as number ?? 0
                                            });
                                            client.data.territory.data.push({
                                                isRemoved: false,
                                                isUnderBuilding: false,
                                                coolingTime: 0,
                                                mark: {},
                                                position: area.center()
                                            });

                                            client.getServer().cache.save();
                                            client.cache.save();

                                            client.sayTo(lang.menuUIMsgBailan140);
                                        })());
                                        return false;
                                    }
                                });
                        }

                        return arr;
                    }
                },
                "other": {
                    "text": lang.menuUIMsgBailan141,
                    "page": [
                        {
                            "type": "button",
                            "msg": lang.menuUIMsgBailan142,
                            "function": (client, ui) => {
                                client.taskUI();
                                return false;
                            }
                        },
                        {
                            "type": "button",
                            "msg": lang.menuUIMsgBailan144,
                            "function": (client, ui) => {
                                new ModalFormData().textField(lang.menuUIMsgBailan145, "input")
                                    .show(client.player)
                                    .then(e => {
                                        if (e.canceled)
                                            return;
                                        let cdk = String(e.formValues?.[0]);
                                        let cache = client.getGlobalData().redemptionCode;
                                        let award = cache[cdk];
                                        if (award != undefined) {
                                            if (!client.data.redemptionCode[cdk]) {
                                                client.sayTo(lang.exchangeSuccess);
                                                client.data.redemptionCode[cdk] = 1
                                                if (/^-?\d+$/.test(award.toString())) {
                                                    client.data.gameExperience += Math.floor(parseInt(award))
                                                } else {
                                                    client.exPlayer.command.runAsync(`${award}`)
                                                }
                                            } else {
                                                client.sayTo(lang.exchangeCodeHasBeenUsed);
                                            }
                                        } else {
                                            client.sayTo(lang.exchangeFailed);
                                        }
                                    }).catch(e => {
                                        ExErrorQueue.throwError(e);
                                    });
                                return false;
                            }
                        }
                    ]
                }
            }
        },
        "social": {
            "img": "textures/items/gingerbread_totem.png",
            "text": lang.menuUIMsgBailan46,
            "default": "setting",
            "page": {
                "setting": {
                    "text": lang.menuUIMsgBailan47,
                    "page": [
                        {
                            "type": "text_title",
                            "msg": lang.menuUIMsgBailan48
                        },
                        {
                            "type": "padding"
                        },
                        {
                            "type": "text",
                            "msg": lang.menuUIMsgBailan49
                        },
                        {
                            "type": "text",
                            "msg": lang.menuUIMsgBailan50
                        },
                        {
                            "type": "padding"
                        },
                        {
                            "type": "button",
                            "msg": lang.menuUIMsgBailan51,
                            "function": (client, ui) => {
                                client.player.addTag("wbmsyh");
                                if (client.player.nameTag.startsWith("§")) {
                                    client.player.nameTag = client.player.nameTag.substring(2);
                                }
                                client.player.nameTag = "§a" + client.player.nameTag;
                                return true;
                            }
                        },
                        {
                            "type": "button",
                            "msg": lang.menuUIMsgBailan48,
                            "function": (client, ui) => {
                                client.player.removeTag("wbmsyh");
                                if (client.player.nameTag.startsWith("§")) {
                                    client.player.nameTag = client.player.nameTag.substring(2);
                                }
                                client.player.nameTag = "§c" + client.player.nameTag;
                                return true;
                            }
                        }
                    ]
                },
                "tp": {
                    "text": lang.menuUIMsgBailan53,
                    "page": (client, ui) => {
                        if (!client.globalSettings.playerCanTp || client.ruinsSystem.isInRuinJudge || client.territorySystem.inTerritotyLevel === 0) {
                            return [{
                                "type": "text",
                                "msg": lang.menuUIMsgBailan54
                            }];
                        };
                        let arr: MenuUIAlertView<PomClient>[] = [];
                        arr.push({
                            "msg": lang.menuUIMsgBailan55,
                            "type": "text_title"
                        });
                        arr.push({
                            "type": "padding"
                        });
                        let players = client.getPlayersAndIds() ?? [];
                        for (const i of players) {
                            const p = ExPlayer.getInstance(i[0]);
                            arr.push({
                                "type": "button",
                                "msg": `${p.nameTag}${client.globalSettings.playerTpListShowPos ? " (pos:" + p.position.floor() + ")" : ""}`,
                                "function": (client, ui) => {
                                    let bag = client.exPlayer.getBag();
                                    if (!bag.hasItem("wb:conveyor_issue") && client.globalSettings.tpNeedItem) {
                                        client.sayTo(lang.menuUIMsgBailan36);
                                        return false;
                                    }

                                    if (client.globalSettings.tpNeedItem) {
                                        bag.clearItem("wb:conveyor_issue", 1);
                                    }
                                    client.sayTo(lang.menuUIMsgBailan57);
                                    client.runTimeout(() => {
                                        if ((<PomClient>client.getClient(i[0])).data
                                            .socialList.refuseList.filter(e => e[0] === client.gameId).length > 0) return;
                                        new ExMessageAlert().title(lang.menuUIMsgBailan58).body(format(lang.playerWantToTpYou, client.player.nameTag))
                                            .button1(lang.yes, () => {
                                                client.sayTo(lang.menuUIMsgBailan37);
                                                client.sayTo(lang.menuUIMsgBailan37, i[0]);
                                                tpPlayer(client, p.position, p.dimension);
                                            })
                                            .button2(lang.no, () => {
                                                client.sayTo(lang.menuUIMsgBailan63);
                                                client.sayTo(lang.menuUIMsgBailan64, i[0]);
                                            })
                                            .show(i[0]);
                                    }, 0);
                                    return false;
                                }
                            });
                        }
                        arr.push({
                            "msg": lang.menuUIMsgBailan65,
                            "type": "text_title"
                        });
                        arr.push({
                            "type": "padding"
                        });
                        for (const i of players) {
                            const p = ExPlayer.getInstance(i[0]);
                            arr.push({
                                "type": "button",
                                "msg": `${p.nameTag}${client.globalSettings.playerTpListShowPos ? " (pos:" + p.position.floor() + ")" : ""}`,
                                "function": (client, ui) => {
                                    let bag = client.exPlayer.getBag();
                                    if (!bag.hasItem("wb:conveyor_issue") && client.globalSettings.tpNeedItem) {
                                        client.sayTo(lang.menuUIMsgBailan36);
                                        return false;
                                    }

                                    if ((<PomClient>client.getServer().findClientByPlayer(i[0])).ruinsSystem.isInRuinJudge) {
                                        client.sayTo(lang.menuUIMsgBailan146);
                                        return false;
                                    }

                                    if (client.globalSettings.tpNeedItem) {
                                        bag.clearItem("wb:conveyor_issue", 1);
                                    }
                                    client.sayTo(lang.menuUIMsgBailan67);
                                    client.runTimeout(() => {
                                        if ((<PomClient>client.getClient(i[0])).data
                                            .socialList.refuseList.filter(e => e[0] === client.gameId).length > 0) return;
                                        new ExMessageAlert().title(lang.menuUIMsgBailan58).body(format(lang.playerInviteYouToPos, client.player.nameTag, client.exPlayer.position.floor()))
                                            .button1(lang.yes, () => {
                                                client.sayTo(lang.menuUIMsgBailan37);
                                                client.sayTo(lang.menuUIMsgBailan37, i[0]);
                                                p.setPosition(client.exPlayer.position, client.exPlayer.dimension);
                                                let c = client.getServer().findClientByPlayer(p.entity);
                                                if (c) {
                                                    tpPlayer(c as PomClient, client.exPlayer.position, client.exPlayer.dimension);
                                                }
                                            })
                                            .button2(lang.no, () => {
                                                client.sayTo(lang.menuUIMsgBailan73);
                                                client.sayTo(lang.menuUIMsgBailan74, i[0]);
                                            })
                                            .show(i[0]);
                                    }, 0);
                                    return false;
                                }
                            });
                        }
                        return arr;
                    }
                },
                "refusedlist": {
                    "text": lang.menuUIMsgBailan147,
                    "page": function (client, ui) {
                        let arr: MenuUIAlertView<PomClient>[] = [
                            {
                                "type": "text_title",
                                "msg": lang.menuUIMsgBailan148
                            }];

                        for (let a of client.data.socialList.refuseList) {
                            arr.push({
                                "type": "button",
                                "msg": "id:" + a[0] + " " + "name:" + a[1],
                                "function": (client, ui) => {
                                    client.data.socialList.refuseList = client.data.socialList.refuseList.filter((e) => e[0] !== a[0]);
                                    client.territorySystem.updateGlobalList();
                                    return true;
                                }
                            });
                        }

                        arr.push({
                            "type": "text_title",
                            "msg": lang.menuUIMsgBailan149
                        })
                        for (let a of client.getPlayersAndIds()) {
                            arr.push({
                                "type": "button",
                                "msg": "id:" + a[1] + " " + "name:" + a[0].nameTag,
                                "function": (client, ui) => {
                                    client.data.socialList.refuseList.push([a[1], a[0].name]);
                                    client.territorySystem.updateGlobalList();
                                    return true;
                                }
                            });
                        }
                        arr.push({
                            "type": "text_title",
                            "msg": lang.menuUIMsgBailan150
                        })
                        for (let a of client.data.socialList.acceptList) {
                            arr.push({
                                "type": "button",
                                "msg": "id:" + a[0] + " " + "name:" + a[1],
                                "function": (client, ui) => {
                                    client.data.socialList.acceptList = client.data.socialList.acceptList.filter((e) => e[0] !== a[0]);
                                    client.territorySystem.updateGlobalList();
                                    return true;
                                }
                            });
                        }

                        arr.push({
                            "type": "text_title",
                            "msg": lang.menuUIMsgBailan151
                        })

                        for (let a of client.getPlayersAndIds()) {
                            arr.push({
                                "type": "button",
                                "msg": "id:" + a[1] + " " + "name:" + a[0].nameTag,
                                "function": (client, ui) => {
                                    client.data.socialList.acceptList.push([a[1], a[0].name]);
                                    client.territorySystem.updateGlobalList();
                                    return true;
                                }
                            });
                        }
                        return arr;
                    }
                },
                "gradeList": {
                    "text": lang.menuUIMsgBailan152,
                    "page": (client, ui) => {
                        let arr = <MenuUIAlertView<PomClient>[]>[
                            {
                                "type": "text_title",
                                "msg": lang.menuUIMsgBailan153
                            },
                            {
                                "type": "padding"
                            }
                        ]
                        let players = client.getPlayersAndIds() ?? [];
                        for (const i of players) {
                            const p = ExPlayer.getInstance(i[0]);
                            arr.push({
                                "type": "text",
                                "msg": `${p.nameTag} : ${(<PomClient>client.getClient(i[0])).data.gameGrade}`
                            });
                        }
                        return arr;
                    }
                }
            }
        },
        "setting": {
            "img": "textures/items/artificial_meat_creator_on.png",
            "text": lang.menuUIMsgBailan75,
            "default": "personal",
            "page": {
                "personal": {
                    "text": lang.menuUIMsgBailan101,
                    "page": [
                        {
                            "type": "toggle",
                            "msg": lang.menuUIMsgBailan154,
                            "state": (client, ui) => client.data.gamePreferrence.chainMining,
                            "function": (client, ui) => {
                                client.data.gamePreferrence.chainMining = !client.data.gamePreferrence.chainMining;
                                return true;
                            }
                        },
                        {
                            "type": "button",
                            "msg": lang.menuUIMsgBailan102,
                            "function": (client, ui): boolean => {
                                new ModalFormData()
                                    .title("Choose a language")
                                    .dropdown("Language List", ["English", "简体中文"], 0)
                                    .show(client.player).then((e) => {
                                        if (!e.canceled) {
                                            client.data.lang = (e.formValues && e.formValues[0] == 0) ? "en" : "zh";
                                        }
                                    })
                                    .catch((e) => {
                                        ExErrorQueue.throwError(e);
                                    });
                                return false;
                            }
                        },
                        {
                            "type": "button",
                            "msg": lang.menuUIMsgBailan156,
                            "function": (client, ui): boolean => {
                                new ModalFormData()
                                    .title(lang.menuUIMsgBailan157)
                                    .dropdown(lang.menuUIMsgBailan158, [lang.menuUIMsgBailan159, lang.menuUIMsgBailan160, lang.menuUIMsgBailan161], client.data.uiCustomSetting.topLeftMessageBarStyle)
                                    .slider(lang.menuUIMsgBailan162, 0, 100, 1, client.data.uiCustomSetting.topLeftMessageBarLayer1)
                                    .slider(lang.menuUIMsgBailan163, 0, 100, 1, client.data.uiCustomSetting.topLeftMessageBarLayer2)
                                    .slider(lang.menuUIMsgBailan164, 0, 100, 1, client.data.uiCustomSetting.topLeftMessageBarLayer3)
                                    .slider(lang.menuUIMsgBailan165, 0, 100, 1, client.data.uiCustomSetting.topLeftMessageBarLayer4)
                                    .slider(lang.menuUIMsgBailan166, 0, 100, 1, client.data.uiCustomSetting.topLeftMessageBarLayer5)
                                    .slider(lang.menuUIMsgBailan167, 0, 100, 1, client.data.uiCustomSetting.accuracyCustom)
                                    .show(client.player).then((e) => {
                                        if (!e.canceled && e.formValues) {
                                            client.data.uiCustomSetting.topLeftMessageBarStyle = e.formValues[0] as number;
                                            client.data.uiCustomSetting.topLeftMessageBarLayer1 = e.formValues[1] as number;
                                            client.data.uiCustomSetting.topLeftMessageBarLayer2 = e.formValues[2] as number;
                                            client.data.uiCustomSetting.topLeftMessageBarLayer3 = e.formValues[3] as number;
                                            client.data.uiCustomSetting.topLeftMessageBarLayer4 = e.formValues[4] as number;
                                            client.data.uiCustomSetting.topLeftMessageBarLayer5 = e.formValues[5] as number;
                                            client.data.uiCustomSetting.accuracyCustom = e.formValues[6] as number;
                                        }
                                    })
                                    .catch((e) => {
                                        ExErrorQueue.throwError(e);
                                    });
                                return false;
                            }
                        }
                    ]
                },
                "op": {
                    "text": lang.menuUIMsgBailan76,
                    "page": (client, ui): MenuUIAlertView<PomClient>[] => {
                        if (client.player.hasTag("owner")) {
                            return [
                                {
                                    "type": "text_title",
                                    "msg": lang.menuUIMsgBailan77
                                },
                                {
                                    "type": "toggle",
                                    "msg": lang.menuUIMsgBailan78,
                                    "state": (client, ui) => client.globalSettings.playerCanTp,
                                    "function": (client, ui) => {
                                        client.globalSettings.playerCanTp = !client.globalSettings.playerCanTp;
                                        return true;
                                    }
                                },
                                {
                                    "type": "toggle",
                                    "msg": lang.menuUIMsgBailan168,
                                    "state": (client, ui) => client.globalSettings.playerTpListShowPos,
                                    "function": (client, ui) => {
                                        client.globalSettings.playerTpListShowPos = !client.globalSettings.playerTpListShowPos;
                                        return true;
                                    }
                                },
                                {
                                    "type": "toggle",
                                    "msg": lang.menuUIMsgBailan79,
                                    "state": (client, ui) => client.globalSettings.tpNeedItem,
                                    "function": (client, ui) => {
                                        client.globalSettings.tpNeedItem = !client.globalSettings.tpNeedItem;
                                        return true;
                                    }
                                },
                                {
                                    "type": "toggle",
                                    "msg": lang.menuUIMsgBailan80,
                                    "state": (client, ui) => client.globalSettings.entityCleaner,
                                    "function": (client, ui) => {
                                        client.globalSettings.entityCleaner = !client.globalSettings.entityCleaner;

                                        (<PomServer>client.getServer()).upDateEntityCleaner();

                                        return true;
                                    }
                                },
                                {
                                    "type": "toggle",
                                    "msg": lang.menuUIMsgBailan81,
                                    "state": (client, ui) => client.globalSettings.deathBackRecord,
                                    "function": (client, ui) => {
                                        client.globalSettings.deathBackRecord = !client.globalSettings.deathBackRecord;
                                        return true;
                                    }
                                },
                                {
                                    "type": "toggle",
                                    "msg": lang.menuUIMsgBailan82,
                                    "state": (client, ui) => client.globalSettings.tpPointRecord,
                                    "function": (client, ui) => {
                                        client.globalSettings.tpPointRecord = !client.globalSettings.tpPointRecord;
                                        return true;
                                    }
                                },
                                {
                                    "type": "toggle",
                                    "msg": lang.menuUIMsgBailan169,
                                    "state": (client, ui) => client.globalSettings.damageShow,
                                    "function": (client, ui) => {
                                        client.globalSettings.damageShow = !client.globalSettings.damageShow;
                                        return true;
                                    }
                                },

                                {
                                    "type": "toggle",
                                    "msg": lang.menuUIMsgBailan170,
                                    "state": (client, ui) => client.globalSettings.initialMagicPickaxe,
                                    "function": (client, ui) => {
                                        client.globalSettings.initialMagicPickaxe = !client.globalSettings.initialMagicPickaxe;

                                        client.runMethodOnEveryClient(c => c.itemUseFunc.initialMagicPickaxe());
                                        return true;
                                    }
                                },
                                {
                                    "type": "toggle",
                                    "msg": lang.menuUIMsgBailan171,
                                    "state": (client, ui) => client.globalSettings.chainMining,
                                    "function": (client, ui) => {
                                        client.globalSettings.chainMining = !client.globalSettings.chainMining;
                                        return true;
                                    }
                                },
                                {
                                    "type": "toggle",
                                    "msg": lang.menuUIMsgBailan172,
                                    "state": (client, ui) => client.globalSettings.nuclearBomb,
                                    "function": (client, ui) => {
                                        client.globalSettings.nuclearBomb = !client.globalSettings.nuclearBomb;
                                        return true;
                                    }
                                },
                                {
                                    "type": "toggle",
                                    "msg": lang.menuUIMsgBailan173,
                                    "state": (client, ui) => client.globalSettings.smallMapMode,
                                    "function": (client, ui) => {
                                        client.globalSettings.smallMapMode = !client.globalSettings.smallMapMode;

                                        return true;
                                    }
                                },
                                {
                                    "type": "button",
                                    "msg": lang.menuUIMsgBailan174,
                                    "function": (client, ui): boolean => {
                                        let map = pomDifficultyMap;
                                        new ModalFormData()
                                            .title(lang.chooseDiffycultyMode)
                                            .dropdown(lang.diffycultyList,
                                                [
                                                    map.get("1")!.name,
                                                    map.get("2")!.name,
                                                    map.get("3")!.name,
                                                    map.get("4")!.name,
                                                    map.get("5")!.name
                                                ], 2)
                                            .show(client.player).then((e) => {
                                                if (!e.canceled) {
                                                    let v = (e.formValues?.[0]);
                                                    client.globalSettings.gameDifficulty = 1 + parseFloat(v + "");
                                                    client.getServer().sayTo("Difficulty Choose " + client.getDifficulty().name);
                                                    for (let c of client.getServer().getClients()) {
                                                        (c as PomClient).talentSystem.updateTalentRes();
                                                    }
                                                }
                                            })
                                            .catch((e) => {
                                                ExErrorQueue.throwError(e);
                                            });
                                        return false;
                                    }
                                },
                                {
                                    "type": "button",
                                    "msg": lang.menuUIMsgBailan175,
                                    "function": (client, ui) => {
                                        new ExMessageAlert().title(lang.ensure).body(lang.menuUIMsgBailan215)
                                            .button1(lang.yes, () => {
                                                client.globalSettings.ruinsExsitsData = 0;
                                            })
                                            .button2(lang.no, () => { })
                                            .show(client.player);
                                        return false;
                                    }
                                },
                                {
                                    "type": "button",
                                    "msg": lang.menuUIMsgBailan176,
                                    "function": (client, ui) => {
                                        new ExMessageAlert().title(lang.ensure).body(lang.menuUIMsgBailan214)
                                            .button1(lang.yes, () => {
                                                (client.getServer() as PomServer).cleanTimes = 11;
                                                (client.getServer() as PomServer).entityCleanerLooper.start();
                                            })
                                            .button2(lang.no, () => { })
                                            .show(client.player);
                                        return false;
                                    }
                                },
                                {
                                    "type": "button",
                                    "msg": lang.menuUIMsgBailan177,
                                    "function": (client, ui) => {
                                        let cache = client.getGlobalData().redemptionCode;
                                        new ModalFormData()
                                            .title(lang.menuUIMsgBailan178)
                                            .textField(lang.menuUIMsgBailan179, lang.menuUIMsgBailan180)
                                            .dropdown(lang.menuUIMsgBailan181, [
                                                lang.menuUIMsgBailan182,
                                                lang.menuUIMsgBailan183
                                            ], 1)
                                            .textField(lang.menuUIMsgBailan184, lang.menuUIMsgBailan185)
                                            .show(client.player).then((e) => {
                                                if (!e.canceled && e.formValues) {
                                                    client.sayTo(`${lang.exchangeCode}：${e.formValues[0]}`);
                                                    client.sayTo(`${lang.rewards}：${e.formValues[2]}`);
                                                    cache[e.formValues[0] as string] = e.formValues[2] as string;
                                                }
                                            })
                                            .catch((e) => {
                                                ExErrorQueue.throwError(e);
                                            });
                                        return false;
                                    }
                                }
                            ];
                        } else {
                            return [{
                                "type": "text",
                                "msg": lang.menuUIMsgBailan83
                            }];
                        }
                    }
                },
                "set": {
                    "text": lang.menuUIMsgBailan84,
                    "page": (client, ui): MenuUIAlertView<PomClient>[] => {
                        if (client.player.hasTag("owner")) {
                            return [
                                {
                                    "type": "text_title",
                                    "msg": lang.menuUIMsgBailan186
                                },
                                {
                                    "type": "button",
                                    "msg": lang.menuUIMsgBailan85,
                                    "function": (client, ui) => {
                                        new ModalFormData()
                                            .toggle(lang.menuUIMsgBailan80, client.globalSettings.entityCleaner)
                                            .slider(lang.menuUIMsgBailan91, 40, 1000, 20, client.globalSettings.entityCleanerLeastNum)
                                            .slider(lang.menuUIMsgBailan92, 2, 10, 1, client.globalSettings.entityCleanerStrength)
                                            .slider(lang.menuUIMsgBailan93, 1, 60, 1, client.globalSettings.entityCleanerDelay)
                                            .toggle(lang.menuUIMsgBailan187, client.globalSettings.entityShowMsg)

                                            .textField(lang.menuUIMsgBailan188, `{"xxx":1}`, JSON.stringify(client.getGlobalData().entityCleanerSetting.acceptListByTypeId))
                                            .textField(lang.menuUIMsgBailan189, `{"134":1}`, JSON.stringify(client.getGlobalData().entityCleanerSetting.acceptListById))
                                            .show(client.player).then((e) => {
                                                if (e.canceled || !e.formValues) return;
                                                client.globalSettings.entityCleaner = Boolean(e.formValues?.[0] ?? false);
                                                client.globalSettings.entityShowMsg = Boolean(e.formValues?.[4] ?? false);
                                                client.globalSettings.entityCleanerLeastNum = Number(e.formValues?.[1] ?? 200);
                                                client.globalSettings.entityCleanerStrength = Number(e.formValues?.[2] ?? 5);
                                                client.globalSettings.entityCleanerDelay = Number(e.formValues?.[3] ?? 30);

                                                const input1 = String(e.formValues[5]), input2 = String(e.formValues[6]);
                                                if (input2 !== "")
                                                    try {
                                                        client.getGlobalData().entityCleanerSetting.acceptListById = JSON.parse(input2);
                                                    } catch (e) {
                                                        client.sayTo(lang.menuUIMsgBailan190)
                                                    }
                                                if (input1 !== "")
                                                    try {
                                                        client.getGlobalData().entityCleanerSetting.acceptListByTypeId = JSON.parse(input1);
                                                    } catch (e) {
                                                        client.sayTo(lang.menuUIMsgBailan191)
                                                    }
                                                client.sayTo(lang.menuUIMsgBailan192)
                                            })
                                            .catch((e) => {
                                                ExErrorQueue.throwError(e);
                                            })
                                        return false;
                                    }
                                },
                                {
                                    "type": "button",
                                    "msg": lang.menuUIMsgBailan193,
                                    "function": (client, ui) => {
                                        to((async () => {

                                            client.sayTo(lang.menuUIMsgBailan194);
                                            const e = (await eventGetter(client.getEvents().exEvents.afterPlayerHitEntity,
                                                (e) => e.hurtEntity.isValid() && client.exPlayer.getBag().itemOnMainHand?.typeId === MinecraftItemTypes.Stick));
                                            ExEntity.getInstance(e.hurtEntity).addHealth(client, e.damage);
                                            client.getGlobalData().entityCleanerSetting.acceptListById[e.hurtEntity.id] = 1
                                            client.sayTo(lang.menuUIMsgBailan195 + e.hurtEntity.id);


                                        })());
                                        return false;
                                    }
                                },
                                {
                                    "type": "button",
                                    "msg": lang.menuUIMsgBailan196,
                                    "function": (client, ui) => {
                                        to((async () => {

                                            client.sayTo(lang.menuUIMsgBailan197);
                                            const e = (await eventGetter(client.getEvents().exEvents.afterPlayerHitEntity,
                                                (e) => e.hurtEntity.isValid() && client.exPlayer.getBag().itemOnMainHand?.typeId === MinecraftItemTypes.Stick));
                                            ExEntity.getInstance(e.hurtEntity).addHealth(client, e.damage);
                                            client.getGlobalData().entityCleanerSetting.acceptListByTypeId[e.hurtEntity.typeId] = 1
                                            client.sayTo(lang.menuUIMsgBailan198 + e.hurtEntity.typeId);

                                        })());
                                        return false;
                                    }
                                },
                                {
                                    "type": "button",
                                    "msg": lang.menuUIMsgBailan199,
                                    "function": (client, ui): boolean => {
                                        let map = pomDifficultyMap;
                                        new ModalFormData()
                                            .title(lang.menuUIMsgBailan200)
                                            .slider(lang.menuUIMsgBailan201, 4, 20, 1, 4)
                                            .slider(lang.menuUIMsgBailan202, 1, 5, 1, 2)
                                            .show(client.player).then((e) => {
                                                if (!e.canceled) {
                                                    let v = (e.formValues?.[0]);
                                                    client.globalSettings.uiUpdateDelay = Number(v ?? 8);
                                                    client.globalSettings.uiDataUpdateDelay = Number(v ?? 2);
                                                    client.magicSystem.actionbarShow.stop();
                                                    client.magicSystem.actionbarShow.delay(client.globalSettings.uiUpdateDelay);
                                                    client.magicSystem.actionbarShow.start();
                                                }
                                            })
                                            .catch((e) => {
                                                ExErrorQueue.throwError(e);
                                            });
                                        return false;
                                    }
                                },
                                {

                                    "type": "button",
                                    "msg": lang.menuUIMsgBailan203,
                                    "function": (client, ui): boolean => {
                                        let map = pomDifficultyMap;
                                        new ModalFormData()
                                            .title(lang.menuUIMsgBailan204)
                                            .slider(lang.menuUIMsgBailan205, 0, 99, 1, client.data.gameGrade)
                                            .slider(lang.menuUIMsgBailan206, 0, 990000, 10000, client.data.gameExperience)
                                            .show(client.player).then((e) => {
                                                if (!e.canceled && e.formValues) {
                                                    client.data.gameGrade = Number(e.formValues?.[0] ?? 0);
                                                    client.data.gameExperience = Number(e.formValues?.[1] ?? 0);
                                                    client.magicSystem.upDateGrade();
                                                }
                                            })
                                            .catch((e) => {
                                                ExErrorQueue.throwError(e);
                                            });
                                        return false;
                                    }
                                },
                                {
                                    "type": "button",
                                    "msg": lang.setMaxTpPoint,
                                    "function": (client, ui): boolean => {
                                        new ModalFormData()
                                            .title(lang.setMaxTpPoint)
                                            .slider(lang.setMaxTpPoint, 1, 60, 1, client.globalSettings.tpPointRecordMaxNum)
                                            .show(client.player).then((e) => {
                                                if (!e.canceled && e.formValues) {
                                                    client.globalSettings.tpPointRecordMaxNum = Number(e.formValues?.[0] ?? 0);
                                                }
                                            })
                                            .catch((e) => {
                                                ExErrorQueue.throwError(e);
                                            });
                                        return false;
                                    }
                                },
                                {
                                    "type": "padding"
                                }
                            ];
                        } else {
                            return [{
                                "type": "text",
                                "msg": lang.menuUIMsgBailan83
                            }];
                        }
                    }
                },
                "gradeOrg": {
                    "text": lang.menuUIMsgBailan207,
                    "page": (client, ui): MenuUIAlertView<PomClient>[] => {
                        if (client.player.hasTag("owner")) {
                            let arr = <MenuUIAlertView<PomClient>[]>[
                                {
                                    "msg": lang.menuUIMsgBailan208,
                                    "type": "text_title"
                                },
                                {
                                    "type": "padding"
                                }
                            ]
                            let players = client.getPlayersAndIds() ?? [];
                            for (const i of players) {
                                const p = ExPlayer.getInstance(i[0]);
                                arr.push({
                                    "type": "button",
                                    "msg": `${p.nameTag} : ${(<PomClient>client.getClient(i[0])).data.gameGrade}`,
                                    "function": (client, ui): boolean => {
                                        client.runTimeout(() => {
                                            new ModalFormData()
                                                .title(lang.menuUIMsgBailan209)
                                                .slider(lang.menuUIMsgBailan210, 0, 99, 1, (<PomClient>client.getClient(i[0])).data.gameGrade)
                                                .show(client.player).then((e) => {
                                                    if (e.canceled)
                                                        return;
                                                    (<PomClient>client.getClient(i[0])).data.gameGrade = Number(e.formValues?.[0] ?? 0);
                                                    (<PomClient>client.getClient(i[0])).magicSystem.upDateGrade();
                                                })
                                                .catch((e) => {
                                                    ExErrorQueue.throwError(e);
                                                });
                                        }, 0);
                                        return false;
                                    }
                                });
                            }
                            return arr;
                        } else {
                            return [{
                                "type": "text",
                                "msg": lang.menuUIMsgBailan83
                            }];
                        }
                    }
                },
                "general": {
                    "text": lang.menuUIMsgBailan211,
                    "page": [
                        {
                            "type": "button",
                            "msg": lang.menuUIMsgBailan212,
                            "function": (client, ui) => {
                                new WarningAlertUI(client, ExErrorQueue.getError(), [[lang.menuUIMsgBailan213, (client, ui) => {
                                }]]).showPage();
                                return false;
                            }
                        }
                    ]
                },
                "canvas": {
                    "text": "test",
                    "page": [
                        {
                            "type": "button",
                            "msg": "test",
                            "function": (client, ui) => {
                                updateScore();
                                async function updateScore() {
                                    // XMLHttpRequest
                                    // await http.get("http://baidu.com/").then(e => ExGameConfig.console.info(e.body));
                                }
                                return false;
                            }
                        },
                        {
                            "type": "button",
                            "msg": "test",
                            "function": (client, ui) => {
                                const canvas = new Canvas(new Bitmap(200, 200));
                                const paint = new Paint();
                                const terrain = new ExTerrain(client.getDimension());
                                const pos = client.exPlayer.position.floor();

                                paint.strokeWidth = 1;
                                paint.style = Style.FILL;

                                const num = client.globalSettings.smallMapMode ? 128 : 32
                                const step = 2
                                let centerX = 100, centerY = 100;
                                let perSize = centerX / num * 2 ** 0.5;

                                canvas.rotateRad(180 - client.exPlayer.rotation.y, centerX, centerY);

                                const task = new ExTaskRunner(client);
                                task.setTasks(function* () {
                                    const highMap = new Map<string, [number, ColorRGBA]>();
                                    for (let x = -num; x <= num; x += step) {
                                        for (let y = -num; y <= num; y += step) {
                                            try {
                                                let block = terrain.getSurfaceBlock(pos.x + x, pos.z + y);
                                                let b = getBlockThemeColor(block?.typeId ?? '');
                                                highMap.set(x + "|" + y, [block?.y ?? 0, b]);
                                                yield 0;
                                            } catch {

                                            }
                                        }
                                    }
                                    for (let x = -num; x <= num; x += step) {
                                        for (let y = -num; y <= num; y += step) {
                                            if (!highMap.has(x + "|" + y)) continue;
                                            let [high, b] = highMap.get(x + "|" + y)!;
                                            let fhsv = b.toHSV();
                                            let hsv: ColorHSV;
                                            if (
                                                (highMap.get((x - step) + "|" + y)?.[0] ?? 0) > high ||
                                                (highMap.get(x + "|" + (y - step))?.[0] ?? 0) > high
                                            ) {
                                                hsv = new ColorHSV(fhsv.h, fhsv.s, Math.max(fhsv.v - 20, 0))
                                            } else if (
                                                (highMap.get((x - step) + "|" + y)?.[0] ?? 0) < high ||
                                                (highMap.get(x + "|" + (y - step))?.[0] ?? 0) < high
                                            ) {
                                                hsv = new ColorHSV(fhsv.h, Math.max(fhsv.s - 20, 0), Math.min(fhsv.v + 20, 100))
                                            } else {
                                                hsv = fhsv;
                                            }
                                            paint.color = hsv.toRGB();
                                            canvas.drawRect(
                                                centerX + perSize * x - 1,
                                                centerY + perSize * y - 1,
                                                step * perSize + 1,
                                                step * perSize + 1,
                                                paint);
                                            yield 0;
                                        }
                                    }
                                });

                                task.start(1, 10000).then(() => {
                                    const layers = canvas.draw();

                                    let xui = new ExActionAlert()
                                        .title("__pomAlertCanvas")
                                        .button("canvasLayer1", () => { }, layers.layer1)
                                        .button("canvasLayer2", () => { }, layers.layer2)
                                        .button("canvasLayer3", () => { }, layers.layer3)
                                        .button("canvasLayer4", () => { }, layers.layer4)
                                        .button("canvasLayer5", () => { }, layers.layer5)
                                        .button("canvasLayer6", () => { }, layers.layer6)
                                        .body("_uiBody");
                                    xui.show(client.player);
                                });
                                return false;
                            }
                        },
                        {
                            "type": "img_notice_wp"
                            // "function": (client, ui) => {
                            //     new ExActionAlert().title("11").body("111")
                            //         .button("11", () => { }, "ftp://45.153.129.23:22224/bg5.png")
                            //         .show(client.player);
                            //     return false;
                            // }
                        }
                    ]
                }
            }
        }
    }
}


