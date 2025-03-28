import express, {Request, Response} from 'express';
import {ILab, IExperiment} from "../controllers/session_controller.ts";
import { createExperiment } from "../controllers/database.ts";
import { getAllExperiments, updateExperiment, deleteExperiment, viewExperiment } from "../controllers/experiment_controller.ts";


export const experimentRouter = express.Router();
experimentRouter.use(express.json());


// get experiments array
//not used as of 2/14
// experimentRouter.get("/debug", (req: Request, res: Response) => {
//     try {
//         const experiments = getAllExperiments()

//         res.status(200).send({"message": "in experiments debug"});


//     } catch (error) {
//     res.status(500).send({error: error.message})
// }})

//unravel the body message sent from frontend
//frontend has to send a body message so that we can update experiments
//The functions within these routes need parameters

//create experiment
experimentRouter.post("/create", async (req: Request, res: Response) => {
    console.log("/create experiment")
    console.log("req.body: ", req.body)
    try{
        const{description, name} = req.body;
        const newExperiment = await createExperiment(name, description);
        console.log("IN ROUTE: ", newExperiment);
        res.status(201).send(newExperiment);
    } catch(error){
        console.log("error in create experiment")
        res.status(500).send({error: error.message});
    }
});

//for future purposes
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

//for future purposes
experimentRouter.delete("/delete/:id", (req: Request, res: Response) => {
    try{
        const {id} = req.params;
        deleteExperiment(id);
        res.status(200).send();
    }catch(error){
        res.status(500).send({error: error.message});
    }
});

//for future purposes ?
experimentRouter.get("/view/:id", (req: Request, res: Response) => {
    try{
        const {id} = req.params;
        const experiment = viewExperiment(id);
        res.status(200).send(experiment);
    }catch{
        res.status(404).send({error: error.message});
    }
});

experimentRouter.get("/validate-brainflow", (req: Request, res: Response) => {
    try{
        console.log("Receieved request at /validate-brainflow")
        const isBrainFlowValid = true;
        if (isBrainFlowValid){
            res.status(200).send({success: true, message: "Brainflow validation successful"})
        }
        else{
            return res.status(400).send({success: false, error: error.message})
        }
    }
    catch(error){
        console.error("Error validating brainflow", error)
        return res.status(500).send({success: false, error: error.message})
    }
})



export default experimentRouter;