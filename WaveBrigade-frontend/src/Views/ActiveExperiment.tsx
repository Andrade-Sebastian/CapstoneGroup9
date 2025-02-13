import { useLocation } from "react-router-dom";
import { TbHeartRateMonitor } from "react-icons/tb";
import { FaThermometerEmpty } from "react-icons/fa";
import { LuSquareStack } from "react-icons/lu";
import { BsChatSquareText } from "react-icons/bs";
import { TbHexagons } from "react-icons/tb";
import { useEffect, useState } from "react";
import socket from "./socket.tsx";
import { Divider } from "@heroui/divider";
import ChartComponent from "../Components/ChartComponent.tsx";
import React from "react";

export default function ActiveExperiment() {
  const [selectedButton, setSelectedButton] = useState("heartRate");
  const [activeTab, setActiveTab] = useState("images");
  const [activeChart, setActiveChart] = useState("heartRateChart");
  const [recievedData, setRecievedData] = useState<number[]>([]);
  const location = useLocation();
  const { nickName } = location.state || {};

  useEffect(() => {
    console.log("Running active experiment");

    socket.on("update", (data) => {
      if (Array.isArray(data)) {
        console.log("Data received:", data);
        setRecievedData(data);
      } else {
        console.error("Did not receive an array of data, received:", data);
      }
    });
    return () => {
      socket.off("update");
    };
  }, [recievedData]);

  return (
    <div className="flex h-screen bg-white p-4">
      {/* picture  */}
      <div className="flex flex-col items-center w-3/4 p-6 bg-white shadow-md rounded-lg">
        <div className="flex justify-center w-full">
          <img
            src="https://www.usatoday.com/gcdn/authoring/authoring-images/2024/08/19/USAT/74862648007-getty-images-2087314411.jpg?crop=1023,576,x0,y53&width=660&height=371&format=pjpg&auto=webp"
            alt="obama"
            className="rounded-lg w-full max-w-5xl h-auto"
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
            <ChartComponent />
            </div>
            ) : activeChart === "temperatureChart" ? (
              <div> <p>temperature chart</p></div>
            ) :(
              <div> <p> GSR/EDA </p> </div>
            )}
          </div>
        </div>
        <Divider className="my-3" />
        <div className="mt-4 flex justify-between w-full items-center">
          <p className="font-semibold">Nickname: {nickName} <span className="font-light">Sebastian</span></p>
          <div className="flex space-x-4">
            <button
              className={`text-3xl p-4 rounded-lg ${
                selectedButton === "heartRate"
                  ? "bg-[#7F56D9] text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => {setSelectedButton("heartRate"); setActiveChart("heartRateChart");}}
            >
              <TbHeartRateMonitor />
            </button>
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
