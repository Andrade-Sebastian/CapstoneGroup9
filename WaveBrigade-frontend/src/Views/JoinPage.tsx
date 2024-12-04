import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { Checkbox, Input } from "@nextui-org/react";
import socket from "./socket.tsx";
import axios from "axios";
import React from "react";
import {useJoinerStore} from "../hooks/stores/useJoinerStore.ts"
//refactor to not use Host, but use the joiner instead. 
import {useHostStore} from "../hooks/stores/useHostStore.ts"

export interface IUserInfo{
    userId: string;
    socketId: string;
    nickname: string;
}

export interface IDevice{
  serialNumber:string;
  ipAddress: string;
}

export default function JoinPage() {
  //states
  const [nickName, setNickName] = useState("");
  const [StudentInputRoomCode, setStudentInputRoomCode] = useState("");
  const [nickNameReceived, setNickNameReceived] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [userId, setUserId] = useState("");
  const socketId = sessionStorage.getItem("socketID")
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState("");

  const navigateTo = useNavigate();
  /*****************/
  const [userInfo, setUserInfo] = useState({
    userId: "",
    socketId: "",
    nickname: "",
  })

  const updateUser = useJoinerStore(state => state.updateUser)
  const sessionInfo = useJoinerStore(state => state.addSessionInfo)
  const addUser = useHostStore(state => state.addUser)
  const userObject = useJoinerStore(state => state.user)
  
  // const useMemo(() => {

  // })
  console.log("Nickname" + nickName);
  useEffect(() => {
    socket.on("socketID", (id) => {
      console.log("Setting socket Id, ", id)
      sessionStorage.setItem("SocketID", id);
  });

    socket.on("receive_names", (names) => {
      if (Array.isArray(names)) {
        const lastNickName = names[names.length - 1];
        setNickNameReceived(names.join(", "));
        console.log("nickNameRecieved: " + nickNameReceived);
        setNickName(lastNickName);
        console.log("lastNickname: " + lastNickName);
      }
    });

    socket.on("error", (err) => {
      setError(err.message);
      setIsJoining(false);
    });

    return () => {
      socket.off("receive_names");
      socket.off("error");
    };
  }, []);

  useEffect(() => {
    setUserId(uuidv4());
  }, []);

  useEffect(() => {
    console.log("nickNameRecieved: " + nickNameReceived);
    console.log("nickname: " + nickName);
    console.log("StudentInputRoomCode: " + StudentInputRoomCode);
    if (nickName && nickNameReceived && StudentInputRoomCode) {
      navigateTo("/connect-emotibit", {
        state: { nickName, roomCode: StudentInputRoomCode },
      });
    }
  }, [nickNameReceived, nickName, navigateTo, StudentInputRoomCode]);

  //socketIO stuff
  function joinRoom() {
    console.log(
      "-------------" +
        "In JOINPAGE.TSX -> joinRoom function." +
        "-------------"
    );
    if (StudentInputRoomCode && nickName) {
      //if both are entered
      if (!isJoining) {
        setIsJoining(true);
        socket.emit("join_room", { nickName, StudentInputRoomCode });
        console.log("Room code sent", StudentInputRoomCode);
        socket.on("error", (error) => {
          console.error(error.message);
          setIsJoining(false); // Allow retry if an error occurs
        });
        socket.on("receive_names", (names) => {
          console.log("Names received", names);
          setIsJoining(false); // Join successful, reset flag
        });
      }
      socket.emit("join_room", { nickName, StudentInputRoomCode }); //emits join_room event with roomCode and nickName
      socket.on("error", (err) => {
        setError(err.message);
        console.log("room does not exist1");
      });
    } else {
      setError("Please enter both a nickname and a room code...");
      return;
    }
    console.log("-------------");
  }

  function sendNickName() {
    // sends nickname to the server
    console.log(
      "-------------" +
        "In JOINPAGE.TSX -> sendNickName function." +
        "-------------"
    );

    socket.emit("send_name", { nickName, StudentInputRoomCode });
    console.log("Name Sent:", nickName);
    console.log("------------------------------");
  }





  
  function handleSubmit(e: { preventDefault: () => void }) {
    //get the user's socket id , set its variable --- DONE
    //give them a userId (Making it on frontend???? -> rand()?) -- DONE
    //Figure out how to get the serial number and ipaddress on the frontend so that they are in this page
    if(socketId !== null)
    {
      updateUser({
        userId: userId,
        socketId: socketId,
        nickname: nickName,
        associatedDevice: null,
      })

      sessionInfo({

      })
    }
    else{
      throw new Error ("Socket ID not initialized")
    }
    

    console.log("MIKE TYSON " + JSON.stringify(userObject));
    axios
      .post(`http://localhost:3000/joiner/join-session/${StudentInputRoomCode}/${socketId}`, userInfo)

      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error joining session:", error);
      });

    //form submits so the events are triggered
    e.preventDefault();
    joinRoom();
    sendNickName();
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white rounded-lg shawdow-lg p-8 max-w-xl w-full">
        <h1 className="text-center text-3xl font-semibold mb-6 text-gray-800">
          Join a Lobby
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <div>
              <label
                htmlFor="NickName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
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

          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="joinAsSpectator"
                className="h-4 w-4"
                checked={isSpectator}
                onChange={() => setIsSpectator(!isSpectator)}
              />
              <label
                htmlFor="joinAsSpectator"
                className="text-sm font-medium text-gray-700"
              >
                Join As Spectator
              </label>
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
          </div>
        </form>
      </div>
    </div>
  );
}
