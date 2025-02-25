import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SideComponent from "../Components/SideComponent.tsx";
import { v4 as uuidv4 } from "uuid";
import socket from "./socket.tsx";
import axios from "axios";
import { useJoinerStore } from "../hooks/stores/useJoinerStore.ts";
import { PiPlanetLight } from "react-icons/pi";
import toast, { Toaster } from "react-hot-toast";
import React from "react";

export default function JoinPage() {
  const [nickName, setNickName] = useState("");
  const [StudentInputRoomCode, setStudentInputRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isSpectator, setIsSpectator] = useState("");
  const [userId, setUserId] = useState("");
  const navigateTo = useNavigate();
  const [sessionID, setSessionID] = useState("")
  const [users, setUsers] = useState<string[]>([]) //list of users to send to waiting room
  const [socketID, setSocketID] = useState("");
  const { setNickname, setRoomCode} = useJoinerStore()



  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToastId = toast.loading("Verifying Room Code...");
  
    if (!StudentInputRoomCode && !nickName) {
      console.error("Please enter both a nickname and a room code...");
      return;
    }
    else{
      if(StudentInputRoomCode.length !== 5){
        console.error("Please enter a valid room code");
        return;
      }
    }
    
    try{
      const isValidRoomCode = await validateRoomCode(StudentInputRoomCode);
      if (isValidRoomCode) {
        toast.success("Connection Successful! Please standby", {id: loadingToastId});
        const isJoinedRoom = await joinRoom();
        if(isJoinedRoom){
          setTimeout(() => {
            navigateTo("/connect-emotibit", {
              state: {
                nickName: nickName,
                roomCode: StudentInputRoomCode,
              }
            });
          })
        }
    }
    else{
      toast.error("Connection failed. Looks like we couldn't get you connected. Please check your room code and try again.", {id: loadingToastId});
    }
    }catch(error){
      console.error("Error verifying code:", error);
      toast.error("Connection failed. Looks like we couldn't get you connected. Please check your room code and try again.", {id: loadingToastId})
    }
  };

  const validateRoomCode = async (StudentInputRoomCode) => {
    try {
      const response = await axios.get(`http://localhost:3000/joiner/validateRoomCode/${StudentInputRoomCode}`);
      if (response.status === 200) {
        console.log("Room code is valid!");
        setSessionID(response.data.sessionID);  // Store sessionID when room code is valid
        setRoomCode(StudentInputRoomCode)
        setNickname(nickName)
        return true;
      }
      return false;
    } catch (error) {
      console.error("Could not validate room code due to an API Error", error);
      return false;
    }
  };

  const joinRoom = async () => {
    try{
      console.log("Socket ID: " + socketID);
      console.log("Session ID: " + sessionID);
      const response = await axios.get(`http://localhost:3000/joiner/join-session/${sessionID}/${socketID}`);
      if(response.status === 200){
        console.log("Added user to session!");
        return true;
      }
    }
    catch(error){
        console.error("Could not add User to session", error);
        return false;
      }
    }
    

  return (
    <div className="flex h-screen">
      <div className="flex flex-col max-sm:hidden items-center justify-center w-2/5">
      <Toaster position="top-right" />
      <SideComponent
        icon={<PiPlanetLight style={{ fontSize: "200px" }} />}  
        headingTitle="Enter Your Nickname and Room Code"
        description="We need to know who you are! Enter your name and the room code to get started"
      />
      </div>
      <div className="flex flex-col items-center justify-center w-2/5">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-6">
            <div>
              <label htmlFor="nickName" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Name<span className="text-purple-500"> *</span>
              </label>
              <input
                type="text"
                id="nickName"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setNickName(e.target.value)}
                value={nickName}
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="StudentInputRoomCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Room Code<span className="text-purple-500"> *</span>
              </label>
              <input
                type="text"
                id="StudentInputRoomCode"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setStudentInputRoomCode(e.target.value)}
                value={StudentInputRoomCode}
              />
            </div>
          </div>

          <div className="flex gap-10 items-center justify-center">
            <button
              disabled={!nickName.trim() || !StudentInputRoomCode.trim()}
              type="submit"
              className={`mt-8 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                nickName.trim() && StudentInputRoomCode.trim()
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
