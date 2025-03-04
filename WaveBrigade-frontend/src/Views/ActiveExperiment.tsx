import { useLocation } from "react-router-dom";
import { TbHeartRateMonitor } from "react-icons/tb";
import { FaThermometerEmpty } from "react-icons/fa";
import { LuSquareStack } from "react-icons/lu";
import { BsChatSquareText } from "react-icons/bs";
import { TbHexagons } from "react-icons/tb";
import { useEffect, useState } from "react";
import socket from "./socket.tsx";
import axios from "axios";
import { Divider } from "@heroui/divider";
import ChartComponent from "../Components/ChartComponent.tsx";
import { useJoinerStore } from "../hooks/stores/useJoinerStore.ts";
import React from "react";
import { stringify } from "postcss";
import { useNavigate } from "react-router-dom";

export default function ActiveExperiment() {
  const [selectedButton, setSelectedButton] = useState("heartRate");
  const [activeTab, setActiveTab] = useState("images");
  const [activeChart, setActiveChart] = useState("heartRateChart");
  const [recievedData, setRecievedData] = useState<number[]>([]);
  const [photoPath, setPhotoPath] = useState("");
  const { isConnected, serial, nickname, roomCode, experimentId, experimentTitle, experimentDesc} = useJoinerStore();
  const navigateTo = useNavigate();

  useEffect(() => {
    console.log("Running active experiment");
    console.log("Experiment ID in Store: ", useJoinerStore.getState().experimentId);
    const getPhotoInfo = async () => {
      const response = await axios.get(`http://localhost:3000/joiner/getPhoto/${experimentId}`)
      .then((response) => {
        console.log("PHOTO LAB RESPONSE RECIEVED: ", response);
        setPhotoPath(response.data.path);
      })
    }

    socket.on("end-experiment", () => {
      navigateTo('/');
    });

    getPhotoInfo();


    // socket.on("update", (data) => {
    //   if (Array.isArray(data)) {
    //     console.log("Data received:", data);
    //     setRecievedData(data);
    //   } else {
    //     console.error("Did not receive an array of data, received:", data);
    //   }
    // });
    return () => {
      socket.off("end-experiment");
      //socket.off("update");
    };
  }, []);

  return (
    <div className="flex h-screen bg-white p-4">
      {/* picture  */}
      <div className="flex flex-col items-center w-3/4 p-auto bg-white shadow-md rounded-lg">
        <div className="flex justify-center w-full">
          <img
            src={photoPath}
            alt="a photo"
            className="rounded-lg w-full max-w-lg h-auto"
          />
        </div>
        {/* Chart stuff*/}
        <div className="w-full mt-4 bg-gray-200 h-auto rounded-md flex flex-col items-center justify-center text-gray-500 p-4">
          <div className="w-full">
            {activeChart === "heartRateChart" ?(
            <div> 
          <div className="text-lg font-semibold">
            ECG Chart - 33 BPM Average
          </div>
            <ChartComponent chart_type={1} chart_name="BPM" chart_color="rgb(23, 190, 207)"/>
            </div>
            ) : activeChart === "temperatureChart" ? (
              <div> <p>temperature chart</p> <ChartComponent chart_type={2} chart_name="°F" chart_color="rgb(255, 99, 132)" /></div>
            ) :(
              <div> <p> GSR/EDA </p> <ChartComponent chart_type={3} chart_name="EDA" chart_color="rgb(75,0,130)"/> </div>
            )}
          </div>
        </div>
        <Divider className="my-3" />
        <div className="mt-4 flex justify-between w-full items-center">
          <p className="font-semibold">Nickname: {nickname} <span className="font-light"></span></p>
          <div className="flex space-x-4">
            {/* <button
              className={`text-3xl p-4 rounded-lg ${
                selectedButton === "heartRate"
                  ? "bg-[#7F56D9] text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => {setSelectedButton("heartRate"); setActiveChart("heartRateChart");}}
            >
              <TbHeartRateMonitor />
            </button> */}
            <button
              className={`text-3xl p-4 rounded-lg ${
                selectedButton === "temperature"
                  ? "bg-[#7F56D9] text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => {setSelectedButton("temperature"); setActiveChart("temperatureChart");}}
            >
              <FaThermometerEmpty />
            </button>
            <button
              className={`text-3xl p-4 rounded-lg ${
                selectedButton === "skin"
                  ? "bg-[#7F56D9] text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => {setSelectedButton("skin"); setActiveChart("skinChart");}}
            >
              <TbHexagons />
            </button>
          </div>
        </div>
      </div>
      {/* tabs */}
      <div className="w-1/4 p-4 bg-white shadow-md rounded-lg overflow-y-auto">
        <div className="flex border-b">
          <button
            className={`rounded-lg flex-1 p-2 text-lg flex items-center justify-center ${
              activeTab === "images"
                ? "bg-[#7F56D9] text-white"
                : "bg-gray-300"
            }`}
            onClick={() => setActiveTab("images")}
          >
            <LuSquareStack className="mr-2"/> Images
          </button>
          <button 
            className={`rounded-lg flex-1 p-2 text-lg flex items-center justify-center ${
              activeTab === "chat"
                ? "bg-[#7F56D9] text-white"
                : "bg-gray-300"
            }`}
            onClick={() => setActiveTab("chat")}
          >
            <BsChatSquareText className="mr-2"/> Chat
          </button>
        </div>
        <div className="mt-4">
          {activeTab ==="images" ? (
            <div>
              <p> Obama</p>
              </div>
          ): (
            <div className="p-4 text-gray-500"> Chat Feature   </div>       )}
            </div>
        
      </div>
    </div>
  );
}
