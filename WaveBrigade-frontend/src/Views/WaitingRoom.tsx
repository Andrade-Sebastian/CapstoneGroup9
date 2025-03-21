import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { CiPlay1 } from "react-icons/ci";
import { TfiGallery } from 'react-icons/tfi'
import { TiCamera } from 'react-icons/ti'
import { IoVideocam } from 'react-icons/io5'
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
    <CiPlay1 style={{ fontSize: '20px' }} />
  )
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
    const handleExperimentType = (data) =>{
      console.log("Received experiment type from the host...")
      setExperimentType(data);
      console.log("Here is the experiment type sent by the host");
      console.log("Experiment Type set to:", experimentType)
    };
    socket.on("experiment-type", handleExperimentType);
    return () => {
      socket.off("experiment-type", handleExperimentType);
    };
  }, []);
  
  useEffect(() => {
    console.log("Trying to get experiment type. Currently set to: ", experimentType)
    socket.emit("join-room");
  },[experimentType])

  useEffect(() => {
    function kickUser()
    {

      //Global store that keeps track of whether the user has been previously kicked or not
      setWasKicked(true);
      console.log("Kick function. Here is the socketID and sessionID", socketId, sessionId)
      //removes user from database
      

      //sessionid is empty when making this request. Thats causing the bug
      console.log("Kicking user from database in sessionID: ", sessionId);
      //is sessionID the global one? or a useState?



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
    }
    socket.on("kick", kickUser);
    console.log("Listening for 'kick event");
    return () => {
      socket.off("kick", kickUser);
  }}, []);

  useEffect(() => {
    if(userRole === "student"){
    socket.on("session-start", () => {
      console.log("joiner - ONsession start");
      navigateTo("/active-experiment");
    });
    return () => {
      socket.off("session-start");
    };
  }
  else{
    socket.on("session-start-spectator", () => {
      console.log("spectator in waiting room");
      navigateTo("/active-experiment-spectator")
    })
    return () => {
      socket.off("session-start-spectator");
    };
  }
  }, [navigateTo, userRole]);

  useEffect(() => {
    const getSessionID = async () => {
      const response = await axios
        .get(`http://localhost:3000/joiner/verify-code/${roomCode}`)
        .then((response) => {
          setSessionID(response.data.sessionID);
          setSessionId(sessionID)
        });
    }; 


    setIsSpectator(userRole === "spectator");
    console.log("SPECTATOR AHH: ", isSpectator);
    getSessionID();
  }, []);

  useEffect(() => {
    if (!sessionID) return;

    const fetchUsers = async () => {
      try {
        console.log("Trying to get users from session " + sessionID);
        console.log("Socket ID: ", socketId);
        const response = await axios.get(
          `http://localhost:3000/joiner/room-users/${sessionID}`
        );
        const users = response.data.users; //Array of IUser objects

        const nicknames = []; //holds only the nicknames of those IUser Objects

        // initialize nicknames array
        for (let i = 0; i < users.length; i++) {
          if (users[i].userrole === "spectator")
          {
            nicknames.push(users[i].nickname + " (Spectator)")
          }else{
            nicknames.push(users[i].nickname);
          }
        }

        setNickNames(nicknames);
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

  useEffect(() => {
    const getVideoFileData = async () => {
      try{
        const response = await axios.get(
          `http://localhost:3000/joiner/getVideoFile/${experimentID}`
        );
        if(response.status === 200){
          console.log("Returned get video data:", response.data);
          const experimentTitle = response.data.name;
          const experimentDesc = response.data.description;
          const path = response.data.path;
          console.log("RESPONSE DATA VARIABLES:", experimentTitle, experimentDesc, path);
          setExperimentId(experimentID);
          setExperimentTitle(experimentTitle);
          setExperimentDesc(experimentDesc);
          setExperimentPath(path);
        }
      } catch(error){
        toast.error("Failed to receive video data");
        console.log("Error receiving video data in joiner FE:", error);
      }
    }
    //if(!experimentID) return;
    const getPhotoData = async () => {
      try {
        console.log("SENDING TO THE ROUTE EXPERIMENT ID: ", experimentID);
        const response = await axios.get(
          `http://localhost:3000/joiner/getPhoto/${experimentID}`
        );
        if (response.status === 200) {
          //toast.success("Successfully received photolab data.");
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
    if(experimentType === 1){
      getVideoFileData();
    }
    if(experimentType === 2){
      getPhotoData();
    }
  }, [experimentID, setExperimentDesc, setExperimentId, setExperimentTitle, setExperimentPath]);

  useEffect(() => {
    if (experimentType === 1) {
      setExperimentTypeString('VideoLab')
      setExperimentIcon(<IoVideocam style={{ fontSize: '20px' }} />)
    } else if (experimentType === 2) {
      setExperimentTypeString('PhotoLab')
      setExperimentIcon(<TiCamera style={{ fontSize: '20px' }} />)
    } else if (experimentType === 3) {
      setExperimentTypeString('GalleryLab')
      setExperimentIcon(<TfiGallery style={{ fontSize: '20px' }} />)
    } else if (experimentType === 4) {
      setExperimentTypeString('ArticleLab')
      setExperimentIcon(<TfiGallery style={{ fontSize: '20px' }} />)
    } else {
      console.log("Invalid experiment type");
    }
  }, [experimentType, setExperimentTypeString])
  return (
    <div className="flex flex-col items-center justify-center h-1/2 mx-8">
      <div className="flex flex-col my-10 md:flex-row items-start justify-between gap-72">
        {/* left section */}
        <Toaster position="top-right" />
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl text-3xl font-semibold text-gray-800">
            Welcome to Session
          </h1>
          <p className="text-6xl font-bold text-[#894DD6]">{roomCode}</p>
          <div className="space-y-2">
            <p className="text-lg">
              <span className="font-semibold"> NICKNAME:</span> {nickname}
            </p>
            {!isSpectator && ( 
            
              <>
              <p className="text-lg">
                <span className="font-semibold">SENSOR SERIAL NUMBER:</span>
                {serial}
              </p>
              <p className="text-lg">
                <span className="font-semibold">SENSOR STATUS:</span>
                <div>
                  {isConnected ? (
                    <span className="text-green-500 font-bold"> CONNECTED</span>
                  ) : (
                    <span className="text-red-500 font-bold"> NOT CONNECTED</span>
                  )}
                </div>
              </p>
              </>
            )}
          </div>
        </div>
        {/* right section */}
        <div className="md:w-1/2">
          {/* HARD CODED LAB DESCRIPTION */}
          <WaitingRoomCardComponent
            icon={experimentIcon}
            labType={experimentTypeString}
            labTitle={experimentTitle}
            description={experimentDesc}
          ></WaitingRoomCardComponent>
        </div>
      </div>
      <Divider className="my-6" />
      <div className="flex justify-center space-x-8 text-lg font-medium text-gray-800">
        {nicknames.map((name, index) => (
          <p className='flex items-center border-black font-medium rounded-md bg-[#E6E6E6] px-4 py-1.5 text-black font-light gap-2.5' key={index}>{name}</p>
        ))}
      </div>
    </div>
  );
}

function then(arg0: () => void) {
  throw new Error("Function not implemented.");
}


//PROBLEM: SO THE FIRST JOINER GETS KICKED CORRECTLY AND GETS SENT TO THE JOIN PAGE. HOWEVER, WHEN I TRY TO JOIN AS A NEW
//JOINER, THE BACKEND REMEMBERS AN OLD SOCKETID, THE ONE THAT WAS ALREADY KICKED, AND TRIES TO DISCONNECT THAT ONE INSTEAD OF THE NEW GUY
