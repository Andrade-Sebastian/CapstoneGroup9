import express, { Request, Response } from "express";
import { createPhotoLabInDatabase, createVideoLabInDatabase, createGalleryLabInDatabase, addUserToSession, IUserDatabaseInfo, getSessionState, getPhotoLabInfo, assignExperimentToSession} from "../controllers/database.ts";
import { IUser } from "../typings.ts";

const databaseRouter = express.Router();
databaseRouter.use(express.json());

// joinerRouter.get("/session/:sessionId", (req: Request, res: Response) => {
/*
 .  .  .    .    .  .   .
.  .   .    .   .      .
"Take me to a time.."  .  .
.   .  .   .  . .    .  . 
 . . . .  . .  .   .  . . 
*/
//database/photo
databaseRouter.post("/photo-lab", async(req: Request, res: Response) => {
    //check to see if the type matches
    const {
        experimentTitle, 
        experimentDescription,
        experimentCaptions,
        imageBlob,
        socketID
    } = req.body;


    console.log("Experiment Title: ", experimentTitle)
    console.log("Experiment Description: ", experimentDescription)
    console.log("Experiment Caption: ", experimentCaptions)
    console.log("Socket ID: ", socketID)
    console.log("Image Blob: ", imageBlob)


    //create an experiment
    let experimentID = null;

    
    //create a photo lab, relating that to the experiment id that was previously created
    try{
        console.log("/photo-lab: Recieved: ", JSON.stringify(req.body))
        experimentID = await createPhotoLabInDatabase({
            experimentTitle: experimentTitle,
            experimentDescription: experimentDescription,
            experimentCaptions: experimentCaptions,
            imageBlob: imageBlob,
            socketID: socketID
        }, )


    } catch (error) {
        res.status(500).send({
            "message": "Could not add photo lab to database",
            "error": error
        });
    }
    console.log("experimentID - RES CALL: ", experimentID)
    //res.status(200).send(getPhotoLabInfo(experimentID))
    res.status(200).send({
        "message": "In photo-lab"
    })
})

databaseRouter.post("/photo-lab/:sessionID", async(req: Request, res: Response) => {
    const {
        experimentTitle, 
        experimentDescription,
        experimentCaption
    } = req.body;

    console.log("req.body: ", req.body)
    const sessionID = Number(req.params.sessionID); 
    createPhotoLabInDatabase({
        ...req.body,
        imageBlob: "asdfghj",
    }, sessionID);

    const sessionState = await getSessionState(sessionID);
    console.log("sessionState: ", sessionState)
    res.status(200).send(sessionState);


})


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

// not used as of current database 2/14
// databaseRouter.post("/add-user-to-session", (req: Request, res: Response) => {
//     const {
//         userId,  //string
//         socketID,
//         nickname, 
//         roomCode
//     } = req.body

//     const infoForDatabase: IUserDatabaseInfo = {
//         userId: userId,
//         socketId: socketID,
//         nickname: nickname,
//         associatedDevice: null,
//         roomCode: roomCode
//     }

//     try{
//         //addUserToSession(infoForDatabase)
//     }
//     catch (error) {
//         res.status(500).send({
//             "message": "Could not add user to session in the datab",
//             "error": error
//         });
//     }

//     res.status(200).send({
//         "message": "In /add-user-to-session"
//     })


// })

export default databaseRouter;