import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useJoinerStore } from "../hooks/stores/useJoinerStore.ts";
import { PiPlanetLight } from "react-icons/pi";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import SideComponent from "../Components/SideComponent.tsx";
import socket from "./socket.tsx";
// import useBrainflowManager from "../../../host-electron/src/renderer/src/hooks/useBrainflowManager.ts";
import {io} from "socket.io-client";

// const SERVER_URL = "http://localhost:3000";
// const newSocket = io(SERVER_URL);

export default function JoinPage() {
  const [nickName, setNickName] = useState("");
  const [StudentInputRoomCode, setStudentInputRoomCode] = useState("");
  const navigateTo = useNavigate();
  const [sessionID, setSessionID] = useState("");
  const [isJoiningAsSpectator, setisJoiningAsSpectator] = useState(false);

  const {
    userRole,
    sessionId,
	wasKicked,
    socketId,
    setUserRole,
    setSessionId,
    setNickname,
    setRoomCode,
	setUserSocketId,
  } = useJoinerStore();


  useEffect(() => {
	socket.connect()

    setUserRole("student");
	console.log("Global wasKicked variable: ", wasKicked)

	if(wasKicked){
		console.log("JoinPage.tsx: User was kicked")
		toast.error("You were kicked from the room")
	}

	socket.emit("client-assignment", );

    socket.on("client-assignment", async (data) => {
		console.log(new Date().toLocaleTimeString(), "(JoinPage.tsx): got a client-assignment event in JoinPage.tsx, recieved: ", data)
		await setUserSocketId(data.socketId);
		
		return () => {
			socket.off("client-assignment")
		}
  	})
  }, []);


  const handleSubmit = async (e) => {
	console.log(new Date().toLocaleTimeString(), "Current socketID in Zustand: ", socketId)
    setRoomCode(StudentInputRoomCode);
    e.preventDefault();

    if (!StudentInputRoomCode && !nickName) {
      console.error("Please enter both a nickname and a room code...");
      return;
    } else {
      if (StudentInputRoomCode.length !== 5) {
        toast.error("Error. Please enter a valid room code.");
        console.error("Please enter a valid room code");
        return;
      }
    }

    try {
      const isValidName = await checkNickName(nickName);
      const isValidRoomCode = await validateRoomCode(StudentInputRoomCode);
      const canSpectate = await checkSpectatorsAllowed(useJoinerStore.getState().sessionId);

      console.log("can spectate?", canSpectate)
      if (isValidRoomCode && isValidName) {
        if(isJoiningAsSpectator && !canSpectate){
          console.log("Joining as spectator but spectators are not allowed")
          toast.error("Cannot join as a spectator. Try again.");
          setisJoiningAsSpectator(false);
        }
        else{
          if (isJoiningAsSpectator && canSpectate) {
            toast.success("Room code valid. Password is needed...");
            //Set global store 'userRole' to 'spectator'
            setUserRole("spectator");
            console.log("global user role: ", userRole);
            
          } 
          else {
            //when they input the password, navigate to the waiting room
            console.log("joiner");
            setUserRole("student");
            toast.success("Room code valid. Password is needed...");
          }
          //navigate them to the password page
          setTimeout(() => {
            navigateTo("/enter-password");
          }, 2000);
        }
      } else if (isValidRoomCode && !isValidName) {
        toast.error(
          "Nickname not acceptable. Please refrain from profane language!"
        );
      } else {
        toast.error(
          "Connection failed. Looks like we couldn't get you connected. Please check your room code and try again."
        );
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      toast.error(
        "Connection failed. Looks like we couldn't get you connected. Please check your room code and try again."
      );
    }
  };

  const checkNickName = async (nickName: string) => {
    try {
      console.log("Checking nickname: ", nickName);
      const response = await axios.get(
        `http://localhost:3000/joiner/check-name/${nickName}`
      );
      console.log("RESPONSE STATUS RETURNED: ", response.status);
      if (response.status === 200) {
        console.log("Nickname is valid");
        return true;
      }
    } catch (error) {
      if (error.response.status === 400) {
        console.log("Nickname is not valid");
      } else {
        console.log("Could not check nickname", error);
      }
      return false;
    }
  };

  const validateRoomCode = async (StudentInputRoomCode) => {
    try {
      console.log("Validating room code..." + StudentInputRoomCode);
      setRoomCode(StudentInputRoomCode); // Store the room code in global state

      const response = await axios.get(
        `http://localhost:3000/joiner/verify-code/${StudentInputRoomCode}`
      );
      console.log("Session ID: ", response.data.sessionID);
      console.log("Response status: ", response.status);

      if (response.status === 200) {
        console.log("Room code is valid!");
        setSessionId(response.data.sessionID); // Store sessionID when room code is valid
        setRoomCode(StudentInputRoomCode);
        setNickname(nickName);
        //launchProcess();
        console.log("Response from validate room code", response.data);
        return true;
      }
      toast.error("Could not validate code due to an API error...");
      return false;
    } catch (error) {
      console.error("Could not validate room code due to an API Error", error);
      toast.error("Could not validate code due to an API error...");
      return false;
    }
  };

  //checks if spectators are allowed for the specific session
  const checkSpectatorsAllowed = async (sessionId: string) => {
    try{
      console.log("Checking if spectators allowed");
      const response = await axios.get(
          `http://localhost:3000/joiner/session/allows-spectators/${sessionId}`
      );
      if(response.status === 200){ //returns true or false
        console.log("Spectators Allowed: ", response.data.allowsSpectators);
          return response.data.allowsSpectators;
        }
      }
      catch(error){
        console.log("Unable to check if spectators are allowed");
        return false;
      }
  }
  return (
    <div className="flex h-screen">
      <div className="flex flex-col max-sm:hidden items-center justify-center w-2/5">
        <Toaster position="top-right" />
        <SideComponent
          icon={<PiPlanetLight style={{ fontSize: "200px" }} />}
          headingTitle="Enter Your Nickname and Room Code"
          description="We need to know who you are! Enter your name and the room code to get started"
        />
      </div>

      <div className="flex flex-col items-center justify-center w-2/5">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-6">
            <div>
              <label
                htmlFor="nickName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Your Name<span className="text-purple-500"> *</span>
              </label>
              <input
                type="text"
                id="nickName"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setNickName(e.target.value)}
                value={nickName}
                placeholder="Enter Name"
              />
            </div>
            <div className="mt-4">
              <label
                htmlFor="StudentInputRoomCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Enter Room Code<span className="text-purple-500"> *</span>
              </label>
              <input
                type="text"
                id="StudentInputRoomCode"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => setStudentInputRoomCode(e.target.value)}
                value={StudentInputRoomCode}
                placeholder="Enter Code"
              />
            </div>
            <div className="flex flex-col gap-4 mt-2">
              <div className="flex items-center gap-1 mt-2">
                <input
                  id="allow-spectators"
                  type="checkbox"
                  className="h-4 w-4 accent-[#7F56D9]"
                  checked={isJoiningAsSpectator}
                  onChange={() => {
                    //fixes issue where the checkbox shows the opposite boolean value when clicked on
                    setisJoiningAsSpectator((previousValue) => {
                      const newValue = !previousValue;
                      setUserRole(newValue ? "spectator" : "student");
                      console.log("checked ?", newValue);
                      return newValue;
                    });
                  }}
                />
                <label
                  htmlFor="allow-spectators"
                  className=" ml-2 text-sm font-medium text-gray-700 mb-1"
                >
                  Join as Spectator
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-10 items-center justify-center">
            <button
              disabled={!nickName.trim() || !StudentInputRoomCode.trim()}
              type="submit"
              className={`mt-8 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out cursor-pointer ${
                nickName.trim() && StudentInputRoomCode.trim()
                  ? "bg-[#7F56D9] hover:bg-violet-500 text-white"
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