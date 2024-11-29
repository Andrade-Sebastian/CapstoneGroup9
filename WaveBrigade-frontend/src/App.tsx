import "./App.css";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Button} from "@nextui-org/react";
import {AcmeLogo} from "./AcmeLogo.jsx";

import { RiPulseFill } from "react-icons/ri";

import { IoIosSettings } from "react-icons/io";
import { useSocketManager } from "./hooks/useSocketManager.js"
import { Link, Outlet } from "react-router-dom";
import NavigationBar from "./Components/NavigationBar";

function App() {
  useSocketManager();
  return (
    <div >
      <NavigationBar />


      <div className="flex flex-col h-screen bg-gradient-to-br from-purple-700 to-blue-500 overflow-hidden">

        <Outlet />
      </div>
    </div>
  );
}

export default App;
