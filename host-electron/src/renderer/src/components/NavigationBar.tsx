import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@nextui-org/react";
import React, {useState} from "react";

import { RiPulseFill } from "react-icons/ri";
import { IoIosSettings } from "react-icons/io";
import { Link } from "react-router-dom";
import { CiCircleInfo } from "react-icons/ci";
import { IoMdMenu } from "react-icons/io";

import {
  Button,
  useDisclosure
} from "@heroui/react";


export interface INavbarProps {
  onOpenSettings: () => void;
  onOpenInfo: () => void;
}

export default function NavigationBar(props: INavbarProps) {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
      <Navbar
        isBordered={true}
        position="static"
        className="bg-gradient-to-br from-purple-700 to-violet-400 text-white h-20 px-4"
      >
        <NavbarBrand className="flex items-center">
          <RiPulseFill style={{ fontSize: "24px" }} />
          <Link to="/">
            <p className="text-2xl font-semibold hover:underline">WaveBrigade</p>
          </Link>
          <RiPulseFill style={{ fontSize: "24px" }} />
        </NavbarBrand>

        <button className="md:hidden text-white cursor-pointer text-3xl" onClick={() => setMenuOpen(!menuOpen)}>
          <IoMdMenu/>
        </button>
        <NavbarContent className="hidden ml-auto md:flex items-center justify-end">
            {/* Settings */}
          <NavbarItem className="flex gap-6 items-center justify-end w-full max-w-md">
            <div className="flex gap-10 items-center justify-center">
                <button onClick={props.onOpenSettings} className="border cursor-pointer font-semibold px-6 py-2 flex items-center gap-2 rounded-md shadow-md transition duration-300 ease-in-out">
                    SETTINGS
                    <IoIosSettings
                  className="hover:animate-spin"
                  style={{ fontSize: "25px" }}
                />
                </button>
            </div>


            <div className="flex gap-10 items-center justify-center">
              <button
                onClick={props.onOpenInfo}
                type="button"
                className="border cursor-pointer font-semibold px-6 py-2 flex items-center gap-2 rounded-md shadow-md transition duration-300 ease-in-out"
              >
                INFO
                <CiCircleInfo style={{ fontSize: "25px" }} />
              </button>
              {/*This will redirect to Media Page */}
            </div>
            </NavbarItem>
       
        </NavbarContent>
        {menuOpen &&(
          <div className="absolute rounded-md top-20 left-0 w-full bg-[#7F56D9] text-white shadow-md md:hidden flex flex-col items-center space-y-4 py-4">
            <button className="w-11/12 text-center py-2 cursor-pointer font-semibold rounded-md border hover:bg-violet-500" onClick={props.onOpenSettings}>
            SETTINGS
            </button>
            <button className="w-11/12 text-center py-2 cursor-pointer font-semibold rounded-md border hover:bg-violet-500" onClick={props.onOpenInfo}>
            INFO
            </button>
          </div>
        )}
      </Navbar>
  );
}
