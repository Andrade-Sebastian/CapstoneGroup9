
import { session } from "electron"
import { IAppState, IUser } from "./useSessionState.tsx"
import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { echoProcessAPI } from '../../../preload/index.ts'
import { useSessionStore } from "../store/useSessionStore.tsx"
import axios from "axios";



export default function useBrainflowManager()
{
    const [isBrainFlowValid, setIsBrainFlowValid] = useState(false);
    const ipc = window.api
    console.log("LOOK HERE" , ipc)
    const sessionID = useSessionStore((state: IAppState) => state.sessionID)
    const users = useSessionStore((state) => state.users);
    const sessionId = useSessionStore((state) => state.sessionID);

    const handleUserLeaveSession = (userId: string) => {
        console.log(`User ${userId} is leaving the session, destroying process...`);
        //ipc.send('brainflow:destroy-user', userId);
    };
    const handleHostEndSession = () => {
        console.log(`Host is ending session ${sessionId}, destroying user processes...`);
        users.forEach((user) => {
            if(user.userrole === "joiner"){
                ipc.send('brainflow:destroy-user', user.userid);
            }
        })
        ipc.send('brainflow:destroy', sessionId);
        ipc.send('activity:closeAllWindows');
    };


    const testingFunc = (event, userId) => {
        console.log("userId", userId)
    }
    useEffect(() => {
        const handleDisconnect = (event, userId) => {
            console.log(`UseEffect: recieved event to disconnect user ${userId}`);
            handleUserLeaveSession(userId);
        };

        const cleanupFunc = ipc.receive('brainflow:destroy-user', testingFunc);
        return () => cleanupFunc()
            
    }, []);

    // useEffect(() => {
    //     async function validateBrainFlow(){
    //         try{
    //             console.log("Validating Brainflow...")
    //             const response = await axios.get("http://localhost:3000/experiments/validate-brainflow");
    //             const data = await response.data 

    //             if (response.status == 200){
    //                 console.log("Brainflow validated")
    //                 setIsBrainFlowValid(true)
    //                 console.log("Launching brainflow")
    //                 ipc.send("brainflow:launch", sessionId);
    //                 console.log("Brainflow launched")
    //             }
    //             else{
    //                 console.error("Brainflow failed to launch")
    //             }
    //         }
    //         catch(error){
    //             console.error("Error: ", error)
    //         }
    //     }
    //     validateBrainFlow();
    //     return () => {
    //         console.log("Cleaning up brainflow");
    //     };
    // },[]);



    const launchProcess = (user: IUser) => {
        ipc.send("brainflow:launch", user.associatedDevice?.ipAddress, user.associatedDevice?.serialNumber, import.meta.env.VITE_BACKEND_PATH, user.userId, user.socketId, sessionID)
    }


    return {launchProcess, handleUserLeaveSession, handleHostEndSession, isBrainFlowValid}
    

}


//waiting room

//const {launchProcess} = useBrainflowManager()


//NEED
//Remove proccess, call destroy function
//process status, find status of process given a user

//implementations in renderer main, 
