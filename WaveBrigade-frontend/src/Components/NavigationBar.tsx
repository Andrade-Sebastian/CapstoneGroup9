import {
    Navbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
  } from "@nextui-org/react";
  import React from "react";
  
  import { RiPulseFill } from "react-icons/ri";
  import { IoIosSettings } from "react-icons/io";
  import { Link } from "react-router-dom";
  import { CiCircleInfo } from "react-icons/ci";
  
  import {
    Button,
    useDisclosure
  } from "@heroui/react";
  
  export default function NavigationBar() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    return (
      <div>
        <Navbar
          isBordered={true}
          position="static"
          className="bg-gradient-to-br from-purple-700 to-violet-400 text-white h-20"
        >
          <NavbarBrand className="pl-10">
            <RiPulseFill style={{ fontSize: "24px" }} />
            <Link to="/">
              <p className="text-2xl hover:bg-neutral-200">WaveBrigade</p>
            </Link>
            <RiPulseFill style={{ fontSize: "24px" }} />
          </NavbarBrand>
  
          <NavbarContent className="ml-auto flex items-center pr-10">
              {/* Settings */}
            <NavbarItem>
              <div className="flex gap-10 items-center justify-center">
                  <Button onPress={onOpen} className="border font-semibold px-6 py-2 flex items-center gap-2 rounded-md shadow-md transition duration-300 ease-in-out">
                      SETTINGS
                      <IoIosSettings
                    className="hover:animate-spin"
                    style={{ fontSize: "25px" }}
                  />
                  </Button>
                {/* <button
                  type="button"
                  className="border font-semibold px-6 py-2 flex items-center gap-2 rounded-md shadow-md transition duration-300 ease-in-out"
                >
                  <span>SETTINGS</span>
                  <IoIosSettings
                    className="hover:animate-spin"
                    style={{ fontSize: "25px" }}
                  />
                </button> */}
              </div>
              {/* Modal for Settings
              <Modal isOpen={false} onOpenChange={onOpenChange}>
              <ModalContent>
                {() => (
                  <>
                    <ModalHeader className="flex flex-col gap-1">
                      Settings
                    </ModalHeader>
                    <ModalBody>
                      <p>Settings content goes here...</p>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="danger"
                        variant="light"
                        onPress={() => onOpenChange()} // Ensure proper state update
                      >
                        Close
                      </Button>
                    </ModalFooter>
                  </>
                )}
              </ModalContent>
              </Modal> */}
            </NavbarItem>
            <NavbarItem>
              <div className="flex gap-10 items-center justify-center">
                <button
                  type="button"
                  className="border font-semibold px-6 py-2 flex items-center gap-2 rounded-md shadow-md transition duration-300 ease-in-out"
                >
                  INFO
                  <CiCircleInfo style={{ fontSize: "25px" }} />
                </button>
                {/*This will redirect to Media Page */}
              </div>
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      </div>
    );
  }
  