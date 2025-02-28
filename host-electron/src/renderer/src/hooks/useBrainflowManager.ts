
import { session } from "electron"
import useSessionStore, { IAppState, IUser } from "./useSessionState.tsx"
import { useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { echoProcessAPI } from '../../../preload/index.ts'


export default function useBrainflowManager()
{
    const {users, sessionId} = useSessionStore();
    const ipc = window.api
    console.log("LOOK HERE" , ipc)
    const sessionID = useSessionStore((state: IAppState) => state.sessionID)

    const handleUserLeaveSession = (userId: string) => {
        console.log(`User ${userId} is leaving the session, destroying process...`);
        ipc.send('brainflow:destroy-user', userId);
    };
    const handleHostEndSession = () => {
        console.log(`Host is ending session ${sessionId}, destroying user processes...`);
        for(let i = 0; i < users.length; i++){
            ipc.send('brainflow:destroy-user', users.userId);
        }
        ipc.send('brainflow:destroy', sessionId)
    };

    // useEffect(() => {
    //     const handleDisconnect = (event, userId) => {
    //         console.log(`UseEffect: recieved event to disconnect user ${userId}`);
    //         handleUserLeaveSession(userId);
    //     };

    //     ipc.receive('user-disconnected', handleDisconnect);
    //     return() => {
    //         ipc.receive('user-disconnected', handleDisconnect)();
    //     };
    // }, []);


    const launchProcess = (user: IUser) => {
        ipc.send("brainflow:launch", user.associatedDevice?.ipAddress, user.associatedDevice?.serialNumber, import.meta.env.VITE_BACKEND_PATH, user.userId, user.socketId, sessionID)
    }


    return {launchProcess, handleUserLeaveSession, handleHostEndSession}
    

}


//waiting room

//const {launchProcess} = useBrainflowManager()


//NEED
//Remove proccess, call destroy function
//process status, find status of process given a user

//implementations in renderer main, 
