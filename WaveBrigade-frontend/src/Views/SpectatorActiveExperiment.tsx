import { TbHeartRateMonitor } from "react-icons/tb";
import { FaThermometerEmpty } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { FaRegCircleUser } from "react-icons/fa6";
import { BsChatSquareText } from "react-icons/bs";
import { TbHexagons } from "react-icons/tb";
import { useEffect, useState, useRef } from "react"; 

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
import GalleryViewer from "../Components/GalleryViewer.tsx";
import ReactPlayer from "react-player";
import ChatBody from "../Components/ChatBody.tsx";
import ChatFooter from "../Components/ChatFooter.tsx";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const [photoPath, setPhotoPath] = useState("");
  const [articlePath, setArticlePath] = useState("");
  const [videoPath, setVideoPath] = useState("");
  const [isMasked, setIsMasked] = useState(false);
  const [selectedCaption, setSelectedCaption] = useState("");
  const [galleryPath, setGalleryPath] = useState("");
  const [joiners, setJoiners] = useState<IJoiner[]>([]);
  const [selectedJoiner, setSelectedJoiner] = useState<IJoiner>();
  const [isMediaAFile, setIsMediaAFile] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoID, setVideoID] = useState("");
  const [articleURL, setArticleURL] = useState("");
  const [currentGalleryPhotoID, setCurrentGalleryPhotoID] = useState(0);
  const {
    nickname,
    roomCode,
    sessionId,
    setSessionId,
    joinerId,
    experimentId,
    galleryPhotos,
    experimentPath,
    experimentTitle,
    experimentDesc,
    experimentType
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
        toast.success("Now viewing joiner")
      }
  
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
    }
  const checkArticleMediaType = () =>{
      console.log("Detecting type of media based on path...   ExperimentPath: ",experimentPath)
      if(experimentPath){
        if(experimentPath.startsWith("https://") || experimentPath.startsWith("http://")){ 
          console.log("Detected a link", experimentPath);
          setIsMediaAFile(false);
          return;
        }
        else{
          console.log("Detected article as a file.", experimentPath)
          setIsMediaAFile(true);
          return;
        }
      }
      else{
        console.log("Experiment path is empty", experimentPath)
        return;
      }
      }
      if (experimentType === 1) {
        console.log("ExperimentType is:", experimentType)
        checkVideoMediaType();
      } 
      else if (experimentType === 4) {
        console.log("ExperimentType is:", experimentType)
        checkArticleMediaType();
      }
      else {
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
    const getGalleryInfo = async () => {
      const response = await axios
        .get(`http://localhost:3000/joiner/getGallery/${experimentId}`)
        .then((response) => {//THERE IS NOTHING BEING SET HERE
          console.log("Gallery lab path in activity page:", response.data.path);
        });
    };
    
    const getArticleInfo = async () => {
      const response = await axios
        .get(`http://localhost:3000/joiner/getArticleFile/${experimentId}`)
        .then((response) => {//THERE IS NOTHING BEING SET HERE
          console.log("Article lab path in activity page:", response.data.path);
          setArticleURL(response.data.path);
          console.log("ArticleURL set to ", articleURL)
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
  if(experimentType === 3){
    setGalleryPath(experimentPath)
    getGalleryInfo();
  }
  if(experimentType === 4){
    setArticlePath(experimentPath)
    getArticleInfo();
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
        console.log("HERE IS THE RESPONSE", response);
        const users: IJoiner[] = response.data.users
        .filter((user: any) => user.userrole !== "spectator")
        .map((user: any) => ({
          id: user.userid,
          name: user.nickname,
          role: user.userrole
      }));
       //Array of IUser objects
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
    const fetchStoredGallery = async (filename: string) => {
      try{
        const response = await axios.get(`http://localhost:3000/get-gallery/${filename}`);
        if(response.status === 200){
          console.log("Fetched photo path:", response.config.url);
          setGalleryPath(response.config.url);
          toast.success("Successfully retreived image!")
        }
      }
      catch(error){
        console.log("Error retrieving image from gallery:", error);
      }
    }
    const fetchStoredArticle = async () => {
      const filename = experimentPath.split("/").pop();
      try{
        const response = await axios.get(`http://localhost:3000/get-articleFile/${filename}`);
        if(response.status === 200){
          console.log("Fetched article path:", response.config.url);
          setArticlePath(response.config.url);
          toast.success("Successfully retreived article!")
        }
      }
      catch(error){
        console.log("Error retrieving article:", error);
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
    if(experimentType === 3 && galleryPhotos.length > 0){
      console.log("Fetching gallery...")
      socket.on("image-selected", (imageData) => {
      console.log("Gallery image-selected event recieved. Host changed the image, fetching stored gallery...", imageData);
      setSelectedCaption(imageData.caption);
      const matchedPhoto = galleryPhotos.find(photo => photo.id === imageData.id);
      if(matchedPhoto) {
        setCurrentGalleryPhotoID(matchedPhoto.id)
        const filename = matchedPhoto.src.split("/").pop();
        console.log("Here is the matchedPhoto correct filename", filename)
        fetchStoredGallery(filename);
      }
      else{
        console.log("No matching photo found for caption:", imageData.src);
      }});
      return () =>{
        socket.off("image-selected");
      }
    }
    if(experimentType === 4){
      console.log("Fetching article...")
      fetchStoredArticle();
    }
  },[experimentPath, experimentType, setPhotoPath, setVideoPath, setArticlePath, articlePath, galleryPhotos]);



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

  useEffect(() => {
    socket.on("toggle-mask", ({userId, isMasked}) =>{
      console.log("Received toggle mask event. Trying to toggle mask.")
      console.log(`UserID:${userId} and JoinerID:${joinerId}`);
      if(String(userId) === String(joinerId)){
        setIsMasked(prev => !prev);
        console.log("Is this user masked:", isMasked);
      }
    });
    // setIsMasked(true);
    return() =>{
      socket.off("toggle-mask")
    }
  })

  return (
    <div className="flex flex-col lg:flex-row w-full bg-white px-2 py-1 gap-4">
      <Toaster position="top-right"/>
      <div className="flex flex-col w-full lg:w-3/4 gap-4 h-[90vh]">
      <div className="relative w-full bg-white shadow-md flex-grow rounded-lg overflow-hidden pt-[35%]">
          <div className="absolute top-0 left-0 w-full h-full">
          {experimentType == 1 && isMediaAFile ? (
              <ReactPlayer ref={playerRef} url={videoPath} playing={isPlaying} controls={true} className="rounded-lg"/>
          ) : experimentType ==1 && !isMediaAFile ? (
              <ReactPlayer ref={playerRef} url={`https://www.youtube.com/embed/${videoID}`} playing={isPlaying} controls={false} config={{youtube: { playerVars: { showinfo: 0}}}} width="100%" height="100%" className=" rounded-lg"/>
          ) : experimentType == 2 ? (
            <div className="flex justify-center items-center w-full h-full rounded-lg">
            <img src={photoPath} className="rounded-lg object-contain max-w-4xl max-h-[55vh]" alt="Experiment Image" /> 
            </div>
          ): experimentType == 3 ? (
            <div className="flex flex-col justify-center items-center w-full h-full rounded-lg">
              {galleryPath ? (
                <div className="flex flex-col items-center">
                <GalleryViewer imageSrc={galleryPath} caption={selectedCaption} index={currentGalleryPhotoID}/>
                </div>

              ): (
                <p className="text-xl text-gray-500 font-medium mt-10"> Waiting for host to select a photo...</p>
              )}
              </div>
          ) : experimentType == 4 && isMediaAFile ? (
              <iframe src={articlePath} width="800px" height="500px" className="w-full max-w-4xl h-[400px] rounded-md"></iframe>
          ) : experimentType == 4 && !isMediaAFile ?(
              <iframe src={articleURL} width="800px" height="500px" className="w-full max-w-4xl h-[400px] rounded-md"></iframe>
          ) :(
            <div>
              <p> Unknown lab. Rejoin</p>
            </div>
          )}
          {isMasked && (
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-100 z-50 pointer-events-none flex items-center justify-center transition-all duration-300 ease-in-out">
              <p className='text-white font-semibold'>Masked</p> </div>
          )}
          </div>
          </div>
        {/* Chart stuff*/}
        <div className="bg-gray-200 rounded-md text-gray-500 p-4 overflow-auto h-[45vh]">
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
                <p>temperature chart</p>
                <ChartComponent
                  chart_type={2}
                  chart_name="°F"
                  chart_color="rgb(255, 99, 132)"
                  user_id={selectedJoiner?.id}
                />
              </div>
            ) : (
              <div>
                <p> GSR/EDA </p>
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
      <div className="hidden lg:block w-full lg:w-1/4 h-full p-4 bg-white shadow-md rounded-lg overflow-y-auto">
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
                fileName={experimentPath}
                isSelected={selectedJoiner?.id === joiner.id}
                onSelect={() => {setSelectedJoiner(joiner); handleOpenModal();}}
              />)))}
            </div>
           ): (
            <div className="flex flex-col h-[60vh] justify-between bg-white rounded-md shadow-md">
              <ChatBody/>
              <ChatFooter/>
            </div>
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
            View this student's data?
          </h1>
        </div>
      </ModalComponent>
    </div>
  );
}

