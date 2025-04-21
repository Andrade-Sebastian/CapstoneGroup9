import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Outlet, BrowserRouter as Router } from "react-router-dom";
import NavigationBar from "./Components/NavigationBar.tsx";
import { useEffect, useState, useRef } from "react";
import socket from "./Views/socket.tsx";
import { useJoinerStore, } from "./hooks/stores/useJoinerStore.ts";
import React from "react";
import ModalComponent from "./Components/ModalComponent.tsx";
import { TbDeviceMobileX } from "react-icons/tb";
import {isMobile} from 'react-device-detect';


function App() {
  const {
    userRole,
    sessionId,
	  wasKicked,
    socketId,
    setUserRole,
    nickname,
    roomCode,
	  setUserSocketId,
  } = useJoinerStore();

  const [isSocketAssigned, setIsSocketAssigned] = useState(false);
  const [isModalSettingsOpen, setIsModalSettingsOpen] = useState(false);
  const [isModalInfoOpen, setIsModalInfoOpen] = useState(false);

  const handleSettingsAction = () => {
    console.log("Settings submitted");
    setIsModalSettingsOpen(false);
  };

  const handleLeaveAction= () => {
    console.log("Leaving session...");
    setIsModalSettingsOpen(false);
  }

  const handleInfoAction = () => {
    console.log("Info submitted");
    setIsModalInfoOpen(false);
  };

  useEffect(() => {
    console.log(`${import.meta.env.VITE_BACKEND_PATH}/joiner/debug`)
    fetch(`${import.meta.env.VITE_BACKEND_PATH}/joiner/debug`).then( (response) => {
      if(response.ok){
        console.log("Response is")
      }
    }).catch(error => console.log(error))
  }, [])

  useEffect(() => {

    socket.on("clear-session", () => {
      console.log("Clearing session storage due to disconnection");
      setUserSocketId("");
      console.log(
        "session storage cleared. Current socketID in Session Storage"
      );
    });
    

    // Cleanup the event listener when the component unmounts or re-renders
    return () => {
      // socket.off("client-assignment");
      socket.off("clear-session");
    };
  }, [isSocketAssigned]);  // Dependency on isSocketAssigned to run when it changes

  return (
 <div className="flex flex-col h-screen max-h-screen overflow-auto bg-white">
      <NavigationBar
        onOpenSettings={() => setIsModalSettingsOpen(true)}
        onOpenInfo={() => setIsModalInfoOpen(true)}
      />
      {!isMobile ? (
        <div className="flex flex-col grow h-full overflow-auto">
          <Outlet />
        </div>
      ) : (
        <div className="flex flex-col">
          <TbDeviceMobileX/>
          <p>Sorry, mobile devices are not compatible இ௰இ </p>
        </div>

      )

      }
        <ModalComponent
        onAction={handleSettingsAction}
        isOpen={isModalSettingsOpen}
        onCancel={() => setIsModalSettingsOpen(false)}
        modalTitle="Settings"
      >
        <div className="mb-6">
          <p><span className="font-bold">Nickname:</span> {nickname || ""}</p>
          <p><span className="font-bold">Roomcode:</span> {roomCode || ""}</p>
          {/* <p><span className="font-bold">SocketID:</span> {socketId || ""}</p> */}
          <p><span className="font-bold">Userrole:</span> {userRole || ""}</p>
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

export default App;
