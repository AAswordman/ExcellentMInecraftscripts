import { Dimension, EffectType, GameMode } from '@minecraft/server';
import { Player, Entity } from '@minecraft/server';
import ExCommand from '../env/ExCommand.js';
import { to } from "../ExErrorQueue.js";
import ExEntity from "./ExEntity.js";
import ExPlayerBag from './ExPlayerBag.js';
import ExScoresManager from './ExScoresManager.js';
import { IVector2 } from '../../utils/math/Vector2.js';
import Vector3 from '../../utils/math/Vector3.js';
import ExGameConfig from '../ExGameConfig.js';
import ExGame from '../ExGame.js';
import ExSystem from '../../utils/ExSystem.js';


export default class ExPlayer extends ExEntity {

    private bag;
    private scoresManager;

    override get entity() {
        return super.entity as Player;
    }
    override set entity(e: Player) {
        super.entity = e;
    }
    gamemodeMap = {
        "0": GameMode.survival,
        "1": GameMode.creative,
        "2": GameMode.adventure,
        "3": GameMode.spectator,
        [GameMode.survival]: 0,
        [GameMode.creative]: 1,
        [GameMode.adventure]: 2,
        [GameMode.spectator]: 3
    }
    set gameModeCode(gameMode: number) {
        this.gamemode = this.gamemodeMap[gameMode as (0 | 1 | 2 | 3)];
    }
    get gameModeCode(): number {
        return this.gamemodeMap[this.gamemode];
    }
    set gamemode(mode: GameMode) {
        this.entity.setGameMode(mode);
    }
    get gamemode(): GameMode {
        return this.entity.getGameMode();
    }


    public title(title: string, subtitle?: string) {
        // this.runCommandAsync(`titleraw @s title {"rawtext":[{"text":"${title}"}]}`);
        // if (subtitle) this.runCommandAsync(`titleraw @s subtitle {"rawtext":[{"text":"${subtitle}"}]}`);
        this.entity.onScreenDisplay.setTitle(title);
        if (subtitle) this.entity.onScreenDisplay.updateSubtitle(subtitle);
    }
    public titleActionBar(str: string) {
        //this.runCommandAsync(`titleraw @s actionbar {"rawtext":[{"text":"${str}"}]}`);
        this.entity.onScreenDisplay.setActionBar(str);
    }
    public get selectedSlotIndex() {
        return this.entity.selectedSlotIndex;
    }
    public set selectedSlotIndex(value: number) {
        this.entity.selectedSlotIndex = value;
    }

    override get viewDirection() {
        return super.viewDirection;
    }
    override set viewDirection(ivec: Vector3) {
        this.teleport(this.position, {
            "rotation": {
                x: ivec.rotateAngleX(),
                y: ivec.rotateAngleY()
            }
        })
    }

    override setPosition(position: Vector3, dimension?: Dimension) {
        this.entity.teleport(position, {
            "dimension": dimension
        });
    }
    override get rotation() {
        return super.rotation;
    }
    override set rotation(ivec: IVector2) {
        this.teleport(this.position, {
            "rotation": ivec
        });
    }

    protected constructor(player: Player) {
        super(player);
        this.bag = new ExPlayerBag(this);
        this.scoresManager = super.getScoresManager();
    }

    public override getBag() {
        return this.bag;
    }

    static override getInstance(source: Player): ExPlayer {
        let entity = <any>source;
        if (this.propertyNameCache in entity) {
            // ExGameConfig.console.log("Property id " + (entity as Player).name + "//" + (ExSystem.getId((entity[this.propertyNameCache] as ExPlayer).entity) == ExSystem.getId(entity)))
            // ExGameConfig.console.log("Property == " + (entity[this.propertyNameCache] as ExPlayer).entity == entity)
            // if((entity[this.propertyNameCache] as ExPlayer).entity != entity) (entity[this.propertyNameCache] as ExPlayer).entity = entity;
            return entity[this.propertyNameCache];
        }
        return (entity[this.propertyNameCache] = new ExPlayer(entity));
    }
    static deleteInstance(source: any) {
        delete source[this.propertyNameCache]
    }

    override getScoresManager(): ExScoresManager {
        return this.scoresManager;
    }
}