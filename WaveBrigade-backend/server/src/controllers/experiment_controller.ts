import {ILab, IExperiment} from "../controllers/session_controller.ts";
import experimentRouter from "../routes/experiment_routes.ts";



// export interface ILab {
//     id: string;
//     name: string;
//     iconPath?: string;
// }

const labs: Array<ILab> = [
    {
        id: "0",
        name: "Gallery Lab"
    },
    {
        id: "1",
        name: "Video Lab"
    },
    {
        id: "3",
        name: "Picture Lab"
    }
]

// export interface IExperiment {
//     id: string;
//     description: string;
//     labTemplate: ILab;
//     experimentTemplate: unknown;
// }

const experiments: Array<IExperiment> = [
    {
        id: "0",
        labTemplate: labs[0],
        description: "Super cool lab of Your Mom.",
        experimentTemplate: {}
    }, 
]

//returns a list of experiments 
export function getAllExperiments(page: number = 1, size: number = 10){

    return experiments;

}