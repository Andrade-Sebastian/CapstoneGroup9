import express, { Request, Response } from "npm:express";
import {addDiscoveredDevice, getSessionState, IDevice, createSession} from "../controllers/session_controller.ts";
import { createSessionInDatabase } from "../controllers/database.ts";

const hostRouter = express.Router();
hostRouter.use(express.json());





/*
What will be sent:
{
    "sessionName": "Awesome", "selectedExperimentId": "17", "allowSpectators": true, "credentials": {
        "passwordEnabled": false, "password": ""
    }
}


What you receive:
{
    "sessionId": "f0c79422",
    "sessionName": "Awesome",
    "configuration": {
        "allowSpectators": false,
        "maskEnabled": false,
        "focusedUser": null,
        "experiment": {
            "id": "17",
            "labTemplate": {
                "id": "20",
                "name": "Gallery Lab"
            }
        }
    },
    "discoveredDevices": [],
    "isInitialized": false,
    "users": []
}*/


hostRouter.post("/session/create", async (req: Request, res: Response) => {
    console.log("At /session/create | recieved: " + JSON.stringify(req.body));
    
    console.log("(host_routes.ts): Creating session");

    try {
        const session = await createSessionInDatabase(
        {
            experimentID: req.body.selectedExperimentId,
            roomCode: req.body.roomCode,
            hostSocketID: req.body.hostSocketId,
            startTimeStamp: req.body.startTimeStamp,
            isPasswordProtected: req.body.isPasswordProtected,
            password: req.body.password,
            isSpectatorsAllowed: req.body.isSpectatorsAllowed,
            endTimeStamp: req.body.endTimeStamp
        });
            console.log("(host_routes.ts): Finished creating session");
            return res.status(200).send(session);
        }
    catch(error) {
        console.log("error in create session", error);
        //return res.status(400).send({error: error.message});
        // if (error instanceof Error) {
        //     if (error.name === "EXPERIMENT_NOT_FOUND"){
        //         console.log("Experiment not found")
        //         console.log("Error 1 ", )
        //         return res.status(400).send({
        //             error: error.name,
        //             message: error.message
        //         });}
        //     else {
        //         console.log("Error 2")
        //         return res.status(400).send({
        //             message: error.message
        //         })
        //     }
        // }
    }
})

hostRouter.get("/debug", async (req: Request, res: Response) => {
    console.log("At debug | recieved: " + JSON.stringify(req.body));
    
    return res.status(200).send({
        message: "Connected to express server"})
})

export default hostRouter;


// hostRouter.post("/session/:sessionId/device_registration", (req: Request, res: Response) => {
//     const session = req.params.sessionId;
//     const devices: Array<IDevice> = req.body.selectedDevices;

//     try {
//         devices.forEach((selectedDevice: IDevice) => {
//             addDiscoveredDevice(session, selectedDevice);
//         })
//         return res.status(200).send(getSessionState(session))
//     } catch (error) {
//         if (error instanceof Error) {
//             if (error.name === "SESSION_NOT_FOUND") {
//                 return res.status(400).send({
//                     error: error.name,
//                     message: error.message
//                 })
//             }
//         }
//     }
// })





// hostRouter.get("/session/:sessionId", (req: Request, res: Response) => {
//     const session = req.params.sessionId;
//     try {
//         return res.status(200).send(getSessionState(session))
//     } catch (error) {
//         if (error instanceof Error) {
//             if (error.name === "SESSION_NOT_FOUND") {
//                 return res.status(400).send({
//                     error: error.name,
//                     message: error.message
//                 })
//             }
//         }
//     }
// })

