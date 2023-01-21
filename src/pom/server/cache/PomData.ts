
import Vector3 from "../../../modules/exmc/math/Vector3.js";
import TalentData from "./TalentData.js";

export default class PomData {
    licenseRead?:boolean;

    talent: TalentData = new TalentData();
    occupationChooseDate?: number;

    pointRecord?: {
        deathPoint: [string, Vector3][];
        point: [string, string, Vector3][]
    };

    tasks?: {
        daily:{
            complete:number[][],
            all:number[][],
            date:string,
            cache:{
                [x:string]:number;
            }
        },
        progress:{
            complete:string[],
            data:{
                [x:string]:number;
            }
        }
    }

    dimBackPoint: Vector3 | undefined;
    dimBackMode: number | undefined;

    lang?: "en" | "zh";

}