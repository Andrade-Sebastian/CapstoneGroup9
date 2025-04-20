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
import toast, { Toaster } from "react-hot-toast";
import React from "react";
import { stringify } from "postcss";
import { useNavigate } from "react-router-dom";
import ReactPlayer from "react-player";
import GalleryViewer from "../Components/GalleryViewer.tsx";
import { join } from "node:path";
import ChatBody from "../Components/ChatBody.tsx";
import ChatFooter from "../Components/ChatFooter.tsx";

export default function ActiveExperiment() {
  const [selectedButton, setSelectedButton] = useState("heartRate");
  const [isMasked, setIsMasked] = useState(false);
  const [activeTab, setActiveTab] = useState("images");
  const [activeChart, setActiveChart] = useState("heartRateChart");
  const [recievedData, setRecievedData] = useState<number[]>([]);
  const [isMediaAFile, setIsMediaAFile] = useState(false);
  const [photoPath, setPhotoPath] = useState("");
  const [videoPath, setVideoPath] = useState("");
  const [galleryPath, setGalleryPath] = useState("");
  const [selectedCaption, setSelectedCaption] = useState("");
  const [articlePath, setArticlePath] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef(null);
  const [videoID, setVideoID] = useState("");
  const [articleURL, setArticleURL] = useState("");
  const [currentGalleryPhotoID, setCurrentGalleryPhotoID] = useState(0);
  const {
    isConnected,
    serial,
    nickname,
    roomCode,
    joinerId,
    experimentId,
    experimentPath,
    galleryPhotos,
    experimentTitle,
    experimentDesc,
    experimentType,
    sessionId,
    socketId,
    setWasKicked,
    userRole
  } = useJoinerStore();
  const navigateTo = useNavigate();

  useEffect(() => {
    const checkVideoMediaType = () => {
      console.log(
        "Detecting type of media based on path...   ExperimentPath: ",
        experimentPath
      );
      if (experimentPath) {
        if (experimentPath.length === 11) {
          //very flimsy way of detecting if the video is a youtube video. All youtube videoIDs have a length of 11 which is why this is done. There must be a better way.....
          console.log(
            "Detected video as a YouTube link. Path length:",
            experimentPath.length
          );
          setIsMediaAFile(false);
          return;
        } else {
          console.log(
            "Detected video as a file. Path length:",
            experimentPath.length
          );
          setIsMediaAFile(true);
          return;
        }
      }
    };
    const checkArticleMediaType = () => {
      console.log(
        "Detecting type of media based on path...   ExperimentPath: ",
        experimentPath
      );
      if (experimentPath) {
        if (
          experimentPath.startsWith("https://") ||
          experimentPath.startsWith("http://")
        ) {
          console.log("Detected a link", experimentPath);
          setIsMediaAFile(false);
          return;
        } else {
          console.log("Detected article as a file.", experimentPath);
          setIsMediaAFile(true);
          return;
        }
      } else {
        console.log("Experiment path is empty", experimentPath);
        return;
      }
    };
    if (experimentType === 1) {
      console.log("ExperimentType is:", experimentType);
      checkVideoMediaType();
    } else if (experimentType === 4) {
      console.log("ExperimentType is:", experimentType);
      checkArticleMediaType();
    } else {
      console.log("Invalid experiment ID");
    }
  }, [experimentPath, experimentType, videoPath]);

  useEffect(() => {
    console.log("Running active experiment");
    console.log("Experiment ID in store w/o getState", experimentId);
    console.log(
      "Experiment ID in Store: ",
      useJoinerStore.getState().experimentId
    );
    if (!experimentId) {
      console.log("Experiment ID is null, aborting the fetch...");
      return;
    }
    const getPhotoInfo = async () => {
      const response = await axios
        .get(`http://localhost:3000/joiner/getPhoto/${experimentId}`)
        .then((response) => {
          //THERE IS NOTHING BEING SET HERE
          console.log("Photo lab path in activity page:", response.data.path);
        });
    };

    const getVideoInfo = async () => {
      const response = await axios
        .get(`http://localhost:3000/joiner/getVideoFile/${experimentId}`)
        .then((response) => {
          //THERE IS NOTHING BEING SET HERE
          console.log("Video lab path in activity page:", response.data.path);
          setVideoID(response.data.path);
          console.log("VideoID set to ", videoID);
        });
    };
    const getGalleryInfo = async () => {
      const response = await axios
        .get(`http://localhost:3000/joiner/getGallery/${experimentId}`)
        .then((response) => {
          //THERE IS NOTHING BEING SET HERE
          console.log("Gallery lab path in activity page:", response.data.path);
        });
    };

    const getArticleInfo = async () => {
      const response = await axios
        .get(`http://localhost:3000/joiner/getArticleFile/${experimentId}`)
        .then((response) => {
          //THERE IS NOTHING BEING SET HERE
          console.log("Article lab path in activity page:", response.data.path);
          setArticleURL(response.data.path);
          console.log("ArticleURL set to ", articleURL);
        });
    };

    socket.on("end-experiment", () => {
      navigateTo("/");
    });

    if (experimentType === 1) {
      setVideoPath(experimentPath);
      getVideoInfo();
    }
    if (experimentType === 2) {
      setPhotoPath(experimentPath);
      getPhotoInfo();
    }
    if (experimentType === 3) {
      setGalleryPath(experimentPath);
      getGalleryInfo();
    }
    if (experimentType === 4) {
      setArticlePath(experimentPath);
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
    const fetchStoredPhoto = async () => {
      const filename = experimentPath.split("/").pop();
      try {
        const response = await axios.get(
          `http://localhost:3000/get-photo/${filename}`
        );
        if (response.status === 200) {
          console.log("Fetched image path:", response.config.url);
          setPhotoPath(response.config.url);
          toast.success("Successfully retreived photo!");
        }
      } catch (error) {
        console.log("Error retrieving image:", error);
      }
    };

    const fetchStoredVideo = async () => {
      const filename = experimentPath.split("/").pop();
      try {
        const response = await axios.get(
          `http://localhost:3000/get-videoFile/${filename}`
        );
        if (response.status === 200) {
          console.log("Fetched video path:", response.config.url);
          setVideoPath(response.config.url);
          toast.success("Successfully retreived video!");
        }
      } catch (error) {
        console.log("Error retrieving video:", error);
      }
    };
    const fetchStoredGallery = async (filename: string) => {
      try {
        const response = await axios.get(
          `http://localhost:3000/get-gallery/${filename}`
        );
        if (response.status === 200) {
          console.log("Fetched photo path:", response.config.url);
          setGalleryPath(response.config.url);
          toast.success("Successfully retreived image!");
        }
      } catch (error) {
        console.log("Error retrieving image from gallery:", error);
      }
    };
    const fetchStoredArticle = async () => {
      const filename = experimentPath.split("/").pop();
      try {
        const response = await axios.get(
          `http://localhost:3000/get-articleFile/${filename}`
        );
        if (response.status === 200) {
          console.log("Fetched article path:", response.config.url);
          setArticlePath(response.config.url);
          toast.success("Successfully retreived article!");
        }
      } catch (error) {
        console.log("Error retrieving article:", error);
      }
    };
    if (experimentType === 1) {
      console.log("Fetching video...");
      fetchStoredVideo();
    }
    if (experimentType === 2) {
      console.log("Fetching photo...");
      fetchStoredPhoto();
    }
    if (experimentType === 3 && galleryPhotos.length > 0) {
      console.log("Fetching gallery...");
      socket.on("image-selected", (imageData) => {
        console.log(
          "Gallery image-selected event recieved. Host changed the image, fetching stored gallery...",
          imageData
        );
        setSelectedCaption(imageData.caption);
        const matchedPhoto = galleryPhotos.find(
          (photo) => photo.id === imageData.id
        );
        if (matchedPhoto) {
          setCurrentGalleryPhotoID(matchedPhoto.id);
          const filename = matchedPhoto.src.split("/").pop();
          console.log("Here is the matchedPhoto correct filename", filename);
          fetchStoredGallery(filename);
        } else {
          console.log("No matching photo found for caption:", imageData.src);
        }
      });
      return () => {
        socket.off("image-selected");
      };
    }
    if (experimentType === 4) {
      console.log("Fetching article...");
      fetchStoredArticle();
    }
  }, [
    experimentPath,
    experimentType,
    setPhotoPath,
    setVideoPath,
    setArticlePath,
    articlePath,
    galleryPhotos,
  ]);

  useEffect(() => {
    socket.on("play-video", (data) => {
      console.log("Recieved event play-video.", data);
      setIsPlaying(data);
      console.log("The variable isPlaying is set to", isPlaying);
    });

    socket.on("seek-video", (seconds) => {
      console.log("Recieved event seek-video", seconds);
      if (playerRef.current) {
        playerRef.current.seekTo(seconds, "seconds");
      }
    });
    return () => {
      socket.off("play-video");
      socket.off("seek-video");
    };
  }, []);

  useEffect(() => {
    socket.on("toggle-mask", ({ userId, isMasked }) => {
      console.log("Received toggle mask event. Trying to toggle mask.");
      console.log(`UserID:${userId} and JoinerID:${joinerId}`);
      if (String(userId) === String(joinerId)) {
        setIsMasked((prev) => !prev);
        console.log("Is this user masked:", isMasked);
      }
    });
    // setIsMasked(true);
    return () => {
      socket.off("toggle-mask");
    };
  });


  useEffect(() => {
    socket.on("kick", kickUser);
    console.log("Listening for 'kick event");
    
    function kickUser()
    {
      //Global store that keeps track of whether the user has been previously kicked or not
      setWasKicked(true);
      console.log("Kick function. Here is the socketID and sessionID", socketId, sessionId)
      //removes user from database
      

      console.log("Kicking user from database in sessionID: ", sessionId);
      //is sessionID the global one? or a useState?

      if (userRole === "spectator"){
        console.log(`removing spectator from session ${sessionId} with socketID ${socketId}`)
      //   axios.post("http://localhost:3000/joiner/remove-spectator-from-session", 
      //     {
      //       sessionID: sessionId,
      //       socketID: socketId
      //     }
      //   ).then(() => {  
      //     console.log("Successfully removed from database");
      //     navigateTo("/");})
      //   .catch(error =>{
      //   console.log("Error removing user from database", error)
      // })
        console.log("Successfully removed from database");
        clearInterval(interval)
        navigateTo("/")
        return () => {
          socket.off("kick", kickUser);
        }
      }else{
        axios.post('http://localhost:3000/joiner/leave-room', {
          sessionID: sessionId,
          socketID: socketId
        })
        .then(() =>{
          console.log("Successfully removed from database");
          navigateTo("/");
        })
        .catch(error =>{
          console.log("Error removing user from database", error)
        })
      }}
    
    return () => {
      socket.off("kick", kickUser);
  }}, []);

  return (
    <div className="flex flex-col lg:flex-row w-full max-h-full bg-white px-2 py-1 gap-4">
      <Toaster position="top-right" />
      <div className="grid grid-cols-1 grid-rows-12 w-full lg:w-3/4 gap-4 h-full">
        <div className="row-start-1 row-end-6 relative w-full shadow-md flex-grow rounded-lg overflow-hidden ">
          <div className="absolute top-0 left-0 w-full h-full">
            {experimentType == 1 && isMediaAFile ? (
              <ReactPlayer
                ref={playerRef}
                url={videoPath}
                playing={isPlaying}
                controls={true}
                className="rounded-lg"
              />
            ) : experimentType == 1 && !isMediaAFile ? (
              <ReactPlayer
                ref={playerRef}
                url={`https://www.youtube.com/embed/${videoID}`}
                playing={isPlaying}
                controls={false}
                config={{ youtube: { playerVars: { showinfo: 0 } } }}
                width="100%"
                height="100%"
                className=" rounded-lg"
              />
            ) : experimentType == 2 ? (
              <div className="flex justify-center items-center w-full h-full rounded-lg">
                <img
                  src={photoPath}
                  className="rounded-lg object-contain max-w-4xl max-h-[55vh]"
                  alt="Experiment Image"
                />
              </div>
            ) : experimentType == 3 ? (
              <div className="flex flex-col justify-center items-center w-full h-full rounded-lg">
                {galleryPath ? (
                  <div className="flex flex-col items-center">
                    <GalleryViewer
                      imageSrc={galleryPath}
                      caption={selectedCaption}
                      index={currentGalleryPhotoID}
                    />
                  </div>
                ) : (
                  <p className="text-xl text-gray-500 font-medium mt-10">
                    Waiting for host to select a photo...
                  </p>
                )}
              </div>
            ) : experimentType == 4 && isMediaAFile ? (
              <iframe
                src={articlePath}
                width="800px"
                height="500px"
                className="w-full max-w-4xl h-[400px] rounded-md"
              ></iframe>
            ) : experimentType == 4 && !isMediaAFile ? (
              <iframe
                src={articleURL}
                width="800px"
                height="500px"
                className="w-full max-w-4xl h-[400px] rounded-md"
              ></iframe>
            ) : (
              <div>
                <p> Unknown lab. Rejoin</p>
              </div>
            )}
            {isMasked && (
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-100 z-50 pointer-events-none flex items-center justify-center transition-all duration-300 ease-in-out">
                <p className="text-white font-semibold">Masked</p>{" "}
              </div>
            )}
          </div>
        </div>
        {/* Chart stuff*/}
        <div className="flex row-start-6 row-end-11 bg-gray-200 rounded-md text-gray-500 overflow-auto">
          <div className="max-h-full flex w-full">
            {activeChart === "heartRateChart" ? (
              <div className="flex flex-col w-full h-full max-h-full">
                <div className="text-lg font-semibold">
                  ECG Chart - 33 BPM Average
                </div>
                <ChartComponent
                  chart_type={1}
                  chart_name="BPM"
                  chart_color="rgb(23, 190, 207)"
                  user_id={joinerId}
                  className="w-full h-full"
                />
              </div>
            ) : activeChart === "temperatureChart" ? (
                <div className="flex flex-col w-full h-full max-h-full">
                <div className="text-lg font-semibold">
                  Temperature Chart
                </div>
                <ChartComponent
                  chart_type={2}
                  chart_name="°F"
                  chart_color="rgb(255, 99, 132)"
                  user_id={joinerId}
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div className="flex flex-col w-full h-full max-h-full">
                <div className="text-lg font-semibold">
                <p> GSR/EDA </p>
                </div>
                <ChartComponent
                  chart_type={3}
                  chart_name="EDA"
                  chart_color="rgb(75,0,130)"
                  user_id={joinerId}
                  className="w-full h-full"
                />
                </div>
            )}
          </div>
        </div>
        {/* <Divider className="my-3" /> */}
        <div className="h-min flex justify-between items-center row-start-11 row-end-12 mr-5">
          <p className="font-semibold">
            Nickname: <span className="font-light">{nickname}</span>
          </p>
          <div className="flex space-x-4">
            <button
              className={`text-xl p-2 rounded-lg ${
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
              className={`text-xl p-2 rounded-lg ${
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
              className={`text-xl p-2 rounded-lg ${
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
              activeTab === "images" ? "bg-[#7F56D9] text-white" : "bg-gray-300"
            }`}
            onClick={() => setActiveTab("images")}
          >
            <LuSquareStack className="mr-2" /> Media
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
              ) : experimentType == 1 && !isMediaAFile ? (
                <div>
                  <p>
                    YouTube Video: https://www.youtube.com/watch?v={videoID}{" "}
                  </p>
                </div>
              ) : experimentType == 2 ? (
                <div>
                  <p>Image: {photoPath}</p>
                </div>
              ) : experimentType == 3 ? (
                <div>
                  <p>Gallery lab stuff</p>
                </div>
              ) : experimentType == 4 && isMediaAFile ? (
                <div>
                  <p> Local Article: {articlePath}</p>
                </div>
              ) : experimentType == 4 && !isMediaAFile ? (
                <div>
                  <p> Article Link : {articleURL}</p>
                </div>
              ) : (
                <div>
                  <p> Unknown lab. Rejoin</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-[60vh] justify-between bg-white rounded-md shadow-md">
              <ChatBody />
              <ChatFooter />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
