import express, { Request, Response } from "express";
import {addDiscoveredDevice, getSessionState, IDevice, createSession, joinSession, joinRoom, leaveRoom} from "../controllers/session_controller.ts";
import SessionManager from "../sessions_singleton.ts";
import { addSocketToSession, removeSocket, getSessionBySocket, socketSessionMap } from "../sessionMappings.ts";
import axios from "axios";
import {addUserToSession, getUsersFromSession, validateRoomCode, removeUserFromSession, validDeviceSerial, validatePassword, getPhotoLabInfo} from "../controllers/database.ts";
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




joinerRouter.post("/session/join", async (req: Request, res: Response) => {
    console.log("In /session/join: ", req.body);
    const {
        socketID,
		nickname, 
		roomCode,
		serialNumberLastFour,
        deviceID
	} = req.body;

    try{
        const session = await addUserToSession(
        {
            "socketID": socketID,
            "nickname": nickname,
            "roomCode": roomCode,
            "serialNumberLastFour": serialNumberLastFour,
            "deviceID": deviceID
        });
        console.log(session);
        return res.status(200).send(session);
    }
    catch(error){
        console.log("Unable to add user ", error)
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

import passport from "npm:passport";
import jwt from "npm:jsonwebtoken";
import LocalStrategy from "npm:passport-local";
import { verifyUserExists } from "../controllers/database.ts";

passport.use(new LocalStrategy.Strategy({
    usernameField: 'userID',
    passwordField: 'socketID'
},
async function (userID, socketID, done) {
    console.log("Authenticating user userid=", userID, " socketid=",  socketID);

    try {
        const user = await verifyUserExists(userID, socketID);
        console.log("User found: ", user);

        if (user) {
            console.log("User found");
            return done(null, user); // ✅ Pass the user object if found
        } else {
            console.log("User not found");
            return done(null, false); // ✅ No user found
        }
    } catch (error) {
        return done(error); // ✅ Handle errors
    }
}))


import { generateToken } from "../auth.ts";

//stored procedure -- HERE
joinerRouter.post("/verify-serial", async (req: Request, res: Response, next: Function) => {
    console.log("Request received at /verify-serial:", req.body);
    const {nickName, roomCode, serialCode } = req.body;
    

    try{
        // console.log("Before")
        const validDeviceID = await validDeviceSerial(nickName, roomCode, serialCode);
        // console.log("After ", validDeviceID)

        if (!validDeviceID){
            
            console.log("Invalid code")
            return res.status(400).json({success: false, message: "Invalid code"});
        }


        console.log("Valid code, starting authentication", validDeviceID)
        if (validDeviceID)
        {
            // const deviceID = validDeviceID.deviceid;
            // console.log("Hello um :p Device ID is ", JSON.stringify(deviceID))
            
            passport.authenticate("local", { session: false }, async (err: any, user: any) => {
                //user is a boolean, not a user object
                console.log("Inside Passport callback -- user object is: ", user);
        
                if (err) {
                    console.error("Authentication error:", err);
                    return res.status(500).send({ message: "Authentication error" });
                }

                if (user) {  // If authentication is good, the user will be false.
                    console.log("User is null");
                    return res.status(403).send({ message: "Invalid credentials" });
                }

                await verifyToken(req, res, generateToken);
                const token = await generateToken(user);

                console.log("token: ", token);

                console.log("User authenticated successfully: ", user);
                console.log("-----------------");

                return res.status(200).send({
                    "verified": true,
                    "token":token
                });
                })(req, res, verifyToken);  // Call the function with the request, response, and next middleware
    
        }

    }catch(error){
            console.log("ERROR", error);
            return res.status(500).json({success: false, message: "Invalid code"});
        }
});

import { verifyToken } from "../auth.ts";

joinerRouter.get("/protected", verifyToken, (req, res) => {
    res.json({ message: "You have access!", user: req.user });
});

    //     //     passport.authenticate("local", {session: false}, (user) => {
    //     //         if (user === null){
    //     //             res.status(403).send()
    //     //         }
    //     //         else{
    //     //             req.login(user, {session: false}, (err) => {
    //     //                 if (err){
    //     //                     res.send(err)
    //     //                 }
    //     //                 // const token = jwt;
    //     //                 return res.json({success: true, deviceID: deviceID});
    //     //             })
    //     //         }
            
    //     //     })
    //     // }
    //     // else{
    //     //     return res.status(400).json({success: false, message: "Invalid code"});
    //     // }
    // }
    // catch(error){
    //     console.log("Error occured", error);
    // }


joinerRouter.get("/debug", (req: Request, res: Response) => {
    console.log("in /debug")

    res.status(200).send({
        message: "in joiner"
    })
})


import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import { IUserIdentity } from "../controllers/database.ts";
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

joinerRouter.get("/getPhoto/:experimentID", async (req: Request, res: Response) => {
    console.log("In joiner/getPhoto/:experimentID", req.body);

    const experimentID = req.params.experimentID;

    try{
        const photoInfo = await getPhotoLabInfo(experimentID);
        return res.status(200).send(photoInfo);

    }
    catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
})

joinerRouter.get("/verify-code/:roomCode", async (req: Request, res: Response) => {
    const roomCode  = req.params.roomCode;
    console.log("Room Code: ", roomCode);


    try {
        const {
            isValidRoomCode,
            sessionID
        } = await validateRoomCode(roomCode);

        //check the 
        if (isValidRoomCode) {
            return res.status(200).json({ 
                sessionID: sessionID
             })
        }
    } catch (error) {
        return res.status(400).json({ error: error });
    }
});

joinerRouter.post("/validatePassword", async (req: Request, res: Response) => {
    console.log("In /validatePassword", req.body);
    const {sessionID, password} = req.body;

    try{
        const isValidPassword = await validatePassword(sessionID, password);
        if(isValidPassword){
            return res.status(200).json({success: true})
        }
    }
    catch(error){
        return res.status(400).json({success: false, message: "Invalid password"});
    }
});

export default joinerRouter;




