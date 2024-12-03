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

function App() {
  useSocketManager();
  return (
    <div className="flex flex-col h-screen max-h-screen overflow-auto bg-gradient-to-br from-purple-700 to-blue-500">
      <NavigationBar />


      <div className="flex flex-col grow h-full overflow-auto">

        <Outlet />
      </div>
    </div>
  );
}

export default App;
