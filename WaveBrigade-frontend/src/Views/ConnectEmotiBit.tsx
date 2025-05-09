import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SideComponent from "../Components/SideComponent";
import { PiAtomThin } from "react-icons/pi";
import SerialCodeInput from "../Components/SerialInput";
import axios from "axios";
import socket from "./socket.tsx";
import toast, { Toaster } from "react-hot-toast";
import { useJoinerStore } from "../hooks/stores/useJoinerStore.ts";
import React from "react";

export default function ConnectEmotiBit() {
  const [code, setCode] = useState("");
  const [device, setDevice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigateTo = useNavigate();
  const {
    setExperimentId,
    setExperimentTitle,
    setExperimentDesc,
    setIsConnected,
    setSerial,
    setDeviceId,
    nickname,
    roomCode,
    socketId,
    setSessionId,
    setJoinerId,
    joinerId,
  } = useJoinerStore();

  const handleComplete = (code: string) => {
    console.log("Serial Code Entered:", code);
    setCode(code);
  };

  useEffect(() => {
    if (joinerId) {
      console.log("Registering joinerId with backend:", joinerId);
      socket.emit("register-user", joinerId);
      socket.emit("join-room");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loadingToastId = toast.loading("Verifying code...");
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log("stuff: ", nickname, " | ", roomCode, " | ", code);
      //logic for sending code to backend
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_PATH}/joiner/verify-serial`,
        {
          nickName: nickname,
          roomCode: roomCode,
          serialCode: code,
        }
      );
      //does not pass this

      const { success, deviceID } = response.data;
      console.log("RESPONSE DATA: ", response.data);
      // console.log("DEVICE ID RETURNED FROM RESPONSE: ", deviceID);
      // setDevice(deviceID);
      // console.log("DEVICE ID STORED IN REACT STATE: ", device);

      if (success) {
        toast.success(
          "Connection Successful! Your EmotiBit was connected successfully",
          { id: loadingToastId }
        );
        socket.emit("joiner-connected", {
          socketID: socketId,
          nickname: nickname,
          lastFourSerial: code,
        });
        setIsConnected(true);
        setSerial(code);
        setDeviceId(deviceID);
        await joinRoom(deviceID);
        setTimeout(() => {
          navigateTo("/waiting-room");
        }, 2000);
      } else {
        //serial code doesn't match...
        toast.error(
          "Connection failed. Looks like we couldn't get you connected. Please check your serial number and try again.",
          { id: loadingToastId }
        );
      }
    } catch (error) {
      console.log("error verifying code!");
      console.error("Error verifying code:", error);
      toast.error(
        "Connection failed. Looks like we couldn't get you connected. Please check your serial number and try again.",
        { id: loadingToastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const joinRoom = async (device: number) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_PATH}/joiner/session/join/`,
        {
          socketID: socketId,
          nickname: nickname,
          roomCode: roomCode,
          serialNumberLastFour: code,
          deviceID: device,
        }
      );
      if (response.status === 200) {
        console.log("RESPONSE AFTER ADDING USER: ", response.data);
        setSessionId(response.data.joiner_sessionid);
        setJoinerId(response.data.joiner_userid);
        console.log("JOINER", joinerId);

        console.log("Added user to session!");
        return true;
      }
    } catch (error) {
      console.error("Could not add User to session", error);
      return false;
    }
  };

  return (
    <div className="flex h-screen">
      <Toaster position="top-right" />
      <div className="flex flex-col items-center justify-center w-2/5">
        <SideComponent
          icon={<PiAtomThin style={{ fontSize: "200px" }} />}
          headingTitle="Connect Your EmotiBit"
          description="It's time to grab your EmotiBit! Find its serial number and enter the last four digits to continue"
        />
      </div>
      <div className="flex flex-col items-center justify-center w-2/5">
        <form className="w-full max-w-md" onSubmit={handleSubmit}>
          <div className="flex flex-col items-center justify-center ">
            <SerialCodeInput
              length={4}
              onComplete={handleComplete}
              onChange={(updatedCode) => setCode(updatedCode)}
            />
            <button
              disabled={code.length !== 4}
              type="submit"
              className={`mt-14 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                code.length === 4
                  ? "bg-[#7F56D9] hover:bg-violet-500 text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              Join Lobby
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
