import { Entity, world } from '@minecraft/server';
import ExNullEntity from "./ExNullEntity.js";
import ExGameConfig from '../ExGameConfig.js';


export default class ExScoresManager {

    entity: Entity | ExNullEntity;

    constructor(e: Entity | ExNullEntity) {
        this.entity = e;
    }
    getIdentity(objective: string) {
        if (this.entity instanceof ExNullEntity) {
            const e = this.entity;
            return world.scoreboard.getObjective(objective).getScores().find(i => i.participant.displayName === e.nameTag)?.participant;
        } else {
            return this.entity.scoreboardIdentity;
        }
    }
    getScore(objective: Objective | string): number {
        let name = typeof objective === "string" ? objective : objective.name;
        let id = this.getIdentity(name);
        if (!id) return 0;
        try { return world.scoreboard.getObjective(name).getScore(id) } catch (e) {
            return 0;
        };
    }
    setScore(objective: Objective | string, num: number): boolean {
        let name = typeof objective === "string" ? objective : objective.name;
        let id = this.getIdentity(name);
        if (!id && this.entity instanceof ExNullEntity) {
            this.entity.runCommandAsync(`scoreboard players set ${'"' + this.entity.nameTag + '"'} ${name} ${num}`);
        }
        if (!id) return false;
        world.scoreboard.getObjective(name).setScore(id, num);
        return true;
    }
    addScore(objective: Objective | string, num: number) {
        return this.setScore(objective, this.getScore(objective) + num);
    }
    removeScore(objective: Objective | string, num: number) {
        return this.setScore(objective, this.getScore(objective) - num);
    }
    deleteScore(objective: Objective | string): boolean {
        const name = typeof objective === "string" ? objective : objective.name;
        const identity = this.getIdentity(name);
        if (!identity) return false;
        world.scoreboard.getObjective(name).removeParticipant(identity);
        return true;
    }

}
export class Objective {
    name: string;
    constructor(name: string) {
        this.name = name;
    }

    create(showName: string) {
        try {
            world.scoreboard.addObjective(this.name, showName);
        } catch (e) { }
        return this;
    }
    delete() {
        world.scoreboard.removeObjective(this.name);
    }
    setDisplay(mode = "sidebar", ascending = true) {
        if (mode == "sidebar") {
            ExGameConfig.runCommandAsync(`scoreboard objectives setdisplay ${mode} ${this.name} ${ascending ? "ascending" : "descending"}`);
        } else {
            ExGameConfig.runCommandAsync(`scoreboard objectives setdisplay ${mode} ${this.name}`);
        }
        return this;
    }
}