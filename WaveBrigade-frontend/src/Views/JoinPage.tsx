import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Checkbox, Input } from "@nextui-org/react";
import socket from "./socket.tsx";
import axios from "axios";
import React from "react";

export default function JoinPage() {
  //states
  const [nickName, setNickName] = useState("");
  const [StudentInputRoomCode, setStudentInputRoomCode] = useState("");
  const [nickNameReceived, setNickNameReceived] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);

  const [error, setError] = useState("");

  const navigateTo = useNavigate();

  // const useMemo(() => {

  // })
  console.log("Nickname" + nickName);
  useEffect(() => {
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

  //error here
  // useEffect(() => {
  //     socket.on("receive_names", (names) => { //listens for receive_names from server, nickNameReceieved updates when it does
  //         // console.log("names[names.length - 1]: " + names[names.length - 1])
  //         // setNickNameToWaitingRoom(names[names.length - 1])
  //         // console.log("The nickNameToWaitingRoom value is :"+nickNameToWaitingRoom)
  //         // setNickName(names[names.length - 1])// set user's nickname to the most recently added nickname --- POTENTIAL FUTURE BUG
  //         // console.log("-------------"+"IN JOIN PAGE, IN RECEIVE_NAMES: Received names: ", JSON.stringify(names) + "-------------")
  //         if (Array.isArray(names)) { //array of nicknames of users in the room is sent
  //             console.log("Dis shit do be an array")
  //             setNickNameReceived(names.join(", "));
  //             console.log("nickName: " + nickName + " nickNameRecieved: " + nickNameReceived)
  //             console.log("sending to waiting room: ", names, " ", StudentInputRoomCode)
  //             navigateTo("/waiting-room", { state: { nickName, StudentInputRoomCode } });
  //         }
  //     //     else if (names && names.users){
  //     //         console.log("Hooooraaaaaay its hitting else if!")
  //     //     }
  //     //     else{
  //     //         console.log("Dis shit aint an array")
  //     //     }
  //     //     console.log("-------------------------")
  //     // });

  //     return () => {
  //         socket.off("receive_names");
  //     };
  // }, []);

  //Check whether the room code exists in the backend
  // function validateRoomCode(){

  // }

  function handleSubmit(e: { preventDefault: () => void }) {
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
