import express, { Request, Response } from "express";
import { createPhotoLabInDatabase, createVideoLabInDatabase, createGalleryLabInDatabase, getSessionIDFromSocketID, addUserToSession, IUserDatabaseInfo, getSessionState, getPhotoLabInfo, assignExperimentToSession, createArticleLabInDatabase} from "../controllers/database.ts";
import multer from "multer";
import fs from 'node:fs';
import { determineFileExtension, getNumberFilesInDirectory } from "../controllers/photolab_controller.ts";
import axios from 'axios';

import fsPromises from 'node:fs/promises';

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


databaseRouter.post("/photo-lab", upload.single("imageBlob"), async(req: Request, res: Response) => {

    const experimentTitle = req.body.experimentTitle;
    const experimentDescription = req.body.experimentDescription
    const experimentCaptions = req.body.experimentCaptions;
    const imageBlob = req.body.imageBlob;
    const socketID = req.body.socketID

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
        "message": "succeess"
    })
});
        
    


databaseRouter.post("/video-lab", async(req: Request, res: Response) => {
    //check to see if the type matches
    const videoLabInfo = req.body;
    // const {
    //     experimentID,
    //     path,
    //     captions
    // } = req.body;

    try{
        console.log("(database_routes.ts: In videoLab, recieved : ", JSON.stringify(videoLabInfo))
        await createVideoLabInDatabase(videoLabInfo)
        console.log("(database_routes.ts): !!Video Lab to database :D-=")
    } catch (error) {
        res.status(500).send({
            "message": "Could not add video lab to database",
            "error": error
        });
    }
    res.status(200).send({
        "message": "In video-lab"
    })
})


databaseRouter.post("/gallery-lab", async(req: Request, res: Response) => {
    //check to see if the type matches
    const galleryLabInfo = req.body;
    // const {
    //     experimentID,
    //     path,
    //     captions
    // } = req.body;

    try{
        console.log("(database_routes.ts: In galleryLab, recieved : ", JSON.stringify(galleryLabInfo))
        await createGalleryLabInDatabase(galleryLabInfo)
        console.log("(database_routes.ts): !!Gallery Lab to database :D-=")
    } catch (error) {
        res.status(500).send({
            "message": "Could not add gallery lab to database",
            "error": error
        });
    }
    res.status(200).send({
        "message": "In gallery-lab"
    })
})

databaseRouter.post("/article-lab", upload.single("article"), async(req: Request, res: Response) => {

    console.log("Received form data:", req.body);  // Log all fields in req.body

    const labType = req.body.labType;  // This should now be available
    console.log("LAB TYPE: ", labType);  // Log labType to verify

    const experimentTitle = req.body.experimentTitle;
    const experimentDescription = req.body.experimentDescription;
    const article = req.body.article;
    const socketID = req.body.socketID

    //giving the file a new name
    let fileNumber = await getNumberFilesInDirectory(articleLabMediaDirectory);
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
        await fsPromises.rename(req.file.path, `/app/backend/server/src/media/article-lab/${fileName}`);
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
        experimentID = await createArticleLabInDatabase({
            experimentTitle: experimentTitle, 
            experimentDescription: experimentDescription,
            article: fileName,
            socketID: socketID
        }, sessionID)
    } 
    catch (error) {
        res.status(500).send({
            "message": "Could not add article lab to database",
            "error": error
        });
    }
    
    res.status(200).send({
        "message": "succeess"
    })
})


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



export default databaseRouter;

