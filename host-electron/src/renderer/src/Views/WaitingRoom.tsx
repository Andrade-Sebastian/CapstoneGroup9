import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { CiPlay1 } from "react-icons/ci";
import socket from "./socket";
import axios from "axios";
import { Divider } from "@heroui/divider";
import WaitingRoomCardComponent from "../components/Components/WaitingRoomCardComponent";
export default function WaitingRoom() {
  const location = useLocation();
  const { nickName, roomCode } = location.state || {};
  const [nicknames, setNickNames] = useState<string[]>([]);
  const [sessionID, setSessionID] = useState("");

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
    const getSessionID = async () => {
      const response = await axios.get(
        `http://localhost:3000/joiner/validateRoomCode/${roomCode}`
      );
      if (response.status === 200) {
        setSessionID(response.data.sessionID);
      }
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
          <p className="text-6xl font-bold text-[#894DD6]">498742 {roomCode}</p>
          <div className="space-y-2">
            <p className="text-lg">
              <span className="font-semibold"> NICKNAME:</span> {nickName}
            </p>
            <p className="text-lg">
              <span className="font-semibold">SENSOR SERIAL NUMBER:</span>{" "}
              A93KFN2/SJPP2RK401
            </p>
            <p className="text-lg">
              <span className="font-semibold">SENSOR STATUS:</span>{" "}
              <span className="text-green-500 font-bold">CONNECTED</span>
            </p>
          </div>
        </div>
        {/* right section */}
        <div className="md:w-1/2">
          {/* HARD CODED LAB DESCRIPTION */}
          <WaitingRoomCardComponent
            icon={<CiPlay1 style={{ fontSize: "20px" }} />}
            labType="Video Lab"
            labTitle="A Compilation of Horror Movie Scenes"
            description="A video compilation of scenes from classic horror movies to study the effects of fear in the human body."
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
