
import { session } from "electron"
import useSessionStore, { IAppState, IUser } from "./useSessionState"
import { useParams } from "react-router-dom"
import { useState } from "react"


export default function useBrainflowManager()
{
    const ipc = window.api
    console.log("LOOK HERE" , ipc)
    const sessionID = useSessionStore((state: IAppState) => state.sessionID)

    const launchProcess = (user: IUser) => {
        ipc.send("brainflow:launch", user.associatedDevice?.ipAddress, user.associatedDevice?.serialNumber, import.meta.env.VITE_BACKEND_PATH, user.userId, user.socketId, sessionID)
    }

    return {launchProcess}
    
    // return "helasad"

}


//waiting room

//const {launchProcess} = useBrainflowManager()
