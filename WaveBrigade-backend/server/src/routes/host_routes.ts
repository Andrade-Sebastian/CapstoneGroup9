import express, { query, Request, Response } from "npm:express";
import { createSessionInDatabase, registerDevice, getUserExperimentData, updateDeviceConnection, getSessionDevices } from "../controllers/database.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import dbClient from "../controllers/dbClient.ts";

const hostRouter = express.Router();
let experimentData = {}
const saltRounds = 10;

hostRouter.use(express.json());



//Author: Emanuelle Pelayo 
//Purpose: Creates a new session in the database
//Returns: The session that was created (JSON)
hostRouter.post("/session/create", async (req: Request, res: Response) => {


    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(req.body.password, salt);

        const session = await createSessionInDatabase(
        {
            hostSocketID: req.body.hostSocketID,
            isPasswordProtected: req.body.isPasswordProtected,
            password: hash,
            isSpectatorsAllowed: req.body.isSpectatorsAllowed,
        });

        return res.status(200).send(session);
    }
    catch(error) {
        console.log("Error adding session to database", error);
    }
})


//Purpose: Debugging route to check if the server is running
//Returns: A message to let the user know that the server is running
hostRouter.get("/debug", async (req: Request, res: Response) => {
    console.log("At debug | recieved: " + JSON.stringify(req.body));
    
    return res.status(200).send({message: "Connected to express server"});
})


//Purpose: Register a device in the database
//Returns: A message to let the user know that the device was registered
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

    await registerDevice(req.body);
    

    return res.status(200).send({
        "message": "In /host/register-device",
        "created": true
    })
})


//Purpose: Removes a device from the database
//Returns: A boolean value to let the user know if the device was removed. 
//True if the device was removed, false if the device was not removed
hostRouter.post("/remove-device", async (req: Request, res: Response) => {
    const {
        serialNumber,
        ipAddress
    } = req.body;

    console.log("Request received at /remove-device", req.body);


    if ( !serialNumber || !ipAddress) {
        return res.status(400).send({
            message: "Missing required fields, expected sessionID, serialNumber, ipAddress, deviceSocketID"
        });
    }

    try{
        const getDeviceIDquery =  await dbClient.queryObject(`
            SELECT deviceid FROM device WHERE serialnumber = $1 AND ipaddress = $2`
            , [serialNumber, ipAddress])
        
        const deviceID = getDeviceIDquery.rows[0]?.deviceid
        console.log("IJIJIJIJIIJ deviceid: " + deviceID)

        const getAssociatedUserQuery = await dbClient.queryObject(
            `SELECT userid FROM "User" WHERE device = $1`, [deviceID]
        )

        const userID = getAssociatedUserQuery.rows[0]?.userid
        console.log("IJIJIJIJIIJ userid: " + userID)

        //remove the device from the user
        const removeDeviceFromUserQuery = await dbClient.queryObject(`
            UPDATE "User" SET device = null WHERE userid = $1
            `, [userID])

        //remove the device
        const result = await dbClient.queryObject(
            //remove the associated device from the user
            `DELETE FROM device WHERE serialnumber = '${serialNumber}' 
            AND ipaddress = '${ipAddress}'`
        );

        return res.status(200).send(true);

    }catch(error){
        console.error("Error removing device", error);
        return res.status(500).send(false);
    }





})


//Author: Sebastian Andrade
//Purpose: sending experiment data between host and joiner
//Returns: A boolean value to let the user know if the experiment data was sent.
hostRouter.post("/send-experiment", (req: Request, res: Response) => {
    try{
        experimentData = req.body
        //const { experimentTitle, experimentDesc, experimentId } = req.body;
        return res.status(200).send({success: true})

    }
    catch(error){
        console.error("Error receiving experiment data", error)
        return res.status(400).send({success: false, message: "Error receiving data"})
    }


})


//Purpose: Get the experiment data
//Returns: The experiment data (JSON)
hostRouter.get("/get-experiment", (req: Request, res:Response) =>{
    try{
        console.log("Here is the request body", req.body)
        return res.status(200).send(experimentData)
    }
    catch(error){
        console.error("Error sending data", error)
        return res.status(400).send({success: false, message: "Error sending data"})
    }
})


hostRouter.get("/get-user-experiment/:sessionID/:userID/:experimentType", async (req: Request, res: Response) => {
    const sessionID = req.params.sessionID;
    const userID = req.params.userID;
    const experimentType = req.params.experimentType;
    const user = Number(userID);

    try{
        const info = await getUserExperimentData(sessionID, user, experimentType);
        console.log("INFO BEING SENT OUT", info);
        return res.status(200).send(info);

    }
    catch(error){
        console.error("Error getting experiment data for user")
        return res.status(400).send({message: "Error getting data"});
    }
})

//update connection flag for given device
hostRouter.post("/update-device-connection", async (req: Request, res: Response) => {
    const { serial, socket, connection } = req.body; 
    console.log("/update-device-connection: ", req.body);
    try{
        const result = await updateDeviceConnection(serial, socket, connection);
        if(result){
            return res.status(200).send({success: true});
        }
    }
    catch(error){
        console.error("Error updating device connection")
        return res.status(400).send({success: false});
    }
});

hostRouter.get("/check-connected-devices/:sessionId", async (req: Request, res: Response) => {
    const sessionId = req.params.sessionId;

    try{
        const result = await getSessionDevices(sessionId);
        console.log("RETURNED RESULT IN /check-connected-devices/sessionId: ", result.length);
        if(result.length !== 0){
            return res.status(200).send({success: true, devices: result});
        }
        else{
            return res.status(200).send({success: false});
        }
    }
    catch(error){
        console.error("Error checking devices in session");
        return res.status(400).send({success: false});
    }
});

export default hostRouter;