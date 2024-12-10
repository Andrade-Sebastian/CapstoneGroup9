import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "./socket.tsx";

export default function WaitingRoom() {
  const location = useLocation();
  const { nickName, roomCode } = location.state || {};
  const [nicknames, setNickNames] = useState<string[]>([]);

  useEffect(() => {
    // Emit join waiting room
    const userInformation = { nickName, roomCode };
    socket.emit("join_waiting_room", userInformation);
    console.log("Emitting join_waiting_room event with:", JSON.stringify(userInformation));

    // Listen for updates to the room's nicknames
    socket.on("receive_names", (names) => {
      if (Array.isArray(names)) {
        console.log("Nicknames received:", names);
        setNickNames(names);
      } else {
        console.error("Did not receive an array of names, received:", names);
      }
    });

    return () => {
      socket.off("receive_names");
    };
  }, [nickName, roomCode]);

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
