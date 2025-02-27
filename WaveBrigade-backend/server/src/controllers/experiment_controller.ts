import {ILab, IExperiment} from "../controllers/session_controller.ts";
import experimentRouter from "../routes/experiment_routes.ts";


const folderName = "/media";
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
        id: generateRandomCode(6), //function for creating id
        name: "video lab",
        labTemplate: labs[0], 
        description: "A steaming hot lab comparing your mom's size to the size of Mike Tyson's oily cheeks", 
        experimentTemplate: {}
    }, 
]

//returns a list of experiments 
export function getAllExperiments(page: number = 1, size: number = 10){

    return experiments;

}

export function generateRandomCode(length: number){
    const numbers = '0123456789';
    let lobbyCode = '';
    for (let i = 0; i < length; i++){
        lobbyCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return lobbyCode;
}

//given a file's hex & photo lab {id}, 
//save the photo lab image to directory /media/photo-lab/photo-lab-{id}

export async function savePhotoLabImage(photoLabId: string, file: string){
    const imageName = `${photoLabId}.png`;
    const imagePath = `${folderName}/photo-lab/${imageName}`;
    //use a file writer to write the file to the directory given hex code

    //file writer 
    //node directory functions 
    
    //save file to directory
    const imageFile = await Deno.create(imagePath);

    return imagePath;
}


export function createExperiment(templateId: string, description: string, experimentTemplate: {}, name: string){
    const newExperiment = {
        id: "6", //function for creating id
        name: name,
        labTemplate: template, 
        description: description,
        experimentTemplate: experimentTemplate
    }
    experiments.push(newExperiment)

    return newExperiment;
}


export function updateExperiment (experimentId: string, newDescription: string, newTemplate: {}, newName: string) {
    let updatedExperiment = labs[int(experimentId)];
    updatedExperiment.name = newName;
    updatedExperiment.description = newDescription;
    updatedExperiment.experimentTemplate = newTemplate;
    return updatedExperiment
}

export function deleteExperiment(experimentId: string){
    const experimentIndex = experiments.findIndex(exp => exp.id === experimentId);

    if(experimentIndex !== -1){
        experiments.splice(experimentIndex, 1);
    }
    else{
        throw new Error("Experiment not found.")
    }
    // currentExperiment = labs[int(experimentId)];
    // delete currentExperiment
}



export function viewExperiment(experimentId: string){
    if(labs[int(experimentId)] === undefined){
        throw new Error("Experiment not found");
    }
    else{
        return labs[int(experimentId)];
    }
}