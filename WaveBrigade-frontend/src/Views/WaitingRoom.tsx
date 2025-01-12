import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "./socket.tsx";
import axios from "axios";

export default function WaitingRoom() {
  const location = useLocation();
  const { nickName, roomCode } = location.state || {};
  const [nicknames, setNickNames] = useState<string[]>([]);
  const [sessionID, setSessionID] = useState("")

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
      const response = await axios.get(`http://localhost:3000/joiner/validateRoomCode/${roomCode}`);
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
        console.log("Trying to get users from session " + sessionID)
        const response = await axios.get(`http://localhost:3000/joiner/room-users/${sessionID}`);
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
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-center text-3xl font-semibold mb-6 text-gray-800">Waiting Room</h1>
        <p>Room Code: {roomCode}</p>
        <p>Nickname: {nickName}</p>
        <h3>Users in the room:</h3>
        <ul>
          {nicknames.map((name, index) => (
            <li key={index}>{name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
