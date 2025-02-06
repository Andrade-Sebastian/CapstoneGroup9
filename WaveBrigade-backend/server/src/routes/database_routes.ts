import express, { Request, Response } from "express";
import { createPhotoLabInDatabase, IPhotoLabDatabaseInfo } from "../controllers/database.ts";

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

databaseRouter.post("/photo-lab", (req: Request, res: Response) => {
    //check to see if the type matches
    const photoLabInfo = req.body;
    // const {
    //     experimentID,
    //     path,
    //     captions
    // } = req.body;

    try{
        console.log("(database_routes.ts: In PhotoLab, recieved : ", JSON.stringify(photoLabInfo))
        createPhotoLabInDatabase(photoLabInfo)
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
export default databaseRouter;