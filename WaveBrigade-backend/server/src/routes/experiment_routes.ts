import express, {Request, Response} from 'express';
import {ILab, IExperiment} from "../controllers/session_controller.ts";
import { getAllExperiments } from "../controllers/experiment_controller.ts";
export const experimentRouter = express.Router();
experimentRouter.use(express.json());


// get experiments array
experimentRouter.get("/", (req: Request, res: Response) => {
    
    //your logic goes here...});


try {
    const experiments = getAllExperiments()
    
    res.status(200).send(experiments);

    
} catch (error) {
    res.status(500).send(error)
}})

export default experimentRouter;;