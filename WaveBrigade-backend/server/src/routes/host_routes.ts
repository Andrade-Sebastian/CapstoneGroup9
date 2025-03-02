import express, { Request, Response } from "npm:express";
import { createSessionInDatabase, registerDevice, IRegisterDeviceInfo, assignExperimentToSession} from "../controllers/database.ts";
import { red } from "https://deno.land/std@0.160.0/fmt/colors.ts";

const hostRouter = express.Router();
hostRouter.use(express.json());


//Author: Emanuelle Pelayo 
//Purpose: Creates a new session in the database
//Returns: The session that was created (JSON)
hostRouter.post("/session/create", async (req: Request, res: Response) => {

    try {

        const session = await createSessionInDatabase(
        {
            hostSocketID: req.body.hostSocketID,
            isPasswordProtected: req.body.isPasswordProtected,
            password: req.body.password,
            isSpectatorsAllowed: req.body.isSpectatorsAllowed,
        });

        return res.status(200).send(session);
    }
    catch(error) {
        console.log("Error adding session to database", error);
    }
})


hostRouter.get("/debug", async (req: Request, res: Response) => {
    console.log("At debug | recieved: " + JSON.stringify(req.body));
    
    return res.status(200).send({
        message: "Connected to express server"})
})


//done
hostRouter.post("/register-device", async(req: Request, res: Response) => {
    const {
        sessionID, 
        serialNumber,
        ipAddress,
        deviceSocketID
    } = req.body;

    if (!sessionID || !serialNumber || !ipAddress || !deviceSocketID) {
        return res.status(400).send({
            message: "Missing required fields"
        });
    }
    registerDevice(req.body);
    

    return res.status(200).send({
        "message": "In /host/register-device"
    })
})

hostRouter.post("/send-experiment", (req: Request, res: Response) => {
    try{

        //const { experimentTitle, experimentDesc, experimentId } = req.body;
        return res.status(200).send(req.body)

    }
    catch(error){
        console.error("Error receiving experiment data", error)
        return res.status(400).send({success: false, message: "Error receiving data"})
    }


})
export default hostRouter;




