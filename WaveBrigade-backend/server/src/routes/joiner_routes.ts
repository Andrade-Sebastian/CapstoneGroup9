import express, { Request, Response } from "express";
import {getSessionState} from "../controllers/session_controller.ts";
import { addSocketToSession } from "../sessionMappings.ts";
import {addUserToSession, getUsersFromSession, validateRoomCode, removeUserFromSession, validDeviceSerial, validatePassword, getPhotoLabInfo, getVideoLabInfo, joinSessionAsSpectator, removeSpectatorFromSession} from "../controllers/database.ts";
import {Filter} from "npm:bad-words";
import dbClient from "../controllers/dbClient.ts";

const app = express();
const joinerRouter = express.Router();
joinerRouter.use(express.json());
const filter = new Filter();


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

joinerRouter.get("/session/allows-spectators/:sessionId", async (req: Request, res: Response) => {
    const sessionID = req.params.sessionId;

    try{

        const query = await dbClient.queryObject(`SELECT isspectatorsallowed FROM SESSION WHERE sessionid = '${sessionID}'`);

        if(query.rows.length === 0){
            return res.status(400).send({
                "message": "Session not found for sessionID: " + sessionID
            })
        }

    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
    finally{    
    }
    
    return res.status(200).send({
        "allowsSpectators": true
    });
})




//roomcode, nickname, 
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
        addSocketToSession(socketID, session.joiner_sessionid);
        console.log(session);
        return res.status(200).send(session);
    }
    catch(error){
        console.log("Unable to add user ", error)
    }

})



joinerRouter.get("/room-users/:sessionID", async (req: Request, res: Response) => {
    const sessionID = req.params.sessionID;

    try{
        const users = await getUsersFromSession(sessionID);
        return res.status(200).send({
            "users":users
        });

    }
    catch(error){
        if (error instanceof Error && error.name === "SESSION_NOT_FOUND") {
            return res.status(400).send({
                error: error.name,
                message: error.message
            });
        }
    }
        
        // getUsersFromSession(sessionID)
        // .then(users => {
        //     console.log("/room-users/:sessionID USERS: ", users),
        //     res.status(200).send({
        //         "users": users
        //     })
        // })
        // .catch(error => {
        //     if (error instanceof Error && error.name === "SESSION_NOT_FOUND") {
        //             res.status(400).send({
        //                 error: error.name,
        //                 message: error.message
        //             });
        //     }
        //     res.status(500).send({
        //         error: "INTERNAL_SERVER_ERROR",
        //         message: "An unexpected error occurred."
        //     });
        // });
        // Fallback error response
        return res.status(500).send({
            error: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred."
        });
});

joinerRouter.get("/check-name/:nickName", async (req: Request, res: Response) => {
    const name = req.params.nickName;
    console.log("/check-name/:nickName, nickname: ", name);
    
    try{
        const isProfane = filter.isProfane(name);
        if(!isProfane){
            return res.status(200).json({success: true})
        }
        else{
            return res.status(400).json({success: false, message: "No profane words allowed!"});
        }
    } catch(error){
        return res.status(500).json({success: false, message: "Internal server error"});
    }
})

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


joinerRouter.post("/leave-room", async (req: Request, res: Response) => {
    console.log("In leave-room");
    
    const {
        sessionID,
        socketID
    } = req.body;
    console.log("In /leave-room, recieved", req.body)
    

    try {
        const users = await removeUserFromSession(sessionID, socketID);

        return res.status(200).send({
            "message": "in /leave-room",
            "sessionID": sessionID,
            "socketID": socketID,
        });
    } catch (error) {
        

        // Fallback error response
        return res.status(500).send({
            error: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred."
        });
    }
});

//stored procedure
joinerRouter.post("/verify-serial", async(req: Request, res: Response) => {
    console.log("Request received at /verify-serial:", req.body);
    const {nickName, roomCode, serialCode } = req.body;


    try{
    //change this later to the correct serial code implementation
        const validSerialCode = await validDeviceSerial(nickName, roomCode, serialCode);
        console.log("Valid serial code: ", validSerialCode);
        if (validSerialCode){
            const deviceID = validSerialCode.deviceid
            return res.status(200).json({success: true, deviceID: deviceID});
        }
        else{
            return res.status(400).json({success: false, message: "Invalid code"});
        }
    }
    catch(error){
        console.log("Error occured", error);
    }
});





//change to function
joinerRouter.get("/session/getInfo/:roomCode", async (req: Request, res: Response) => {
    console.log("In joiner/session/getInfo/:roomCode")
    
    const roomCode = req.params.roomCode;
    
    try{
        
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

joinerRouter.get("/getVideoFile/:experimentID", async (req: Request, res: Response) => {
    console.log("In joiner/getVideoFile/:experimentID", req.body);
    
    const experimentID = req.params.experimentID;
    
    try{
        const videoFileInfo = await getVideoLabInfo(experimentID);
        return res.status(200).send(videoFileInfo);
        
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
        
        if (isValidRoomCode === true) {
            return res.status(200).json({ 
                sessionID: sessionID
            })
        }else{
            return res.status(404).send({
                sessionID: null
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
        else{
            return res.status(400).json({success: false})
        }
    }
    catch(error){
        return res.status(401).json({success: false, message: "Invalid password"});
    }
});


joinerRouter.post("/join-as-spectator", async (req: Request, res: Response) => {
    console.log("I am in /join-as-spectator")
    const {
        socketID,
        nickname,
        roomCode,
    } = req.body;

    let spectatorInfo = null

    try{
        const {
            isValidRoomCode,
            sessionID
        } = await validateRoomCode(roomCode); // inspected - keep
        
        
        if(isValidRoomCode){

            try{ //change might be here 
                spectatorInfo = await joinSessionAsSpectator(socketID, nickname, roomCode);

            }catch(error){
                console.log("Error adding user to the session", error)
            }
            
        }
        else{
            console.log("(joiner_routes.ts): Invalid room code");
            
            res.status(500).send({
                "message": "Could not add Spectator to the session",
                "reason": "Invalid Room Code"
            })
        }

    }catch(error){
        console.log(error);
        res.status(500).send({
            "message": "Could not add Spectator to the session"
        })
    }


    res.status(200).send(spectatorInfo);
})




joinerRouter.get("/debug", (req: Request, res: Response) => {

    res.status(200).send({
        message: "in joiner"
    })

})


joinerRouter.post("/remove-spectator-from-session", async(req: Request, res: Response) => {
    const {
        sessionID,
        socketID
    } = req.body;

    
    const wasRemoved = await removeSpectatorFromSession(sessionID, socketID);
    
    if(wasRemoved){
        res.status(200).send({
            "message": "In joiner/remove-spectator-from-session",
            "recieved": req.body,
            "Success": true
        })
    }
    else{
        res.status(404).send({
            "message": `User with socketID ${socketID} was not found in session ${sessionID}`
        })
    }

})


export default joinerRouter;




