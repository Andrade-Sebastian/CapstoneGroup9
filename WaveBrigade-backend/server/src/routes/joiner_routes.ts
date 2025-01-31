import express, { Request, Response } from "express";
import {addDiscoveredDevice, getSessionState, IDevice, createSession, joinSession, joinRoom, leaveRoom} from "../controllers/session_controller.ts";
import SessionManager from "../sessions_singleton.ts";
import { addSocketToSession, removeSocket, getSessionBySocket, socketSessionMap } from "../sessionMappings.ts";
import axios from "axios";
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

joinerRouter.get("/room-users/:sessionID", (req: Request, res: Response) => {
    const sessionID = req.params.sessionID;

    try {
        const users = getSessionState(sessionID).users;
        return res.status(200).send({
            "users": users
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === "SESSION_NOT_FOUND") {
                return res.status(400).send({
                    error: error.name,
                    message: error.message
                });
            }
        }

        // Fallback error response
        return res.status(500).send({
            error: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred."
        });
    }
});



// import socketSessionMap from "../sessionMappings.ts";
joinerRouter.post("/join-room", (req: Request, res: Response) => {
    const {sessionID, socketID, nickname, associatedDevice} = req.body;
    
    
    console.log("(joiner_routes.ts): at '/join-room', received: " + JSON.stringify(req.body));
    addSocketToSession(socketID, sessionID)

    console.log("socketMapping: " + JSON.stringify(socketSessionMap))
    
    //join the room
    joinRoom(sessionID, socketID, nickname, associatedDevice)
    
    return res.status(200).json({ message: "Successfully Joined session"});
    
    
})

joinerRouter.get("/validateRoomCode/:roomCode", (req: Request, res: Response) => {
    const roomCode = req.params.roomCode;
    const liveSessions = SessionManager.getInstance().listSessions()
    
    for (const sessionId in liveSessions) {
        if (liveSessions[sessionId].roomCode === roomCode) {
            console.log("(validateRoomCode): SessionID " + JSON.stringify(liveSessions[sessionId].sessionId))
            return res.status(200).json({ 
                message: "Successfully Validated room code",
                sessionID: liveSessions[sessionId].sessionId
            });// Return the matching session
        }
    }
    
    return res.status(500).json({ message: "Room Code does not match up with an active session"});
    
})

//IN DEVELOOPMENT
joinerRouter.post("/leave-room/:sessionID/:socketID", (req: Request, res: Response) => {
    const sessionID = req.params.sessionID;
    const socketID = req.params.socketID;
    
    // users: Array<IUser>;

    
    try {
        const sessionInfo = getSessionState(sessionID);

        
        //console.log("Users: " + JSON.stringify(sessionInfo.users));
        leaveRoom(sessionID, socketID)
        
        //sessionInfo.users.findIndex
        //remove user from sessionInfo with the socketID provided in the params

        //Free up EmotiBit if possible (do last)
        return res.status(200).send({
            "message": "in /remove-user",
            "sessionID": sessionID,
            "socketID": socketID
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.name === "SESSION_NOT_FOUND") {
                return res.status(400).send({
                    error: error.name,
                    message: error.message
                });
            }
        }

        // Fallback error response
        return res.status(500).send({
            error: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred."
        });
    }

})

joinerRouter.post("/verify-code", (req: Request, res: Response) => {
    console.log("Request received at /verify-code:", req.body);
    const {nickName, roomCode, serialCode } = req.body;
    //change this later to the correct serial code implementation
    const validSerialCode = "1234";
    if (serialCode === validSerialCode){
        return res.status(200).json({ success:true });
    }
    else{
        return res.status(400).json({success: false, message: "Invalid code"});
    }
});

joinerRouter.get("/debug", (req: Request, res: Response) => {
    console.log("in /debug")
    const sessions = SessionManager.getInstance().listSessions()
    //console.log("Live sessions: " + JSON.stringify(sessions))

    res.status(200).send({
        message: "in joiner",
        liveSessions: sessions
    })
})


export default joinerRouter;