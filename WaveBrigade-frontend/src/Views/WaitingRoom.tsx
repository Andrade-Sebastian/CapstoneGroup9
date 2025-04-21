import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { CiPlay1 } from "react-icons/ci";
import { TfiGallery } from "react-icons/tfi";
import { TiCamera } from "react-icons/ti";
import { IoVideocam, IoNewspaper } from "react-icons/io5";
import { PiCrownSimpleThin } from "react-icons/pi";
import { HiOutlineSignal } from "react-icons/hi2";
import { PiPlugsConnectedThin } from "react-icons/pi";
import { CiUser } from "react-icons/ci";
import socket from "./socket.tsx";
import axios from "axios";
import { Divider } from "@heroui/divider";
import WaitingRoomCardComponent from "../Components/WaitingRoomCardComponent.tsx";
import { useNavigate } from "react-router-dom";
import { useJoinerStore } from "../hooks/stores/useJoinerStore.ts";
import React from "react";
import toast, { Toaster } from "react-hot-toast";
import { user } from "@heroui/react";

// -----JOINER=--------------------------//
export default function WaitingRoom() {
  const [nicknames, setNickNames] = useState<string[]>([]);
  const [sessionID, setSessionID] = useState("");
  const [experimentID, setExperimentID] = useState(0);
  const [isSpectator, setIsSpectator] = useState(false);
  const [experimentIcon, setExperimentIcon] = useState<JSX.Element>(
    <CiPlay1 style={{ fontSize: "20px" }} />
  );
  const navigateTo = useNavigate();
  const {
    isConnected,
    serial,
    setSessionId,
    sessionId,
    nickname,
    roomCode,
    userRole,
    socketId,
    setExperimentId,
    setExperimentTitle,
    setExperimentDesc,
    experimentTypeString,
    setExperimentTypeString,
    setExperimentPath,
    addPhoto,
    galleryPhotos,
    setWasKicked,
    wasKicked,
    experimentId,
    experimentType,
    setExperimentType,
    setUserRole,
    experimentTitle,
    experimentDesc,
  } = useJoinerStore();

  // useEffect(() => {
  //   // Emit join waiting room
  //   const userInformation = { nickName, roomCode };
  //   socket.emit("join_waiting_room", userInformation);
  //   console.log("Emitting join_waiting_room event with:", JSON.stringify(userInformation));

  //   // Listen for updates to the room's nicknames
  //   socket.on("receive_names", (names) => {
  //     if (Array.isArray(names)) {
  //       console.log("Nicknames received:" , names);
  //       setNickNames(names);
  //     } else {
  //       console.error("Did not receive an array of names, received:", names);
  //     }
  //   });

  //   return () => {
  //     socket.off("receive_names");
  //   };
  // }, [nickName, roomCode]);

  useEffect(() => {
    const handleExperimentType = (data) => {
      console.log("Received experiment type from the host...");
      setExperimentType(data);
      console.log("Here is the experiment type sent by the host");
      console.log(
        "Experiment Type set to:",
        useJoinerStore.getState().experimentType
      );
    };
    socket.on("experiment-type", handleExperimentType);
    return () => {
      socket.off("experiment-type", handleExperimentType);
    };
  }, []);

  // useEffect(() => {
  //   const handleGalleryImageData = (data) =>{
  //     console.log("Received gallery data from host", data);

  //     const {experimentTitle, experimentDesc, expId, images} = data;
  //     images.forEach((img,index) =>{
  //       addPhoto({
  //         id: index,
  //         src: img.path,
  //         file:null,
  //         caption: img.caption
  //       });
  //     });
  //   };
  //   socket.on("experiment-data", handleGalleryImageData);
  //   return () => {
  //     socket.off("experiment-data", handleGalleryImageData);
  //   };
  // },[]);

  useEffect(() => {
    console.log(
      "Trying to get experiment type. Currently set to: ",
      experimentType
    );
    socket.emit("join-room");
  }, [experimentType]);

  useEffect(() => {
    socket.on("kick", kickUser);
    console.log("Listening for 'kick event");

    function kickUser() {
      //Global store that keeps track of whether the user has been previously kicked or not
      setWasKicked(true);
      console.log(
        "Kick function. Here is the socketID and sessionID",
        socketId,
        sessionId
      );
      //removes user from database

      console.log("Kicking user from database in sessionID: ", sessionId);
      //is sessionID the global one? or a useState?

      if (userRole === "spectator") {
        console.log(
          `removing spectator from session ${sessionId} with socketID ${socketId}`
        );
        //   axios.post("${import.meta.env.VITE_BACKEND_PATH}/joiner/remove-spectator-from-session",
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
        clearInterval(interval);
        navigateTo("/");
        return () => {
          socket.off("kick", kickUser);
        };
      } else {
        axios
          .post(`${import.meta.env.VITE_BACKEND_PATH}/joiner/leave-room`, {
            sessionID: sessionId,
            socketID: socketId,
          })
          .then(() => {
            console.log("Successfully removed from database");
            navigateTo("/");
          })
          .catch((error) => {
            console.log("Error removing user from database", error);
          });
      }
    }

    return () => {
      socket.off("kick", kickUser);
    };
  }, []);

  useEffect(() => {
    if (userRole === "student") {
      socket.on("session-start", () => {
        console.log("joiner - ONsession start");
        navigateTo("/active-experiment");
      });
      return () => {
        socket.off("session-start");
      };
    } else {
      socket.on("session-start-spectator", () => {
        console.log("spectator in waiting room");
        navigateTo("/active-experiment-spectator");
      });
      return () => {
        socket.off("session-start-spectator");
      };
    }
  }, [navigateTo, userRole]);

  useEffect(() => {
    const getSessionID = async () => {
      console.log("verify-code, room code: ", roomCode)
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_PATH}/joiner/verify-code/${roomCode}`);

      if(response.status === 200){
        setSessionID(response.data.sessionID);
        setSessionId(response.data.sessionID)
      }
    }; 


    setIsSpectator(userRole === "spectator");
    console.log("SPECTATOR AHH: ", isSpectator);
    getSessionID();
  }, []);

  let interval;
  useEffect(() => {
    if (!sessionID) return;

    const fetchUsers = async () => {
      console.log("****user role:" + userRole);
      try {
        console.log(
          "Trying to get users from session " + sessionId,
          "type | ",
          typeof sessionId
        );
        console.log("Socket ID when getting users: ", socketId);

        //SOCKET ID ISNT BEING SET - 4/17
        console.log("****socketId when getting users: " + socketId);
        console.log("Trying to get users from session " + sessionID);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PATH}/joiner/room-users/${sessionId}`
        );
        console.log("got ", JSON.stringify(response.data.users));
        const users = response.data.users; //Array of IUser objects

        // const nicknames = []; //holds only the nicknames of those IUser Objects

        const nicknames = users.map((user) =>
          user.userrole === "spectator"
            ? `${user.nickname} (Spectator)`
            : user.nickname
        );

        // initialize nicknames array
        // for (let i = 0; i < users.length; i++) {
        //   if (users[i].userrole === "spectator"){
        //     nicknames.push(users[i].nickname + " (Spectator)");

        //   }else{
        //     nicknames.push(users[i].nickname)
        //   }
        //   console.log("nicknames: " + JSON.stringify(nicknames) + "Length: " + nicknames.length)
        //   setNickNames(nicknames);
        // }
        setNickNames(nicknames);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
    interval = setInterval(fetchUsers, 5000); // Refresh users every 5 seconds

    return () => clearInterval(interval);
  }, [sessionID]); //Don't fetch any data until sessionID is set

  useEffect(() => {
    const getExperimentData = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_PATH
          }/joiner/session/getInfo/${roomCode}`
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

  useEffect(() => {
    const getVideoFileData = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_PATH
          }/joiner/getVideoFile/${experimentID}`
        );
        if (response.status === 200) {
          toast.success("Successfully received video lab data.");
          console.log("Returned get video data:", response.data);
          const experimentTitle = response.data.name;
          const experimentDesc = response.data.description;
          const path = response.data.path;
          console.log(
            "RESPONSE DATA VARIABLES:",
            experimentTitle,
            experimentDesc,
            path
          );
          setExperimentId(experimentID);
          setExperimentTitle(experimentTitle);
          setExperimentDesc(experimentDesc);
          setExperimentPath(path);
        }
      } catch (error) {
        toast.error("Failed to receive video data");
        console.log("Error receiving video data in joiner FE:", error);
      }
    };
    //if(!experimentID) return;
    const getPhotoData = async () => {
      try {
        console.log("SENDING TO THE ROUTE EXPERIMENT ID: ", experimentID);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_PATH}/joiner/getPhoto/${experimentID}`
        );
        if (response.status === 200) {
          toast.success("Successfully received photo lab data.");
          console.log("RETURNED GET PHOTO DATA: ", response.data);
          const experimentTitle = response.data.name;
          const captions = response.data.captions;
          const experimentDesc = response.data.description;
          const path = response.data.path;
          //NEED THE EXPERIMENT TYPE
          console.log(
            "RESPONSE DATA VARIABLES: ",
            captions,
            experimentDesc,
            experimentTitle,
            path
          );
          setExperimentId(experimentID);
          setExperimentTitle(experimentTitle);
          setExperimentDesc(experimentDesc);
          setExperimentPath(path);
        }
      } catch (error) {
        toast.error("Failed to receive photo data");
        console.log("Error receiving photolab data in joiner fe: ", error);
      }
    };
    const getGalleryData = async () => {
      try {
        console.log("SENDING TO THE ROUTE EXPERIMENT ID: ", experimentID);
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_PATH
          }/joiner/getGallery/${experimentID}`
        );
        if (response.status === 200) {
          toast.success("Successfully received gallery lab data.");
          console.log("RETURNED GET GALLERY DATA: ", response.data);
          const experimentTitle = response.data.name;
          const experimentDesc = response.data.description;
          response.data.images.forEach((img, index) => {
            addPhoto({
              id: index,
              src: img.path,
              file: null,
              caption: img.caption,
            });
          });

          //const images = response.data.images;
          // const captions = response.data.captions;
          // const path = response.data.path;
          //NEED THE EXPERIMENT TYPE
          console.log("RETURNED GET GALLERY DATA: ", response.data);
          console.log("GalleryPhoto data from getGallery", galleryPhotos);
          setExperimentId(experimentID);
          setExperimentTitle(experimentTitle);
          setExperimentDesc(experimentDesc);
          // images.forEach((image, index) => {
          //   addPhoto({
          //     id: index,
          //     src: image.path,
          //     file:null,
          //     caption: image.caption
          //   })
          // })
        }
      } catch (error) {
        toast.error("Failed to receive gallery data");
        console.log("Error receiving gallerylab data in joiner fe: ", error);
      }
    };
    const getArticleData = async () => {
      try {
        console.log("SENDING TO THE ROUTE EXPERIMENT ID: ", experimentID);
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_PATH
          }/joiner/getArticleFile/${experimentID}`
        );
        if (response.status === 200) {
          toast.success("Successfully received article lab data.");
          console.log("RETURNED GET Article DATA: ", response.data);
          const experimentTitle = response.data.name;
          const experimentDesc = response.data.description;
          const path = response.data.path;
          //NEED THE EXPERIMENT TYPE
          console.log(
            "RESPONSE DATA VARIABLES: ",
            experimentDesc,
            experimentTitle,
            path
          );
          setExperimentId(experimentID);
          setExperimentTitle(experimentTitle);
          setExperimentDesc(experimentDesc);
          setExperimentPath(path);
        }
      } catch (error) {
        toast.error("Failed to receive Article data");
        console.log("Error receiving article lab data in joiner fe: ", error);
      }
    };
    if (experimentType === 1) {
      getVideoFileData();
    }
    if (experimentType === 2) {
      getPhotoData();
    }
    if (experimentType === 3) {
      getGalleryData();
    }
    if (experimentType === 4) {
      getArticleData();
    }
  }, [
    experimentID,
    setExperimentDesc,
    setExperimentId,
    setExperimentTitle,
    setExperimentPath,
    experimentType,
  ]);

  useEffect(() => {
    if (experimentType === 1) {
      setExperimentTypeString("VideoLab");
      setExperimentIcon(<IoVideocam style={{ fontSize: "20px" }} />);
    } else if (experimentType === 2) {
      setExperimentTypeString("PhotoLab");
      setExperimentIcon(<TiCamera style={{ fontSize: "20px" }} />);
    } else if (experimentType === 3) {
      setExperimentTypeString("GalleryLab");
      setExperimentIcon(<TfiGallery style={{ fontSize: "20px" }} />);
    } else if (experimentType === 4) {
      setExperimentTypeString("ArticleLab");
      setExperimentIcon(<IoNewspaper style={{ fontSize: "20px" }} />);
    } else {
      console.log("Invalid experiment type");
    }
  }, [experimentType, setExperimentTypeString]);
  return (
    <div className="flex flex-col items-center justify-center px-4 md:px-8 py-8">
      <Toaster position="top-right" />
      <div className="flex flex-col md:flex-row items-start justify-between w-full max-w-6xl gap-8 md:gap-12">
        {/* left section */}
        <div className="w-full md:w-1/2 space-y-4">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
            Welcome to Session
          </h1>
          <p className="text-4xl sm:text-5xl font-bold text-[#894DD6] break-words">
            {roomCode}
          </p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-lg">
              <PiCrownSimpleThin size={24} />
              <span className="font-semibold text-[#894DD6] "> NICKNAME </span>
              <span>{nickname}</span>
            </div>
            {!isSpectator && (
              <>
                <div className="flex items-center space-x-2 text-lg">
                  <HiOutlineSignal size={24} />
                  <p className="text-lg">
                    <span className="font-semibold text-[#894DD6]">
                      SENSOR SERIAL NUMBER
                    </span>{" "}
                    {serial}
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-lg">
                  <PiPlugsConnectedThin size={24} />
                  <p className="text-base sm:text-lg flex flex-col sm:flex-row sm:items-center">
                    <span className="font-semibold text-[#894DD6]">
                      SENSOR STATUS
                    </span>
                    <div>
                      {isConnected ? (
                        <span className="text-green-500 font-bold ml-1">

                          CONNECTED
                        </span>
                      ) : (
                        <span className="text-red-500 font-bold ml-1">

                          NOT CONNECTED
                        </span>
                      )}
                    </div>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        {/* right section */}
        <div className="w-full md:w-1/2">
          {/* HARD CODED LAB DESCRIPTION */}
          <WaitingRoomCardComponent
            icon={experimentIcon}
            labType={experimentTypeString}
            labTitle={experimentTitle}
            description={experimentDesc}
          ></WaitingRoomCardComponent>
        </div>
      </div>
      <Divider className="my-6" w-full max-w-4xl />
      <div className="flex flex-wrap justify-center gap-4 text-base sm:text-lg font-medium w-full text-gray-800 max-w-4xl">
        {nicknames.map((name, index) => (
          <p
            className="flex items-center border-black font-medium rounded-md bg-[#E6E6E6] px-4 py-1.5 text-black font-light gap-2.5"
            key={index}
          >
            {name}
          </p>
        ))}
      </div>
    </div>
  );
}

// function then(arg0: () => void) {
//   throw new Error("Function not implemented.");
// }
