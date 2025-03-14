import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { Outlet, BrowserRouter as Router } from "react-router-dom";
import NavigationBar from "./Components/NavigationBar";
import { useEffect, useState, useRef } from "react";
import socket from "./Views/socket.tsx";
import { useJoinerStore, } from "./hooks/stores/useJoinerStore.ts";
import React from "react";



function App() {
  const { setUserSocketId } = useJoinerStore();
  const [isSocketAssigned, setIsSocketAssigned] = useState(false);

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
        <NavigationBar />
        <div className="flex flex-col grow h-full overflow-auto">
          <Outlet/>
        </div>
      </div>
  );
}

export default App;
