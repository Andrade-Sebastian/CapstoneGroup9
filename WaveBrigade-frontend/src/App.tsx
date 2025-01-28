import "./App.css";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Button} from "@nextui-org/react";
import {AcmeLogo} from "./AcmeLogo.jsx";
import { RiPulseFill } from "react-icons/ri";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { IoIosSettings } from "react-icons/io";
import { useSocketManager } from "./hooks/useSocketManager.js"
import { Link, Outlet } from "react-router-dom";
import NavigationBar from "./Components/NavigationBar";
import { useEffect, useState, useRef } from "react";
import socket from "./Views/socket.tsx"

function App() {
  //useSocketManager();

  const [isSocketAssigned, setIsSocketAssigned] = useState(false);

  useEffect(() => {
    if (!isSocketAssigned) {
      console.log("(App.tsx): making socket");

      // Emit the "client-assignment" event
      socket.emit("client-assignment");

      // Listen for the "client-assignment" event
      socket.on("client-assignment", (data) => {
        console.log("Adding socketID to session storage");
        console.log("sessionStorage operation:", data.socketId);

        sessionStorage.setItem("socketID", data.socketId);
        console.log("Current session storage:", sessionStorage.getItem("socketID"));

        // Update state to prevent re-assignment
        setIsSocketAssigned(true);
      });

      socket.on("clear-session", () => {
        console.log("Clearing session storage due to disconnection");
        sessionStorage.removeItem("socketID");
        console.log("session storage cleared. Current socketID in Session Storage: ", sessionStorage.getItem("socketID"));
      });


    }

    // Cleanup the event listener when the component unmounts or re-renders
    return () => {
      socket.off("client-assignment");
      socket.off("clear-session");
    };
  }, [isSocketAssigned]);  // Dependency on isSocketAssigned to run when it changes



  return (
    <div className="flex flex-col h-screen max-h-screen overflow-auto bg-white">
      <NavigationBar />


      <div className="flex flex-col grow h-full overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

export default App;
