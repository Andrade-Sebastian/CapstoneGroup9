import { TbHeartRateMonitor } from "react-icons/tb";
import { FaThermometerEmpty } from "react-icons/fa";
import { LuSquareStack } from "react-icons/lu";
import { BsChatSquareText } from "react-icons/bs";
import { TbHexagons } from "react-icons/tb";
import { useEffect, useState, useRef } from "react";
import socket from "./socket.tsx";
import axios from "axios";
import { Divider } from "@heroui/divider";
import ChartComponent from "../Components/ChartComponent.tsx";
import { useJoinerStore } from "../hooks/stores/useJoinerStore.ts";
import toast, { Toaster } from 'react-hot-toast'
import React from "react";
import { stringify } from "postcss";
import { useNavigate } from "react-router-dom";
import ReactPlayer from 'react-player';

export default function ActiveExperiment() {
  const [selectedButton, setSelectedButton] = useState("heartRate");
  const [activeTab, setActiveTab] = useState("images");
  const [activeChart, setActiveChart] = useState("heartRateChart");
  const [recievedData, setRecievedData] = useState<number[]>([]);
  const [isMediaAFile, setIsMediaAFile] = useState(false)
  const [photoPath, setPhotoPath] = useState("");
  const [videoPath, setVideoPath] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const [videoID, setVideoID] = useState("");
  const {
    isConnected,
    serial,
    nickname,
    roomCode,
    experimentId,
    experimentPath,
    experimentTitle,
    experimentDesc,
    experimentType
  } = useJoinerStore();
  const navigateTo = useNavigate();

  
  useEffect(() => {
    const checkVideoMediaType = () =>{
      console.log("Detecting type of media based on path...   ExperimentPath: ",experimentPath)
      if(experimentPath){
        if(experimentPath.length === 11){ //very flimsy way of detecting if the video is a youtube video. All youtube videoIDs have a length of 11 which is why this is done. There must be a better way.....
          console.log("Detected video as a YouTube link. Path length:", experimentPath.length);
          setIsMediaAFile(false);
          return;
        }
        else{
          console.log("Detected video as a file. Path length:", experimentPath.length)
          setIsMediaAFile(true);
          return;
        }
    }
    else{
      console.log("Experimentpath is empty", experimentPath)
      return;
    }
    }
    if (experimentType === 1) {
      console.log("ExperimentType is:", experimentType)
      checkVideoMediaType();
    } else {
      console.log('Invalid experiment ID')
    }
  }, [experimentPath, experimentType, videoPath])

  useEffect(() => {
    console.log("Running active experiment");
    console.log("Experiment ID in store w/o getState", experimentId)
    console.log(
      "Experiment ID in Store: ",
      useJoinerStore.getState().experimentId
    );
    if(!experimentId){
      console.log("Experiment ID is null, aborting the fetch...");
      return;
    }
      const getPhotoInfo = async () => {
        const response = await axios
          .get(`http://localhost:3000/joiner/getPhoto/${experimentId}`)
          .then((response) => {//THERE IS NOTHING BEING SET HERE
            console.log("Photo lab path in activity page:", response.data.path);
          });
      };
    

      const getVideoInfo = async () => {
        const response = await axios
          .get(`http://localhost:3000/joiner/getVideoFile/${experimentId}`)
          .then((response) => {//THERE IS NOTHING BEING SET HERE
            console.log("Video lab path in activity page:", response.data.path);
            setVideoID(response.data.path);
            console.log("VideoID set to ", videoID)
          });
      };


    socket.on("end-experiment", () => {
      navigateTo("/");
    });

    if(experimentType === 1){
      setVideoPath(experimentPath)
      getVideoInfo();
    }
    if(experimentType === 2){
      setPhotoPath(experimentPath)
      getPhotoInfo();
    }

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

  useEffect(() =>{
    const fetchStoredPhoto = async () =>{
      const filename = experimentPath.split("/").pop();
      try{
          const response = await axios.get(`http://localhost:3000/get-photo/${filename}`);
          if(response.status === 200){
            console.log("Fetched image path:", response.config.url);
            setPhotoPath(response.config.url);
            toast.success("Successfully retreived photo!")
          }
      }
      catch(error){
        console.log("Error retrieving image:", error);
      }
    };

    const fetchStoredVideo = async () => {
      const filename = experimentPath.split("/").pop();
      try{
        const response = await axios.get(`http://localhost:3000/get-videoFile/${filename}`);
        if(response.status === 200){
          console.log("Fetched video path:", response.config.url);
          setVideoPath(response.config.url);
          toast.success("Successfully retreived video!")
        }
      }
      catch(error){
        console.log("Error retrieving video:", error);
      }
    }
    if(experimentType === 1){
      console.log("Fetching video...")
      fetchStoredVideo();
    }
    if(experimentType === 2){
      console.log("Fetching photo...")
      fetchStoredPhoto();
    }
  },[experimentPath, experimentType, setPhotoPath, setVideoPath]);


  useEffect(()=> {
    socket.on("play-video", (data) =>{
      console.log("Recieved event play-video.", data)
      setIsPlaying(data)
      console.log("The variable isPlaying is set to", isPlaying)
    } );

    socket.on("seek-video", (seconds) =>{
      console.log("Recieved event seek-video", seconds);
      if(playerRef.current){
        playerRef.current.seekTo(seconds, "seconds");
      }
    })
    return () => {
      socket.off("play-video")
      socket.off("seek-video")
    }
  },[])


  return (
    <div className="flex h-screen bg-white p-4">
      {/* picture  */}
      <Toaster position="top-right" />
      <div className="flex flex-col items-center w-3/4 p-auto bg-white shadow-md rounded-lg">
        <div className="flex justify-center w-full">
          {experimentType == 1 && isMediaAFile ? (
            <div>
              <ReactPlayer ref={playerRef} url={videoPath} playing={isPlaying} controls={true}/>
              </div>
          ) : experimentType ==1 && !isMediaAFile ? (
            <div>
              <ReactPlayer ref={playerRef} url={`https://www.youtube.com/embed/${videoID}`} playing={isPlaying} controls={false} config={{youtube: { playerVars: { showinfo: 0}}}}/>
              </div>
          ) : experimentType == 2 ? (
            <img src={photoPath} className="rounded-lg w-full max-w-lg h-auto" alt="Experiment Image" /> 
            
          ): experimentType == 3 ? (
            <div>
              <p>Gallery lab stuff</p>
              </div>
          ) : (
            <div>
              <p> Article lab stuff</p>
            </div>
          )}
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
                  user_id=""
                />
              </div>
            ) : activeChart === "temperatureChart" ? (
              <div>
                {" "}
                <p>temperature chart</p>{" "}
                <ChartComponent
                  chart_type={2}
                  chart_name="°F"
                  chart_color="rgb(255, 99, 132)"
                  user_id=""
                />
              </div>
            ) : (
              <div>
                {" "}
                <p> GSR/EDA </p>{" "}
                <ChartComponent
                  chart_type={3}
                  chart_name="EDA"
                  chart_color="rgb(75,0,130)"
                  user_id=""
                />{" "}
              </div>
            )}
          </div>
        </div>
        <Divider className="my-3" />
        <div className="mt-4 flex justify-between w-full items-center">
          <p className="font-semibold">
            Nickname: <span className="font-light">{nickname}</span>
          </p>
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
      <div className="w-1/4 p-4 bg-white shadow-md rounded-lg overflow-y-auto">
        <div className="flex border-b">
          <button
            className={`rounded-lg flex-1 p-2 text-lg flex items-center justify-center ${
              activeTab === "images" ? "bg-[#7F56D9] text-white" : "bg-gray-300"
            }`}
            onClick={() => setActiveTab("images")}
          >
            <LuSquareStack className="mr-2" /> Images
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
        <div className="mt-4">
          {activeTab === "images" ? (
        <div className="flex justify-center w-full">
        {experimentType == 1 && isMediaAFile ? (
          <div>
            <p>Local Video: {videoPath}</p>
            </div>
        ) : experimentType ==1 && !isMediaAFile ? (
          <div>
            <p>YouTube Video: https://www.youtube.com/embed/{videoID} </p>
            </div>
        ) : experimentType == 2 ? (
            <p>Image: {photoPath}</p>
          
        ): experimentType == 3 ? (
          <div>
            <p>Gallery lab stuff</p>
            </div>
        ) : (
          <div>
            <p> Article lab stuff</p>
          </div>
        )}
      </div>
          ) : (
            <div className="p-4 text-gray-500"> Chat Feature </div>
          )}
        </div>
      </div>
    </div>
  );
}
