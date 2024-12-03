import express, { Request, Response } from "express";
import {addDiscoveredDevice, getSessionState, IDevice, createSession} from "../controllers/session_controller.ts";
const app = express();
const joinerRouter = express.Router();
joinerRouter.use(express.json());


joinerRouter.post("/join", (req: Request, res: Response) => {
    console.log("At /join | recieved: " + JSON.stringify(req.body));
    
    const joinerSocketId: string = req.body.joinerSocketId;

    try {
        const session = joinSession({
            joinerName: req.body.joinerName
        }, hostSocketId)
        return res.status(200).send(session)
    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.name === "EXPERIMENT_NOT_FOUND")
                return res.status(400).send({
                    error: error.name,
                    message: error.message
                });
            else {
                return res.status(400).send({
                    message: error.message
                })
            }
        }
    }
})

joinerRouter.get("/session/:sessionId", (req: Request, res: Response) => {
    const session = req.params.sessionId;
    try {
        return res.status(200).send(getSessionState(session))
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === "SESSION_NOT_FOUND") {
                return res.status(400).send({
                    error: error.name,
                    message: error.message
                })
            }
        }
    }
})
export default hostRouter;