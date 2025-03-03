import { session } from 'electron'
import useSessionStore, { IAppState, IUser } from './useSessionState.tsx'
import { useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { echoProcessAPI } from '../../../preload/index.ts'
import { useSessionStore } from '../store/useSessionStore.tsx'
import axios from 'axios'
import socket from '../Views/socket.tsx'

export default function useBrainflowManager() {
  const [isBrainFlowValid, setIsBrainFlowValid] = useState(false)
  const { users, sessionId } = useSessionStore()
  const ipc = window.api
  console.log('LOOK HERE', ipc)
  const sessionID = useSessionStore((state: IAppState) => state.sessionID)

  const handleUserLeaveSession = (userId: string) => {
    console.log(`User ${userId} is leaving the session, destroying process...`)
    ipc.send('brainflow:destroy-user', userId)
  }
  const handleHostEndSession = () => {
    console.log(`Host is ending session ${sessionId}, destroying user processes...`)
    for (let i = 0; i < users.length; i++) {
      ipc.send('brainflow:destroy-user', users.userId)
    }
    ipc.send('brainflow:destroy', sessionId)
  }

  const testingFunc = (event, userId) => {
    console.log('userId', userId)
  }

  useEffect(() => {
    const handleDisconnect = (event, userId) => {
      console.log(`UseEffect: recieved event to disconnect user ${userId}`)
      handleUserLeaveSession(userId)
    }

    const cleanupFunc = ipc.receive('brainflow:destroy-user', testingFunc)
    return () => cleanupFunc()
  }, [])

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
    ipc.send(
      'brainflow:launch',
      user.associatedDevice?.ipAddress,
      user.associatedDevice?.serialNumber,
      import.meta.env.VITE_BACKEND_PATH,
      user.userId,
      user.socketId,
      sessionID
    )
  }

  const destroyProcess = (user: IUser) => {
    ipc.send(
        'brainflow:destroy',
        user.userId
    )
  }

  useEffect(() => {
    socket.on("start-brainflow-launch", launchProcess)
    return () => {
        socket.off("start-brainflow-launch", launchProcess)
    }
  }, [])

  useEffect(() => {
    socket.on("destroy-brainflow-launch", destroyProcess)
    return () => {
        socket.off("destroy-brainflow-launch", destroyProcess)
    }
  }, [])

  return { launchProcess, handleUserLeaveSession, handleHostEndSession, isBrainFlowValid }
}
