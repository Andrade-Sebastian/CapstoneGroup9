import express, { Request, Response } from "express";
import {addDiscoveredDevice, getSessionState, IDevice, createSession, joinSession, joinRoom, leaveRoom} from "../controllers/session_controller.ts";
import SessionManager from "../sessions_singleton.ts";
import { addSocketToSession, removeSocket, getSessionBySocket, socketSessionMap } from "../sessionMappings.ts";
import axios from "axios";
import {addUserToSession, getUsersFromSession, validateRoomCode, removeUserFromSession, valideDeviceSerial } from "../controllers/database.ts";
const app = express();
const joinerRouter = express.Router();
joinerRouter.use(express.json());
/*
 .  .  .    .    .  .   .
.  .   .    .   .      .
"When a joiner joins.."
.   .  .   .  . .    .  . 
 . . . .  . .  .   .  . . 
*/

//stored procedure
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



//roomcode, nickname, 
joinerRouter.post("/session/join", async (req: Request, res: Response) => {
    const {
        socketID,
		nickname, 
		roomCode,
		serialNumberLastFour
	} = req.body;

    try{
        await addUserToSession({
            "socketID": socketID,
            "nickname": nickname,
            "roomCode": roomCode,
            "serialNumberLastFour": serialNumberLastFour
        }).then(() => {
            console.log("User successfully added to session")
            return res.status(200).send("In /session/join");
        }
        )
    }
    catch(error){
        console.log("Unable to add user ", error)
    }

}
)

//uses singleton chicken -> stored procedure
joinerRouter.post("/join-session/:requestedSessionId/:socketId", (req: Request, res: Response) => {
    const requestedSessionId = req.params.requestedSessionId;
    const socketId = req.params.socketId;
    console.log("URL PARAM:", requestedSessionId, socketId)

    //Get session at sessionID
    //find the 'users' array
    //"MODIFY" the array by pushing an IUser

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
        
        const users = getUsersFromSession(sessionID);
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

joinerRouter.get("/validateRoomCode/:roomCode", async (req: Request, res: Response) => {
    const roomCode = req.params.roomCode;
    console.log("Roomcode: ", roomCode);
    
    try
    {
        const isValidRoomCode = await validateRoomCode(roomCode); //if the roomcode is valid, returns true
        if (isValidRoomCode)
        {
            return res.status(200).json({ "isValidRoomCode": true});
        }
    }
    catch(error)//postgres will return an error if the roomcode does not exist for the specified session,
                //so we assume that it is not a valid room code
    {
        return res.status(201).json({
            "isValidRoomCode": false,
            "error": error
        })
    }

    
})

joinerRouter.post("/leave-room/:sessionID/:socketID", (req: Request, res: Response) => {
    const sessionID = req.params.sessionID;
    const socketID = req.params.socketID;
    
    
    try {
        const users = removeUserFromSession(sessionID, socketID);

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

//stored procedure
joinerRouter.post("/verify-serial", async (req: Request, res: Response) => {
    console.log("Request received at /verify-serial:", req.body);
    const {nickName, roomCode, serialCode } = req.body;
    //change this later to the correct serial code implementation
    const validSerial = await valideDeviceSerial(nickName, roomCode, serialCode);
    const validSerialCode = "1234";
    if (serialCode === validSerialCode){
        return res.status(200).json({ success:true });
    }
    else{
        return res.status(400).json({success: false, message: "Invalid code"});
    }
});

//CHICKEN -> store procedure ?
joinerRouter.get("/debug", (req: Request, res: Response) => {
    console.log("in /debug")

    const sessions = SessionManager.getInstance().listSessions()
    //console.log("Live sessions: " + JSON.stringify(sessions))

    res.status(200).send({
        message: "in joiner",
        liveSessions: sessions
    })
})


import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
export const dbClient = new Client({
  user: "postgres",
  database: "WB_Database",
  password: "postgres",
  hostname: "wb-backend-database",
  port: 5432,
});

//change to function
joinerRouter.get("/session/getInfo/:roomCode", async (req: Request, res: Response) => {
    console.log("In joiner/session/getInfo/:roomCode")

    const roomCode = req.params.roomCode;

    try{
        await dbClient.connect()
        
        const query = await dbClient.queryObject(`SELECT 
            sessionid, 
            experimentid, 
            roomcode, 
            hostsocketid,
            starttimestamp, 
            ispasswordprotected,
            isspectatorsallowed,
            endtimestamp
            FROM SESSION WHERE roomcode = '${roomCode}'`);
            
        const result = query.rows[0] as {
            experimentid: string,
            roomcode: string,
            hostsocketid: string,
            starttimestamp: string,
            ispasswordprotected: boolean,
            isspectatorsallowed: boolean,
            endtimestamp: string | null
        };

        return res.status(200).send(result)

    } 
    catch(error: unknown)
    {
        console.log(error);
        return res.status(500).send(error);
    }
    finally 
    {
        await dbClient.end();
    }

})






export default joinerRouter;




