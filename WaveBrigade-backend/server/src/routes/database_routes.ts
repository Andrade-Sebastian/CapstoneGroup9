import express from "express";
import type { Request, Response } from "express";
import { createPhotoLabInDatabase, createVideoLabInDatabase, createGalleryLabInDatabase, getSessionIDFromSocketID, addUserToSession, IUserDatabaseInfo, getSessionState, getPhotoLabInfo, assignExperimentToSession, createArticleLabInDatabase, isNicknameUnique} from "../controllers/database.ts";
import multer from "multer";
import fs, { rmSync } from 'node:fs';
import { determineFileExtension, getNumberFilesInDirectory } from "../controllers/photolab_controller.ts";
import axios from 'axios';

import fsPromises from 'node:fs/promises';
import dbClient from "../controllers/dbClient.ts";
import path from "node:path/posix";


const labDirectories = {
    "photo-lab": "/app/backend/server/src/media/photo-lab",
    "video-lab": "/app/backend/server/src/media/video-lab",
    "gallery-lab": "/app/backend/server/src/media/gallery-lab",
    "article-lab": "/app/backend/server/src/media/article-lab",
};

const photoLabMediaDirectory = "/app/backend/server/src/media/photo-lab";
//const photoLabFolderExists = fs.existsSync("/app/backend/server/src/media/photo-lab");

const videoLabMediaDirectory = "/app/backend/server/src/media/video-lab";
//const videoLabFolderExists = fs.existsSync("/app/backend/server/src/media/video-lab");

const galleryLabMediaDirectory = "/app/backend/server/src/media/gallery-lab";
//const galleryLabFolderExists = fs.existsSync("/app/backend/server/src/media/gallery-lab");

const articleLabMediaDirectory = "/app/backend/server/src/media/article-lab";
//const articleLabFolderExists = fs.existsSync("/app/backend/server/src/media/article-lab");

// Ensure the directory exists
Object.values(labDirectories).forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

const databaseRouter = express.Router();
databaseRouter.use(express.json()); 

/*
 .  .  .    .    .  .   .
.  .   .    .   .      .
"Take me to a time.."  .  .
.   .  .   .  . .    .  . 
 . . . .  . .  .   .  . . 
*/


// set suffix for file name
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log("req.body:", req.body); 
        const labType = req.body.labType;
        const destinationDir = labDirectories[labType];

        if (destinationDir) {
            cb(null, destinationDir);
        } else {
            cb(new Error("Invalid lab type"));
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });


databaseRouter.get("/device-info/:lastFourSerial", async(req: Request, res: Response) => {
    const lastFourSerial = req.params.lastFourSerial;
    console.log("Last four serial: ", lastFourSerial);

    try{    

        const query = await dbClient.queryObject(`SELECT * FROM DEVICE WHERE RIGHT(serialnumber, 4) = $1;`, [lastFourSerial]);

        if (query.rows.length === 0)
        {
            console.log("No device found with last four serial=", lastFourSerial);
            res.status(404).send({
                "Message": "No device found with last four serial provided"
            });
        }else{
            res.status(200).send(query.rows);
        }

    }catch(error){
        console.log("error:" ,error);
        res.status(500).send({
            "Error": JSON.stringify(error)
        });
    }
});










databaseRouter.post("/photo-lab", upload.single("imageBlob"), async(req: Request, res: Response) => {

    const experimentTitle = req.body.experimentTitle;
    const experimentDescription = req.body.experimentDescription;
    const experimentCaptions = req.body.experimentCaptions;
    const imageBlob = req.body.imageBlob;
    const socketID = req.body.socketID;

    //giving the file a new name ex. (#).jpg
    let fileNumber = await getNumberFilesInDirectory(photoLabMediaDirectory);
    let detectedFileExtension = determineFileExtension(req.file) 
    const fileName = fileNumber + detectedFileExtension


    if (req.file) //if a file was provided
    {
        console.log("There do be a file")
        console.log("Uploaded file: ", req.file)
    }
    else //if no file was provided
    {
        console.log("No file provided");
        return res.status(500).send("No file provided");
    }

    let experimentID = null
    console.log("New Filename, ", fileName)

    //change the req.file.name to filename
    console.log("File path", req.file.path);

 
    //add the file to the /app/backend/server/src/media/photo-lab directory
    try{
        await fsPromises.rename(req.file.path, `/app/backend/server/src/media/photo-lab/${fileName}`);
    }
    catch(error){
        console.log("Error moving file: ", error);
        return res.status(500).send("Error moving file.");
    };

    //add the photo lab to the database
    let sessionID = -1;

    try{
        sessionID = await getSessionIDFromSocketID(socketID);

        console.log("Session id--", sessionID)
        experimentID = await createPhotoLabInDatabase({
            experimentTitle: experimentTitle, 
            experimentDescription: experimentDescription,
            experimentCaptions: experimentCaptions,
            imageBlob: fileName,
            socketID: socketID
        }, sessionID)
    } 
    catch (error) {
        res.status(500).send({
            "message": "Could not add photo lab to database",
            "error": error
        });
    }
    
    res.status(200).send({
        "message": "succeess",
        "experimentID": experimentID
    })
});
        
    


databaseRouter.post("/video-lab", upload.single("videoBlob"), async(req: Request, res: Response) => {
    
    const {experimentTitle, experimentDescription, videoID, socketID } = req.body;

    let experimentID = null;
    let sessionID = -1;

    try{
        sessionID = await getSessionIDFromSocketID(socketID);
        console.log("In DB Route of /video-lab. SessionID:", sessionID);
        if(videoID){
            console.log("Video lab info", experimentTitle, "video ID", videoID, "SocketID",socketID);
            experimentID = await createVideoLabInDatabase({
                experimentTitle: experimentTitle, 
                experimentDescription: experimentDescription,
                videoID: videoID,
                socketID: socketID
            }, sessionID)
        }
        else if(req.file){
            console.log("There do be a file, uploaded file:", req.file)
            const fileNumber = await getNumberFilesInDirectory(videoLabMediaDirectory);
            const detectedFileExtension = determineFileExtension(req.file) 
            const fileName = fileNumber + detectedFileExtension
            //adding file to appropriate directory
            try{
                await fsPromises.rename(req.file.path, `/app/backend/server/src/media/video-lab/${fileName}`);
                experimentID = await createVideoLabInDatabase({
                    experimentTitle: experimentTitle, 
                    experimentDescription: experimentDescription,
                    videoBlob: fileName,
                    socketID: socketID
                }, sessionID)
            }
            catch(error){
                console.log("Error moving file: ", error);
                return res.status(500).send("Error moving file.");
            };
        }
        else{
            return res.status(400).send({message: "No video file or URL provided..."})
        }
        res.status(200).send({message: "Success", experimentID})
    }catch(error){
        console.log(error)
        res.status(500).send({message:"Could not add video lab to database", error})
    }
});


databaseRouter.post("/gallery-lab", upload.array("images"), async(req: Request, res: Response) => {
    const clearGalleryFolder = async (directoryPath: string) => {
        try{
            const files = await fs.promises.readdir(directoryPath);
            for(const file of files) {
                const filePath = path.join(directoryPath, file);
                await fs.promises.unlink(filePath);
            }
            console.log("Cleared gallery folder.")
        } catch(error){
            console.log("Error clearing folder", error)
        }
    };
    try{
    const imageFiles = req.files as Express.Multer.File[]
    const {experimentTitle, experimentDescription, socketID} = req.body;
    const rawCaptions = req.body.captions;

    if(!imageFiles || imageFiles.length === 0) {
        return res.status(400).json({message: "No images uploaded."});
    }

    const captions = Array.isArray(rawCaptions) ? rawCaptions : [rawCaptions];

    //just in case there is a mismatch of captions and files
    if (captions.length !== imageFiles.length) {
        return res.status(400).json({message: "Number of captions need to match the number of images."});
    }
    const sessionID = await getSessionIDFromSocketID(socketID);

    if(!sessionID){
        return res.status(404).json({message: "There is no session found for given socketID."});
    }

    //create experiment 
    let experimentID = null;
    const imagesToInsert: {path: string, caption: string }[] = [];
    for(let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        console.log("Incoming file path from multer:", file.path);
        const caption = captions[i];
        const detectedFileExtension = determineFileExtension(file);
        
        const newFileName = `${i}${detectedFileExtension}`;
        const newFilePath = `${galleryLabMediaDirectory}/${newFileName}`;
        
        await fsPromises.rename(file.path, newFilePath);
        console.log("Incoming file path from multer:", file.path);

        imagesToInsert.push({
            path: `/media/gallery-lab/${newFileName}`, //path
            caption
        });   
    }
    experimentID = await createGalleryLabInDatabase({experimentTitle: experimentTitle, experimentDescription: experimentDescription, socketID: socketID}, imagesToInsert, sessionID);

    
    console.log("(database_routes.ts: In galleryLab, recieved : ", sessionID);
    res.status(200).json({
    message: "Gallery lab created successfully.",
    experimentID, images: imagesToInsert});
    } catch (error) {
        console.log("Error in /gallery-lab", error);
        res.status(500).send({
            "message": "Could not add gallery lab to database",
            "error": error
        });
    }
})

databaseRouter.post("/article-lab", upload.single("articleBlob"), async(req: Request, res: Response) => {

    const {experimentTitle, experimentDescription, articleURL, socketID} = req.body;

    console.log("Received form data:", req.body);  // Log all fields in req.body

    let experimentID = null;
    let sessionID = -1;

    // const labType = req.body.labType;  // This should now be available
    // console.log("LAB TYPE: ", labType);  // Log labType to verify

    // const experimentTitle = req.body.experimentTitle;
    // const experimentDescription = req.body.experimentDescription;
    // const article = req.body.article;
    // const socketID = req.body.socketID

    try{
        sessionID = await getSessionIDFromSocketID(socketID);
        console.log("In DB Route of /article-lab. SessionID:", sessionID);
        if(articleURL){
            console.log("Exp.title :", experimentTitle, "article url hopefully", articleURL, "SocketID",socketID);
            experimentID = await createArticleLabInDatabase({
                experimentTitle: experimentTitle, 
                experimentDescription: experimentDescription,
                articleURL: articleURL,
                socketID: socketID
            }, sessionID)
        }
        else if(req.file){
            console.log("There do be a file, uploaded file:", req.file)
            const fileNumber = await getNumberFilesInDirectory(articleLabMediaDirectory);
            const detectedFileExtension = determineFileExtension(req.file) 
            const fileName = fileNumber + detectedFileExtension
            //adding file to appropriate directory
            try{
                await fsPromises.rename(req.file.path, `/app/backend/server/src/media/article-lab/${fileName}`);
                experimentID = await createArticleLabInDatabase({
                    experimentTitle: experimentTitle, 
                    experimentDescription: experimentDescription,
                    articleBlob: fileName,
                    socketID: socketID
                }, sessionID)
            }
            catch(error){
                console.log("Error moving file: ", error);
                return res.status(500).send("Error moving file.");
            };
        }
        else{
            return res.status(400).send({message: "No article file or URL provided..."})
        }
        res.status(200).send({message: "Success", experimentID})
    }catch(error){
        console.log(error)
        res.status(500).send({message:"Could not add article lab to database", error})
    }
});


databaseRouter.get("/photo-lab/info/:photolabid", async(req: Request, res: Response) => {
    const photoLabID = req.params.photolabid;

    try{
        const info = await getPhotoLabInfo(photoLabID);
        if (info === undefined)
        {
            res.status(500).send({
                "Message": `No info for photolabid=${photoLabID}`
            })
        }
        res.status(200).send(info)

    }
    catch(error)
    {
        res.status(500).send({
            "Message": `Unable to get information at id=${photoLabID}`,
            "Error": error
        })
    }
})


// Returns device ID based on user's socketID
databaseRouter.get("/device-id/:socketID", async (req: Request, res: Response) => {

    const socketID = req.params.socketID;
    let deviceID = null;

    try{

        //get device id assigned to the user at socket id 
        const query = await dbClient.queryObject(`select device from "User" where frontendsocketid='${socketID}'`)

        if(query.rows.length === 0){
            res.status(404).send({
                "message": "Either the device was not found, or is not associated to the user"
            })
        }else{
            deviceID = query.rows[0].device
        }

    }catch(error){
        console.log(error)
        res.status(500).send({"Error": error})
    }
    
    res.status(200).send({"deviceID": deviceID})
})


databaseRouter.get("/unique-nickname/:sessionid/:nickname", async (req: Request, res: Response) => {

    const sessionID: string = req.params.sessionid;
    const nickname: string = req.params.nickname.trim();
    
    let isUnique: boolean = false;

    //console.log(`${import.meta.env.VITE_BACKEND_PATH}/database/unique-nickname/${sessionID}/${nickname}`)
    isUnique = await isNicknameUnique(sessionID, nickname);
    console.log("ROUTE, recieved ", isUnique)

   
    res.status(200).json({isUnique})
    


})


databaseRouter.post("/remove-session/:sessionID", async (req: Request, res: Response) => {

    const sessionID = req.params.sessionID;

    console.log(`POST: In /remove-session/${sessionID}`)

    try{
        console.log(`Query: select Remove_Session(${sessionID})`);

        const query = await dbClient.queryObject(`SELECT Remove_Session($1)`, [sessionID])

        console.log("After the query", query.rows[0].remove_session)

        const wasRemoved: boolean = query.rows[0].remove_session;
 
        if (wasRemoved){
            res.status(200).send({
                "message": "In /remove-session/:sessionID",
                "huh": `Successfully removed session ${sessionID}`
            });
        }else{
            res.status(400).send({
                "Message": "Invalid sessionid..."
            })
        }


    }catch(error: unknown){
        console.log(error);
    
        res.status(500).send({
            "Error": error
        })
        return;
     }


})

export default databaseRouter;

