import express, { Request, Response } from "express";
import {addDiscoveredDevice, getSessionState, IDevice, createSession, joinSession} from "../controllers/session_controller.ts";
import SessionManager from "../sessions_singleton.ts";
const app = express();
const joinerRouter = express.Router();
joinerRouter.use(express.json());


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

joinerRouter.post("/join-session/:requestedSessionId/:socketId", (req: Request, res: Response) => {
    const requestedSessionId = req.params.requestedSessionId;
    const socketId = req.params.socketId;
    console.log("URL PARAM:", requestedSessionId, socketId)
    console.log("SESSIONS: " + JSON.stringify(SessionManager.getInstance().listSessions()))
    try{    
        res.status(200).send(joinSession(requestedSessionId, socketId))
    }
    catch(error: unknown){
        res.status(500).send("Server Error")
        throw new Error("Could not join session")
    }
    
    }
)

joinerRouter.get("/debug", (req: Request, res: Response) => {
    const sessions = SessionManager.getInstance().listSessions()
    console.log(sessions)
    res.status(500).send(sessions)
})


export default joinerRouter;