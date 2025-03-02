
import { Outlet } from "react-router-dom";
import NavigationBar from "./components/NavigationBar.tsx";
import useBrainflowManager from './hooks/useBrainflowManager.ts';
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

function App() {
  const {launchProcess} = useBrainflowManager();
  const ipc = window.api
  const { handleUserLeaveSession } = useBrainflowManager();

  // useEffect(() => {
  //   //hardcoded for testing
  //   launchProcess({
  //     userId: 1, //serial
  //     socketId:"socket-test", //Frontend socket ID 
  //     nickname: "unc",
  //     associatedDevice: {
  //       serialNumber: "string",
  //       ipAddress: "string",
  //       socketID: "string"
  //     }})
  // }, []);


  const [isSocketAssigned, setIsSocketAssigned] = useState(false);
  const socket: Socket = io("http://localhost:3000"); 

  useEffect(() => 
  {
    console.log("(App.tsx): making socket");

    // Emit the "client-assignment" event
    socket.emit("client-assignment");
    socket.on("client-assignment", (data: { socketId: string }) => {
      setIsSocketAssigned(true);
      console.log("Socket ID assigned: ", data.socketId, " |Assigned: ", isSocketAssigned);
      // Listen for the "client-assignment" event
      console.log("Adding socketID to session storage");
      console.log("sessionStorage operation:", data.socketId);

      sessionStorage.setItem("socketID", data.socketId);
      console.log("Current session storage:", sessionStorage.getItem("socketID"));

      // Update state to prevent re-assignment
    });

      socket.on("clear-session", () => {
        console.log("Clearing session storage due to disconnection");
        sessionStorage.removeItem("socketID");
        console.log("session storage cleared. Current socketID in Session Storage: ", sessionStorage.getItem("socketID"));
      });
  // Cleanup the event listener when the component unmounts or re-renders
  return () => {
    socket.off("client-assignment");
    socket.off("clear-session");
  };
    
  }, []);  // Dependency on isSocketAssigned to run when it changes




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
