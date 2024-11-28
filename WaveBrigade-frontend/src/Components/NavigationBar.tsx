import {Navbar, NavbarBrand, NavbarContent, NavbarItem, Button} from "@nextui-org/react";

import { RiPulseFill } from "react-icons/ri";
import { IoIosSettings } from "react-icons/io";
import { Link } from "react-router-dom";


export default function NavigationBar()
{
    return (
    <div>
        <Navbar isBordered={true} position="static" className="bg-white text-purple-950 h-20 ">
            <NavbarBrand className="pl-10">
                <RiPulseFill style={{fontSize: "24px"}} />
                <Link to="/">
                <p className="text-2xl hover:bg-neutral-200">WaveBrigade</p>
                </Link>
                <RiPulseFill style={{fontSize: "24px"}}/>
            </NavbarBrand>

            <NavbarContent className="ml-auto flex items-center pr-10">
                <NavbarItem>
                    <Link to="https://google.com"> {/* Google.com is a placeholder */}
                        <IoIosSettings className="hover:animate-spin" style={{fontSize: "32px"}}/>
                    </Link>
                </NavbarItem>
            </NavbarContent>
        </Navbar>
    </div>
)

}