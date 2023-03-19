import { GameMode, MinecraftEntityTypes } from '@minecraft/server';
import { Player, Entity } from '@minecraft/server';
import ExCommand from '../env/ExCommand.js';
import { to } from "../ExErrorQueue.js";
import ExEntity from "./ExEntity.js";
import ExGameVector3 from '../math/ExGameVector3.js';
import ExPlayerBag from './ExPlayerBag.js';
import ExScoresManager from './ExScoresManager.js';


export default class ExPlayer extends ExEntity {
    private bag;
    private scoresManager;

    override get entity(){
        return super.entity as Player;
    }
    override set entity(e:Player){
        super.entity = e;
    }

    setGameMode(mode: GameMode) {
        switch(mode){
            case GameMode.survival: this.runCommandAsync(`gamemode 0`); break;
            case GameMode.creative: this.runCommandAsync(`gamemode 1`); break;
            case GameMode.adventure: this.runCommandAsync(`gamemode 2`); break;
            case GameMode.spectator: this.runCommandAsync(`gamemode 3`); break;
        }
        
    }
    getGameMode(): GameMode {
        let c = GameMode.creative;
        c = (Array.from(this.getDimension().getPlayers({
            location: this.entity.location,
            closest: 1,
            maxDistance: 1,
            gameMode: GameMode.adventure
        }))?.[0] === this.entity ? GameMode.adventure : c);
        c = (Array.from(this.getDimension().getPlayers({
            location: this.entity.location,
            closest: 1,
            maxDistance: 1,
            gameMode: GameMode.creative
        }))?.[0] === this.entity ? GameMode.creative : c);
        c = (Array.from(this.getDimension().getPlayers({
            location: this.entity.location,
            closest: 1,
            maxDistance: 1,
            gameMode: GameMode.spectator
        }))?.[0] === this.entity ? GameMode.spectator : c);
        c = (Array.from(this.getDimension().getPlayers({
            location: this.entity.location,
            closest: 1,
            maxDistance: 1,
            gameMode: GameMode.survival
        }))?.[0] === this.entity ? GameMode.survival : c);

        return c;
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
    public get selectedSlot() {
        return this.entity.selectedSlot;
    }
    public set selectedSlot(value: number) {
        this.entity.selectedSlot = value;
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
            return entity[this.propertyNameCache];
        }
        return (entity[this.propertyNameCache] = new ExPlayer(entity));
    }

    override getScoresManager(): ExScoresManager {
        return this.scoresManager;
    }
}