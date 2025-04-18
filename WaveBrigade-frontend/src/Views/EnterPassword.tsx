import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideComponent from "../Components/SideComponent.tsx";
import socket from "./socket.tsx";
import axios from "axios";
import { useJoinerStore } from "../hooks/stores/useJoinerStore.ts";
import { WiCloudy } from "react-icons/wi";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";
import { Icon } from "react-icons-kit";
import toast, { Toaster } from "react-hot-toast";
import { user } from "@nextui-org/react";

export default function EnterFunction() {
  const navigateTo = useNavigate();
  const [users, setUsers] = useState<string[]>([]); //list of users to send to waiting room
  const [socketID, setSocketID] = useState("");
  const { roomCode, sessionId, socketId, nickname } = useJoinerStore();
  const [password, setPassword] = useState("");
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(eyeOff);

  const { userRole, setUserRole } = useJoinerStore();

  function handleToggle() {
    //have eye open if text is censored, if not then eye closed
    if (type === "password") {
      setIcon(eye);
      setType("text");
    } else {
      setIcon(eyeOff);
      setType("password");
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const loadingToastId = toast.loading("Verifying Password...");
    if (!password || password.length < 3) {
      toast.error("Please enter in a valid password...");
      console.error("Please enter in a password...");
      return;
    }
    //ONCE VALIDATE PASSWORD IS CREATED REMOVE PASSWORD FROM IF STATEMENTS LINES 49 AND 52
    try {
      const isValidPassword = await validatePassword(password);

      if (isValidPassword === true) {
        //if the user is a spectator, they will be redirected to the waiting room
        console.log("User role: ", userRole);
        if (userRole === "spectator") {
          toast.success("Joining session as a spectator...");
          console.log("Joining as spectator...");

          axios.post(
            `http://${import.meta.env.VITE_BACKEND_PATH}/joiner/join-as-spectator`,
            {
              socketID: socketId,
              nickname: nickname,
              roomCode: roomCode,
            }
          );

          navigateTo("/waiting-room");
        } else {
          //Otherwise, navigate to the connect emotibit page
          toast.success("Joining session...");
          setTimeout(() => {
            navigateTo("/connect-emotibit");
          }, 2000);
        }
      } else {
        toast.error(
          "Connection failed. Looks like we couldn't get you connected. Please check the password and try again."
        );
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error(
        "Connection failed. Looks like we couldn't get you connected. Please check the password and try again."
      );
    }
  };

  const validatePassword = async (password: string) => {
    try {
      const response = await axios.post(
        `http://${import.meta.env.VITE_BACKEND_PATH}/joiner/validatePassword`,
        {
          sessionID: sessionId,
          password: password,
        }
      );
      console.log("RESPONSE RECIEVED: ", response.data.success);
      console.log("STATUS: ", response.data.status);
      if (response.status === 200) {
        console.log("Password is valid");
        return true;
      }
      if (response.status === 400) {
        console.log("Password is invalid");
        return false;
      }
    } catch (error) {
      console.error("Could not validate password due to an API Error", error);
      return false;
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex flex-col max-sm:hidden items-center justify-center w-2/5">
        <Toaster position="top-right" />
        <SideComponent
          icon={<WiCloudy style={{ fontSize: "200px" }} />}
          headingTitle="Enter Lobby Password"
          description={`Please enter the password for room ${roomCode}`}
        />
      </div>
      <div className="flex flex-col items-center justify-center w-2/5">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-6">
            <label
              htmlFor="Password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password <span className="text-purple-500">*</span>
            </label>
            <div className="relative">
              <input
                name="password"
                placeholder="Password"
                id="Password"
                type={type}
                className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
              />

              <span
                className="absolute inset-y-0 right-3 cursor-pointer flex justify-around items-center"
                onClick={handleToggle}
              >
                <Icon className="absolute mr-10" icon={icon} size={25} />
              </span>
            </div>
          </div>

          <div className="flex gap-10 items-center justify-center">
            <button
              disabled={!password.trim()}
              type="submit"
              className={`mt-8 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                password.trim()
                  ? "bg-[#7F56D9] hover:bg-violet-500 text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
