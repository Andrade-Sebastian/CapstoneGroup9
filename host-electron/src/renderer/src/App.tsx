
import { Outlet } from "react-router-dom";
import NavigationBar from "./components/NavigationBar.tsx";
import useBrainflowManager from './hooks/useBrainflowManager.ts';
import { useSessionStore } from '../src/store/useSessionStore.tsx';
import { useEffect, useState } from 'react';
import socket from './Socket.js';
import React from "react";
import toast, { Toaster } from "react-hot-toast";
import ModalComponent from "./components/ModalComponent.tsx";
import { useSessionStore } from "./store/useSessionStore.tsx";

const ipc = window.api



function App() {
  useBrainflowManager();
  const ipc = window.api
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
  const [isModalSettingsOpen, setIsModalSettingsOpen] = useState(false);
  const [isModalInfoOpen, setIsModalInfoOpen] = useState(false);
const { hostName, roomCode} = useSessionStore();
  const handleSettingsAction = () => {
    console.log("Settings submitted");
    setIsModalSettingsOpen(false);
  };

  const handleInfoAction = () => {
    console.log("Info submitted");
    setIsModalInfoOpen(false);
  };


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

  useEffect(() => {
    ipc.receive('session:request-data', (payload) => {
      const { targetWindowId} = payload
      const sessionData = useSessionStore.getState()
      ipc.send('session:send-to-window', {windowId: targetWindowId, sessionData});
      
    });
  },[])
  

  // useEffect(() => {
  //   const cleanup = ipc.receive(
  //     "brainflow:launched",
  //     (event, userId) => {
  //       toast.success("Successfully launched Brainflow")
  //     }
  //   );

  //   return (): void => cleanup();
  // }, [toast]);

  // useEffect(() => {
  //   const cleanup = ipc.receive(
  //     "brainflow:destroy",
  //     (event, userId) => {
  //       toast.success("Successfully disconnected user")
  //     }
  //   );

  //   return (): void => cleanup();
  // }, [toast]);

  // useEffect(() => {
  //   const cleanup = ipc.receive(
  //     "brainflow:launchError",
  //     (event, userId) => {
  //       toast.error("Error: Launching Brainflow failed.")
  //     }
  //   );

  //   return (): void => cleanup();
  // }, [toast]);

  // useEffect(() => {
  //   const cleanup = ipc.receive(
  //     "brainflow:status",
  //     (event, userId) => {
  //       toast.success("Successfully received Brainflow status")
  //     }
  //   );

  //   return (): void => cleanup();
  // }, [toast]);

  // // useEffect(() => {
  // //   const cleanup = ipc.receive(
  // //     "brainflow:destroyed",
  // //     (event, userId) => {
  // //       toast.success("Successfully initiated Brainflow destroyed")
  // //     }
  // //   );

  // //   return (): void => cleanup();
  // // }, [toast]);

  // useEffect(() => {
  //   const cleanup = ipc.receive(
  //     "brainflow:destroyedError",
  //     (event, userId) => {
  //       toast.error("Error: Failed to disconnect user")
  //     }
  //   );

  //   return (): void => cleanup();
  // }, [toast]);
  
  // useEffect(() => {
  //   const cleanup = ipc.receive(
  //     "brainflow:connectingEmotibit",
  //     (event, userId) => {
  //       toast.success("Emotibit connecting")
  //     }
  //   );

  //   return (): void => cleanup();
  // }, [toast]);

  // useEffect(() => {
  //   const cleanup = ipc.receive(
  //     "brainflow:connectedEmotibit",
  //     (event, userId) => {
  //       toast.success("Emotibit successfully connected")
  //     }
  //   );

  //   return (): void => cleanup();
  // }, [toast]);

  // useEffect(() => {
  //   const cleanup = ipc.receive(
  //     "brainflow:disconnectEmotibit",
  //     (event, userId) => {
  //       toast.success("Emotibt successfully disconnected")
  //     }
  //   );

  //   return (): void => cleanup();
  // }, [toast]);




  return (
    <div className="flex flex-col h-screen max-h-screen overflow-auto bg-white">
      <NavigationBar
        onOpenSettings={() => setIsModalSettingsOpen(true)}
        onOpenInfo={() => setIsModalInfoOpen(true)}
      />
        <div className="flex flex-col grow h-full overflow-auto">
          <Outlet />
        </div>
        <ModalComponent
        onAction={handleSettingsAction}
        isOpen={isModalSettingsOpen}
        onCancel={() => setIsModalSettingsOpen(false)}
        modalTitle="Settings"
      >
        <div className="mb-6">
        <div className="mb-6">
          <p><span className="font-bold">Nickname:</span> {hostName || ""}</p>
          <p><span className="font-bold">Roomcode:</span> {roomCode || ""}</p>
          {/* <p><span className="font-bold">SocketID:</span> {socketId || ""}</p> */}
        </div>
        </div>
      </ModalComponent>

      <ModalComponent
        onAction={handleInfoAction}
        isOpen={isModalInfoOpen}
        onCancel={() => setIsModalInfoOpen(false)}
        modalTitle="Information"
        button="Understood"
      >
        <div className="mb-6">
        <div id="description" className="text-justify justify-left"> 
            <h1 className="text-2xl mb-2 font-bold">What is WaveBrigade?</h1>
            <p className="mb-4">WaveBrigade, inspired by Kahoot and TopHat, is a web-based platform with the purpose of deepening the learning experience by providing instructors with an interactive and user-friendly interface to create lesson plans for students. These lesson plans will be used and presented to students to collect real-time responses from them, utilizing the EmotiBit. In addition, this data will be illustrated through charts and graphs with consideration of their respective data type. WaveBrigade offers an environment where instructors can create virtual lobbies, create lesson plans, and introduce different types of media (such as videos and images) to enhance engagement amongst students. Students can join these lobbies with an access code, participate in the session, and capture their reactions to the media via the EmotiBit. Therefore, students can understand and reflect on the data captured to better understand the lesson material. </p>
        </div>

        </div>
      </ModalComponent>
    </div>
  );

}

export default App
