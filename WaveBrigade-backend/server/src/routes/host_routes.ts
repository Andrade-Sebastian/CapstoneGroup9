import express, { Request, Response } from "express";
import {addDiscoveredDevice, getSessionState, IDevice, createSession} from "../controllers/session_controller.ts";
const app = express();
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


hostRouter.post("/session/create", (req: Request, res: Response) => {
    console.log("At /session/create | recieved: " + JSON.stringify(req.body));
    
    const hostSocketId: string = req.body.hostSocketId;

    try {
        const session = createSession({
            sessionName: req.body.sessionName,
            selectedExperimentId: req.body.selectedExperimentId,
            credentials: req.body.credentials,
            allowSpectators: req.body.allowSpectators,
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




hostRouter.post("/session/:sessionId/device_registration", (req: Request, res: Response) => {
    const session = req.params.sessionId;
    const devices: Array<IDevice> = req.body.selectedDevices;

    try {
        devices.forEach((selectedDevice: IDevice) => {
            addDiscoveredDevice(session, selectedDevice);
        })
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





hostRouter.get("/session/:sessionId", (req: Request, res: Response) => {
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