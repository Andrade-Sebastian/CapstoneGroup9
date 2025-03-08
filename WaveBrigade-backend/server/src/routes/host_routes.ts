import express, { Request, Response } from "npm:express";
import { createSessionInDatabase, registerDevice, getUserExperimentData } from "../controllers/database.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const dbClient = new Client({
  user: "postgres",
  database: "WB_Database",
  password: "postgres",
  hostname: "wb-backend-database",
  port: 5432,
});

const hostRouter = express.Router();
let experimentData = {}

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
        await dbClient.connect();
        const result = await dbClient.queryObject(
            `DELETE FROM device where serialnumber = '${serialNumber}' 
            AND ipaddress = '${ipAddress}'`
        );

        return res.status(200).send(true);

    }catch(error){
        console.error("Error removing device", error);
        return res.status(500).send(false);
    }finally{
        await dbClient.end();
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

    try{
        const info = await getUserExperimentData(sessionID, userID, experimentType);
        console.log("INFO BEING SENT OUT", info);
        return res.status(200).send(info);

    }
    catch(error){
        console.error("Error getting experiment data for user")
        return res.status(400).send({message: "Error getting data"});
    }
})

export default hostRouter;