import { React, ReactElement, useCallback, useEffect, useState} from "react"
import { useSessionStore } from "../store/useSessionStore.tsx"
import { useParams } from 'react-router-dom'
import { TbHeartRateMonitor } from "react-icons/tb";
import { FaThermometerEmpty } from "react-icons/fa";
import { LuSquareStack } from "react-icons/lu";
import { BsChatSquareText } from "react-icons/bs";
import { TbHexagons } from "react-icons/tb";
import socket from "./socket.tsx";
import axios from "axios";
import { Divider } from "@heroui/divider";
import ChartComponent from "../Components/ChartComponent.tsx";
import { useJoinerStore } from "../hooks/stores/useJoinerStore.ts";
import { stringify } from "postcss";
import { useNavigate } from "react-router-dom";
import { session } from "electron";


export default function ActivityStudentView(): ReactElement{
    const echoProcessAPI = window.api
    const [selectedButton, setSelectedButton] = useState("heartRate");
    const [activeTab, setActiveTab] = useState("images");
    const [activeChart, setActiveChart] = useState("heartRateChart");
    const [recievedData, setRecievedData] = useState<number[]>([]);
    const [currentUser, setCurrentUser] = useState("");
    const [currentPath, setCurrentPath] = useState("");
    const [fileName, setFileName] = useState("");
    const { users } = useSessionStore()

    const {sessionId, userId, experimentType} = useParams();
    console.log("PARAMS RECIEVED: ", sessionId, userId, experimentType);

    useEffect(() => {
      const getUserData = async () => {
        try{
          const response = await axios.get(`http://localhost:3000/host/get-user-experiment/${sessionId}/${userId}/${experimentType}`);
          console.log("RESPONSE RECIEVED IN ACTIVITYSTUDENTVIEW", response.data);
          if(response.status === 200){
            setCurrentUser(response.data.nickname);
            setFileName(response.data.path);
          }
        }
        catch(error){
          console.error("Error retrieving user data", error);
        }
      }

      getUserData()
    }, [sessionId, experimentType, userId]);

    useEffect(() =>{
      const fetchStoredPhoto = async () =>{
        // const filename = experimentPath.split("/").pop();
        try{
            const response = await axios.get(`http://localhost:3000/get-photo/${fileName}`);
            if(response.status === 200){
              console.log("Fetched image path:", response.config.url);
              setCurrentPath(response.config.url);
            }
        }
        catch(error){
          console.log("Error retrieving image:", error);
        }
      };
      fetchStoredPhoto();
    },[setCurrentPath]);

    

    return(
      <div className="flex flex-row h-screen w-full bg-white p-6 gap-6">
      {/* picture  */}
      <div className="flex flex-col w-2/3 bg-white shadow-md rounded-lg p-4">
        <div className="relative w-full flex-grow">
          <img
            src={currentPath}
            alt="Profile"
            className="rounded-lg w-full max-w-lg h-auto"
          />
          <p className="absolute top-2 left-2 bg-white text-black px-2 py-1 text-sm rounded-md">
            {fileName}
          </p>
        </div>
        <div className="flex justify-between items-center mt-auto py-4">
          <p className="font-semibold">Viewing Joiner: <span className="font-light">{currentUser}</span></p>
          <div className="flex space-x-4">
            <button
              className="bg-[#7F56D9] hover:bg-violet text-3xl p-4 rounded-lg text-white cursor-pointer"
              onClick={() => {setSelectedButton("heartRate"); setActiveChart("heartRateChart");}}
            >
              Mask
            </button>
            <button className="bg-[#F54884] hover:bg-[#F02B70] text-3xl p-4 rounded-lg text-white cursor-pointer">
              Kick
            </button>
          </div>
        </div>
      </div>
       {/* Chart stuff*/}
       <div className="w-1/3 flex flex-col gap-4">
          <div className="bg-white shadow-md rounded-lg p-4">
            <p className="text-lg font-semibold">ECG Chart - 33 BPM Average</p>
            {/* <ChartComponent chart_type={1} chart_name="BPM" chart_color="rgb(255,0,0)"/> */}
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
          <p className="text-lg font-semibold">Thermister (BodyTemperature) - 98°F Average</p>
            <ChartComponent chart_type={2} chart_name="°F" chart_color="rgb(0,0,255)"/>
          </div>
          <div className="bg-white shadow-md rounded-lg p-4">
          <p className="text-lg font-semibold">Galvanic Skin Response (GSR) - 3.4 μS Average</p>
            <ChartComponent chart_type={3} chart_name="EDA" chart_color="rgb(75,0,130)"/>
          </div>
        </div>
    </div>
  );
}
