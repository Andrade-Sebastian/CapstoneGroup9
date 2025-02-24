import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { CiPlay1 } from "react-icons/ci";
import socket from "./socket.tsx";
import axios from "axios";
import { Divider } from "@heroui/divider";
import WaitingRoomCardComponent from "../Components/WaitingRoomCardComponent.tsx";
import { useNavigate } from "react-router-dom";
import { useJoinerStore } from "../hooks/stores/useJoinerStore.ts";
import React from "react";
// -----JOINER=--------------------------//
export default function WaitingRoom() {
  const [nicknames, setNickNames] = useState<string[]>([]);
  const [sessionID, setSessionID] = useState("");
  const navigateTo = useNavigate()
  const { isConnected, serial, nickname, roomCode, experimentId, experimentTitle, experimentDesc} = useJoinerStore()

  // useEffect(() => {
  //   // Emit join waiting room
  //   const userInformation = { nickName, roomCode };
  //   socket.emit("join_waiting_room", userInformation);
  //   console.log("Emitting join_waiting_room event with:", JSON.stringify(userInformation));

  //   // Listen for updates to the room's nicknames
  //   socket.on("receive_names", (names) => {
  //     if (Array.isArray(names)) {
  //       console.log("Nicknames received:", names);
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
    socket.on("session-start", () =>
    {
      console.log("joiner - ONsession start")
      navigateTo('/active-experiment')
    });
    return () => {
      socket.off("session-start");
    };
  }, [navigateTo]);
  
  useEffect(() => {
    const getSessionID = async () => {
      const response = await axios.get(
        `http://localhost:3000/joiner/validateRoomCode/${roomCode}`
      )
      .then((response) => {
          setSessionID(response.data.sessionID);
      });
      
    };

    getSessionID();
  }, []);

  useEffect(() => {
    if (!sessionID) return;

    const fetchUsers = async () => {
      try {
        console.log("Trying to get users from session " + sessionID);
        const response = await axios.get(
          `http://localhost:3000/joiner/room-users/${sessionID}`
        );
        const users = response.data.users; //Array of IUser objects

        const nicknames = []; //holds only the nicknames of those IUser Objects

        // initialize nicknames array
        for (let i = 0; i < users.length; i++) {
          nicknames.push(users[i].nickname);
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

  return (
    <div className="flex flex-col items-center justify-center h-1/2 mx-8">
      <div className="flex flex-col md:flex-row items-start justify-between gap-72">
      {/* left section */}
        <div className="md:w-1/2 space-y-4">
          <h1 className="text-3xl text-3xl font-semibold text-gray-800">
            Welcome to Session
          </h1>
          <p className="text-6xl font-bold text-[#894DD6]">{roomCode}</p>
          <div className="space-y-2">
            <p className="text-lg">
              <span className="font-semibold"> NICKNAME:</span> {nickname}
            </p>
            <p className="text-lg">
              <span className="font-semibold">SENSOR SERIAL NUMBER:</span>
              {serial}
            </p>
            <p className="text-lg">
              <span className="font-semibold">SENSOR STATUS:</span>
              <div>
                {isConnected ? (
                  <span className="text-green-500 font-bold"> CONNECTED</span>
                ): (
                  <span className="text-red-500 font-bold"> NOT CONNECTED</span>
                )}
              </div>
            </p>
          </div>
        </div>
        {/* right section */}
        <div className="md:w-1/2">
          {/* HARD CODED LAB DESCRIPTION */}
          <WaitingRoomCardComponent
            icon={<CiPlay1 style={{ fontSize: "20px" }} />}
            labType={experimentId}
            labTitle={experimentTitle}
            description={experimentDesc}
          ></WaitingRoomCardComponent>
        </div>
      </div>
      <Divider className="my-6" />
      <div className="flex justify-center space-x-8 text-lg font-medium text-gray-800">
        {nicknames.map((name, index) => (
          <p key={index}>{name}</p>
        ))}
      </div>
      
    </div>
  );
}
