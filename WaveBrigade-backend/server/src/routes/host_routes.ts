import express, { Request, Response } from "npm:express";
import { createSessionInDatabase, registerDevice, IRegisterDeviceInfo, assignExperimentToSession} from "../controllers/database.ts";
import { red } from "https://deno.land/std@0.160.0/fmt/colors.ts";
import { Message } from "https://deno.land/x/postgres@v0.17.0/connection/message.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";
const dbClient = new Client({
  user: "postgres",
  database: "WB_Database",
  password: "postgres",
  hostname: "wb-backend-database",
  port: 5432,
});

const hostRouter = express.Router();
hostRouter.use(express.json());
let experimentData = {}


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
export default hostRouter;




