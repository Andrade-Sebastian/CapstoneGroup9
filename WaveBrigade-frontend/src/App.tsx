import "./App.css";
import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Button} from "@nextui-org/react";
import {AcmeLogo} from "./AcmeLogo.jsx";

import { RiPulseFill } from "react-icons/ri";

import { IoIosSettings } from "react-icons/io";
import { Link, Outlet } from "react-router-dom";
import NavigationBar from "./Components/NavigationBar";

function App() {
  return (
    <div >
      <NavigationBar />


      <div className="flex flex-col h-svh bg-gradient-to-br from-violet-950 to-blue-800">

        <Outlet />
      </div>
    </div>
  );
}

export default App;
