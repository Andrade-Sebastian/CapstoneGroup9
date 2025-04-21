import { TbHeartRateMonitor } from "react-icons/tb";
import { FaThermometerEmpty } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { BsChatSquareText } from "react-icons/bs";
import { TbHexagons } from "react-icons/tb";
import { useEffect, useState } from "react";
import socket from "./socket.tsx";
import axios from "axios";
import { Divider } from "@heroui/divider";
import ChartComponent from "../Components/ChartComponent.tsx";
import JoinerCardComponent from "../Components/JoinerCardComponent.tsx"
import { useJoinerStore } from "../hooks/stores/useJoinerStore.ts";
import {React, ReactElement} from "react";
import { stringify } from "postcss";
import { useNavigate } from "react-router-dom";
import ModalComponent from '../Components/ModalComponent.tsx'
import toast, { Toaster } from "react-hot-toast";

export interface IJoiner {
    id: string;
    name: string;
}

export default function SpectatorActiveExperiment() {

  const [selectedButton, setSelectedButton] = useState("heartRate");
  const [experimentID, setExperimentID] = useState(0);
  const [sessionID, setSessionID] = useState("");
  const [activeTab, setActiveTab] = useState("joiners");
  const [activeChart, setActiveChart] = useState("heartRateChart");
  const [recievedData, setRecievedData] = useState<number[]>([]);
  const [photoPath, setPhotoPath] = useState("");
  const [joiners, setJoiners] = useState<IJoiner[]>([]);
  const [selectedJoiner, setSelectedJoiner] = useState<IJoiner>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    nickname,
    roomCode,
    sessionId,
    setSessionId,
    experimentId,
    experimentPath,
    experimentTitle,
    experimentDesc
  } = useJoinerStore();
  const navigateTo = useNavigate();

  const handleOpenModal = () => setIsModalOpen(true)
  const handleCloseModal = () => setIsModalOpen(false)
  const handleAction = () => {
        console.log('Creating lobby...')
        handleSubmit()
        handleCloseModal()
    }

 
  const handleSubmit =() => {
        console.log('in handle submit')
        toast.success("NOW NEED TO GO TO THIS JOINER'S LAB")
        
      }
  useEffect(() => {
    console.log("Running active experiment");
    console.log("Experiment ID in store w/o getState", experimentId)
    console.log(
      "Experiment ID in Store: ",
      useJoinerStore.getState().experimentId
    );
    const getPhotoInfo = async () => {
      const response = await axios
        .get(`http://localhost:3000/joiner/getPhoto/${experimentId}`)
        .then((response) => {//THERE IS NOTHING BEING SET HERE
          console.log("Photo lab path in activity page:", response.data.path);
        });
    };

    socket.on("end-experiment", () => {
      navigateTo("/");
    });

    getPhotoInfo();
    setPhotoPath(experimentPath)
    return () => {
      socket.off("end-experiment");
      //socket.off("update");
    };
  }, []);
  useEffect(() => {
    const getSessionID = async () => {
      const response = await axios
        .get(`http://localhost:3000/joiner/verify-code/${roomCode}`)
        .then((response) => {
          setSessionID(response.data.sessionID);
          setSessionId(sessionID)
          console.log("SessionID", sessionID)
          console.log("SessionID", sessionId)
        });
    }; 
    getSessionID();
  }, []);
  useEffect(() => {
    // if (!sessionID) return;

    const fetchUsers = async () => {
      try {
        console.log("Trying to get users from session " + sessionID);
        const response = await axios.get(
          `http://localhost:3000/joiner/room-users/${sessionID}`
        );
        const users:IJoiner[] = response.data.users.map((user: any, index: number) => ({
            id: user.userid,
            name: user.nickname,
        })); //Array of IUser objects
        console.log("Received users, now attempting to set", users);
        setJoiners(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
    const interval = setInterval(fetchUsers, 5000); // Refresh users every 5 seconds

    return () => clearInterval(interval);
  }, [sessionID]); //Don't fetch any data until sessionID is set

  useEffect(() => {
    const getExperimentData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/joiner/session/getInfo/${roomCode}`
        );
        if (response.status === 200) {
          console.log("EXPERIMENT ID RETURNED: ", response.data.experimentid);
          setExperimentID(response.data.experimentid);
        }
      } catch (error) {
        // toast.error("Failed to get experiment id")
        console.log("Error retrieving experiment id in joiner fe", error);
      }
    };
    getExperimentData();
  }, []);

  useEffect(() =>{
    const fetchStoredPhoto = async () =>{
      const filename = experimentPath.split("/").pop();
      try{
          const response = await axios.get(`http://localhost:3000/get-photo/${filename}`);
          if(response.status === 200){
            console.log("Fetched image path:", response.config.url);
            setPhotoPath(response.config.url);
          }
      }
      catch(error){
        console.log("Error retrieving image:", error);
      }
    };
    fetchStoredPhoto();
  },[experimentPath, setPhotoPath]);

  return (
    <div className="flex h-screen bg-white p-4">
      {/* picture  */}
      <Toaster position="top-right"/>
      <div className="flex flex-col items-center w-3/4 p-auto bg-white shadow-md rounded-lg">
        <div className="flex justify-center w-full">
          <img src={photoPath} className="rounded-lg w-full max-w-lg h-auto" alt="Experiment Image" />
        </div>
        {/* Chart stuff*/}
        <div className="w-full mt-4 bg-gray-200 h-auto rounded-md flex flex-col items-center justify-center text-gray-500 p-4">
          <div className="w-full">
            {activeChart === "heartRateChart" ? (
              <div>
                <div className="text-lg font-semibold">
                  ECG Chart - 33 BPM Average
                </div>
                <ChartComponent
                  chart_type={1}
                  chart_name="BPM"
                  chart_color="rgb(23, 190, 207)"
                  user_id={selectedJoiner?.id}
                />
              </div>
            ) : activeChart === "temperatureChart" ? (
              <div>
                <p>temperature chart</p>{" "}
                <ChartComponent
                  chart_type={2}
                  chart_name="°F"
                  chart_color="rgb(255, 99, 132)"
                  user_id={selectedJoiner?.id}
                />
              </div>
            ) : (
              <div>
                <p> GSR/EDA </p>{" "}
                <ChartComponent
                  chart_type={3}
                  chart_name="EDA"
                  chart_color="rgb(75,0,130)"
                  user_id={selectedJoiner?.id}
                />
              </div>
            )}
          </div>
        </div>
        <Divider className="my-3" />
        <div className="mt-4 flex justify-between w-full items-center">
          <p className="font-semibold">
            Nickname: <span className="font-light">{nickname}</span>
          </p>
          <div>
            <p className="font-semibold"> Viewing: <span className="font-light"> {selectedJoiner?.name}</span></p>
          </div>
          <div className="flex space-x-4">
            <button
              className={`text-3xl p-4 rounded-lg ${
                selectedButton === "heartRate"
                  ? "bg-[#7F56D9] text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => {
                setSelectedButton("heartRate");
                setActiveChart("heartRateChart");
              }}
            >
              <TbHeartRateMonitor />
            </button>
            <button
              className={`text-3xl p-4 rounded-lg ${
                selectedButton === "temperature"
                  ? "bg-[#7F56D9] text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => {
                setSelectedButton("temperature");
                setActiveChart("temperatureChart");
              }}
            >
              <FaThermometerEmpty />
            </button>
            <button
              className={`text-3xl p-4 rounded-lg ${
                selectedButton === "skin"
                  ? "bg-[#7F56D9] text-white"
                  : "bg-gray-300"
              }`}
              onClick={() => {
                setSelectedButton("skin");
                setActiveChart("skinChart");
              }}
            >
              <TbHexagons />
            </button>
          </div>
        </div>
      </div>
      {/* tabs */}
      <div className="w-1/4 h-screen p-4 bg-white shadow-md rounded-lg overflow-y-auto">
        <div className="flex border-b">
          <button
            className={`rounded-lg flex-1 p-2 text-lg flex items-center justify-center ${
              activeTab === "joiners" ? "bg-[#7F56D9] text-white" : "bg-gray-300"
            }`}
            onClick={() => setActiveTab("joiners")}
          >
            <FaUsers className="mr-2 mt-1 size-6" /> Joiners
          </button>
          <button
            className={`rounded-lg flex-1 p-2 text-lg flex items-center justify-center ${
              activeTab === "chat" ? "bg-[#7F56D9] text-white" : "bg-gray-300"
            }`}
            onClick={() => setActiveTab("chat")}
          >
            <BsChatSquareText className="mr-2" /> Chat
          </button>
        </div>

        {/* Joiner Cards */}
        <div className="mt-4">
          {activeTab === "joiners" ? (
            <div className="flex-col gap-4 overflow-y-auto max-h-[300px] p-4 border rounded-md shadow-md ">
                {joiners.length === 0 ? (
                    <p className ="text-red text-center"> No joiners available</p>
                ): (
               joiners.map((joiner) => (
              <JoinerCardComponent
                key={joiner.id}
                joiner={joiner}
                icon={<FaRegCircleUser className="text-2xl" />}
                fileName="experiment.jpeg"
                isSelected={selectedJoiner?.id === joiner.id}
                onSelect={() => {setSelectedJoiner(joiner); handleOpenModal();}}
              />)))}
            </div>
           ): (
            <div className="p-4 text-gray-500"> Chat Feature </div>
          )}
        </div>
      </div>
      <ModalComponent
        onAction={handleAction}
        isOpen={isModalOpen}
        onCancel={handleCloseModal}
        modalTitle="View Joiner"
        button="View"
      >
        <div className="mb-6">
          <h1 className="text-md text-gray-700 mb-2">
            Are you sure you want view this joiner?
          </h1>
        </div>
      </ModalComponent>
    </div>
  );
}

