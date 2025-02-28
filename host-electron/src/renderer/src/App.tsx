
import { Outlet } from "react-router-dom";
import NavigationBar from "./components/NavigationBar.tsx";
import useBrainflowManager from './hooks/useBrainflowManager.ts';
import { useEffect } from 'react';
function App() {
  const {launchProcess} = useBrainflowManager();
  const ipc = window.api
  const { handleUserLeaveSession } = useBrainflowManager();

  useEffect(() => {
    //hardcoded for testing
    launchProcess({
    userId: 1, //serial
    socketId:"socket-test", //Frontend socket ID 
    nickname: "unc",
    associatedDevice: {
      serialNumber: "string",
      ipAddress: "string",
      socketID: "string"
    }
  })
}, [])

  // useEffect(() => {
  //   handleUserLeaveSession(userId); //process destruction for all users 
  // })



  return (
    <div className="flex flex-col h-screen max-h-screen overflow-auto bg-white">
      <NavigationBar />
      <div className="flex flex-col grow h-full overflow-auto">
        <Outlet />
      </div>
  </div>
  )
}

export default App
