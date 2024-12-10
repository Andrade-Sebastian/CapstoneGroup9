import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import socket from "./socket.tsx";
import axios from "axios";
import { useJoinerStore } from "../hooks/stores/useJoinerStore.ts";

export default function JoinPage() {
  const [nickName, setNickName] = useState("");
  const [StudentInputRoomCode, setStudentInputRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isSpectator, setIsSpectator] = useState("");
  const [userId, setUserId] = useState("");
  const navigateTo = useNavigate();

  const updateUser = useJoinerStore((state) => state.updateUser);

  useEffect(() => {
    setUserId(uuidv4());

    socket.on("client-assignment", ({ socketId }) => {
      console.log("Setting socket Id, ", socketId);
      sessionStorage.setItem("socketID", socketId);
    });

    return () => {
      socket.off("client-assignment");
    };
  }, []);

  useEffect(() => {
    socket.on("receive_names", (names) => {
      console.log("Nicknames received:", names);
      setIsJoining(false);
      navigateTo("/connect-emotibit", {
        state: { nickName, roomCode: StudentInputRoomCode },
      });
    });

    return () => {
      socket.off("receive_names");
    };
  }, [navigateTo, nickName, StudentInputRoomCode]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!StudentInputRoomCode || !nickName) {
      console.error("Please enter both a nickname and a room code...");
      return;
    }

    const socketId = sessionStorage.getItem("socketID");

    if (socketId) {
      updateUser({
        userId: userId,
        socketId: socketId,
        nickname: nickName,
        associatedDevice: null,
      });

      setIsJoining(true);
      socket.emit("join_room", { nickName, StudentInputRoomCode });
    } else {
      console.error("Socket ID not initialized");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl w-full">
        <h1 className="text-center text-3xl font-semibold mb-6 text-gray-800">
          Join a Lobby
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div>
              <label htmlFor="nickName" className="block text-sm font-medium text-gray-700 mb-2">
                Nickname<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nickName"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setNickName(e.target.value)}
                value={nickName}
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="StudentInputRoomCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Room Code<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="StudentInputRoomCode"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setStudentInputRoomCode(e.target.value)}
                value={StudentInputRoomCode}
              />
            </div>
          </div>

          <div className="flex gap-10 items-center justify-center">
            <button
              disabled={!nickName.trim() || !StudentInputRoomCode.trim()}
              type="submit"
              className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                nickName.trim() && StudentInputRoomCode.trim()
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
