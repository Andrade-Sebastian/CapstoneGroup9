import express, { Request, Response } from "express";
import { createPhotoLabInDatabase, createVideoLabInDatabase, createGalleryLabInDatabase, addUserToSession, IUserDatabaseInfo} from "../controllers/database.ts";
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

databaseRouter.post("/photo-lab", async(req: Request, res: Response) => {
    //check to see if the type matches
    const photoLabInfo = req.body;
    // const {
    //     experimentID,
    //     path,
    //     captions
    // } = req.body;

    try{
        console.log("(database_routes.ts: In PhotoLab, recieved : ", JSON.stringify(photoLabInfo))
        await createPhotoLabInDatabase(photoLabInfo)
        console.log("(database_routes.ts): !!Photo Lab to database :D-=")
    } catch (error) {
        res.status(500).send({
            "message": "Could not add photo lab to database",
            "error": error
        });
    }
    res.status(200).send({
        "message": "In Photo-lab"
    })
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


databaseRouter.post("/add-user-to-session", (req: Request, res: Response) => {
    const {
        userId,  //string
        socketID,
        nickname, 
        roomCode
    } = req.body

    const infoForDatabase: IUserDatabaseInfo = {
        userId: userId,
        socketId: socketID,
        nickname: nickname,
        associatedDevice: null,
        roomCode: roomCode
    }

    try{
        //addUserToSession(infoForDatabase)
    }
    catch (error) {
        res.status(500).send({
            "message": "Could not add user to session in the datab",
            "error": error
        });
    }

    res.status(200).send({
        "message": "In /add-user-to-session"
    })


})

export default databaseRouter;