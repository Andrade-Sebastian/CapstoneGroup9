import express, {Request, Response} from 'express';
import {ILab, IExperiment} from "../controllers/session_controller.ts";
import { getAllExperiments, createExperiment, updateExperiment, deleteExperiment, viewExperiment } from "../controllers/experiment_controller.ts";


export const experimentRouter = express.Router();
experimentRouter.use(express.json());


// get experiments array
experimentRouter.get("/", (req: Request, res: Response) => {
    try {
        const experiments = getAllExperiments()

        res.status(200).send(experiments);


    } catch (error) {
    res.status(500).send({error: error.message})
}})

experimentRouter.get("/debug", (req: Request, res: Response) => {    
    console.log("(experiment_routes.ts): at /debug")
    res.status(200).send("Experiment route is working")
})

//unravel the body message sent from frontend
//frontend has to send a body message so that we can update experiments
//The functions within these routes need parameters

//create experiment
experimentRouter.post("/create", (req: Request, res: Response) => {
    try{
        const{name, description} = req.body;
        const newExperiment = createExperiment(name, description);
        res.status(201).send(newExperiment);
    } catch(error){
        res.status(500).send({error: error.message});
    }
});


experimentRouter.put("/update/:id", (req: Request, res: Response) => {
    try{
        const {id} = req.params;
        const {description, experimentTemplate, name} = req.body;
        const updatedExperiment = updateExperiment(id, description, experimentTemplate, name);
        res.status(200).send(updatedExperiment);

    }catch(error){
        res.status(500).send({error: error.message});
    }
});

experimentRouter.delete("/delete/:id", (req: Request, res: Response) => {
    try{
        const {id} = req.params;
        deleteExperiment(id);
        res.status(200).send();
    }catch(error){
        res.status(500).send({error: error.message});
    }
});

experimentRouter.get("/view/:id", (req: Request, res: Response) => {
    try{
        const {id} = req.params;
        const experiment = viewExperiment(id);
        res.status(200).send(experiment);
    }catch{
        res.status(404).send({error: error.message});
    }
});



export default experimentRouter;