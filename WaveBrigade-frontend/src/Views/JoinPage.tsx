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
  const [sessionID, setSessionID] = useState("")
  const updateUser = useJoinerStore((state) => state.updateUser);
  const [users, setUsers] = useState<string[]>([]) //list of users to send to waiting room
  const [socketID, setSocketID] = useState("");


  // Get session ID when user types in a room code
  useEffect(() => {
    const getSessionID = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/joiner/validateRoomCode/${StudentInputRoomCode}`);
        if (response.status === 200) {
          setSessionID(response.data.sessionID)
          setSocketID(sessionStorage.getItem("socketID") || "");  
        }
      } catch (error) {
        console.error("Error fetching session ID:", error);
      }
    };
    if (StudentInputRoomCode) {
      getSessionID();  // Call it when room code is entered
    }
    
  }, [StudentInputRoomCode]);  



  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!StudentInputRoomCode || !nickName) {
      console.error("Please enter both a nickname and a room code...");
      return;
    }

    const isValidRoomCode = await validateRoomCode(StudentInputRoomCode);
    if (isValidRoomCode) {
      joinRoom();

      navigateTo("/waiting-room", {
        state: {
          nickName: nickName,
          roomCode: StudentInputRoomCode,
        }
      });
    }
  };

  const validateRoomCode = async (StudentInputRoomCode) => {
    try {
      const response = await axios.get(`http://localhost:3000/joiner/validateRoomCode/${StudentInputRoomCode}`);
      if (response.status === 200) {
        console.log("Room code is valid!");
        setSessionID(response.data.sessionID);  // Store sessionID when room code is valid
        return true;
      }
      return false;
    } catch (error) {
      console.error("Could not validate room code due to an API Error", error);
      return false;
    }
  };

  const joinRoom = async () => {
    
    console.log("Socket ID: " + socketID);
    console.log("Session ID: " + sessionID);

    try {
      await axios.post("http://localhost:3000/joiner/join-room", {
        sessionID: sessionID,
        socketId: socketID,
        nickname: nickName,
        associatedDevice: null
      });

    } catch (error) {
      console.error("Error joining room:", error);
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
