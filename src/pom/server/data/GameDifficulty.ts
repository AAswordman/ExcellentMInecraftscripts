export interface GameDifficulty {
    name: string;
    id: string;
    healthAddionion: number;
    physicalDefenseAddFactor: number;
    magicDefenseAddFactor: number;
    damageAddFactor: number;
    magicpointAddFactor: number;
    coolingFactor: number;
    LevelFactor: number;
}

export class PomGameFoolDifficulty implements GameDifficulty {
    name = "Fool";
    id = "0";
    healthAddionion = 20;
    physicalDefenseAddFactor = 0.4;
    magicDefenseAddFactor = 0.3;
    damageAddFactor = 2;
    magicpointAddFactor = 2.5;
    coolingFactor = 2;
    LevelFactor = 8;
}
export class PomGameEasyDifficulty implements GameDifficulty {
    name = "Easy";
    id = "1";
    healthAddionion = 10;
    physicalDefenseAddFactor = 0.2;
    magicDefenseAddFactor = 0.1;
    damageAddFactor = 1.3;
    magicpointAddFactor = 1.5;
    coolingFactor = 1.3;
    LevelFactor = 4;
}
export class PomGameNormalDifficulty implements GameDifficulty {
    name = "Normal(original)";
    id = "2";
    healthAddionion = 0;
    physicalDefenseAddFactor = 0;
    magicDefenseAddFactor = 0;
    damageAddFactor = 1;
    magicpointAddFactor = 1;
    coolingFactor = 1;
    LevelFactor = 1;
}
export class PomGameHardDifficulty implements GameDifficulty {
    name = "Difficult";
    id = "3";
    healthAddionion = -20;
    physicalDefenseAddFactor = 0;
    magicDefenseAddFactor = 0;
    damageAddFactor = 0.8;
    magicpointAddFactor = 0.8;
    coolingFactor = 0.8;
    LevelFactor = 0.9;
}
const _pomDifficultyMap = new Map<string, GameDifficulty>();
_pomDifficultyMap.set("0", new PomGameFoolDifficulty());
_pomDifficultyMap.set("1", new PomGameEasyDifficulty());
_pomDifficultyMap.set("2", new PomGameNormalDifficulty());
_pomDifficultyMap.set("3", new PomGameHardDifficulty());

export const pomDifficultyMap = _pomDifficultyMap;
