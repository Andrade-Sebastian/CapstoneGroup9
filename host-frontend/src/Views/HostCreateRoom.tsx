import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@nextui-org/react";
import axios from "axios";
import SideComponent from "../components/Components/SideComponent.tsx";
import { IoEarthOutline } from "react-icons/io5";


// This is where the host will create the room

export default function HostCreateRoom() {
  const [userName, setUserName] = useState("");
  const [passwordIsSelected, setPasswordIsSelected] = useState(false);
  const [allowSpectators, setAllowSpectators] = useState(false);
  const [password, setPassword] = useState(""); //store this in backend!!
  const navigateTo = useNavigate();
  




  //hardcoded to test host/session/create
  const [sessionInfo, setSessionInfo] = useState({
    sessionName: "",
    selectedExperimentId: "17", //(ideally this would be undefined)
    credentials: {
      passwordEnabled: false,
      password: password,
    },
    allowSpectators: true,
  });

  const testSessionInfo = {
    sessionName: "Awesome",
    selectedExperimentId: "17",
    allowSpectators: true,
    credentials: {
      passwordEnabled: false,
      password: "",
    },
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    {
      /* For now*/
    }
    //this is not setting the values
    setSessionInfo({
      sessionName: "Awesome", // FUTURE
      selectedExperimentId: "17", // (ideally this would be undefined)
      credentials: {
        passwordEnabled: passwordIsSelected,
        password: passwordIsSelected? password: "", //if enabled, pass will be included
      },
      allowSpectators: allowSpectators,
    });

    console.log("sessionInfo: " + JSON.stringify(sessionInfo));

    axios
      .post("http://localhost:3000/host/session/create", sessionInfo)
      .then((response) => {
        console.log(response.data.configuration);
        navigateTo("/host/select-lab", { state: { userName } }); //for now
      })
      .catch((error) => {
        console.error("Error creating session:", error);
      });
    

    console.log("Username: " + userName);
    console.log("Continue Button clicked");
    console.log("Navigating to Media");

  }

  console.log("Is the password selected? " + passwordIsSelected);
  console.log("Allow Spectators? " + allowSpectators);
  console.log("---------");
  // <div className="flex justify-center items-center min-h-screen h-auto p-4 place-content-center ">
  // <div className="bg-white rounded-xl p-8 shadow-lg w-4/5 min-h-[1000px] place-content-center">
  //   <form onSubmit={handleSubmit} className="flex flex-col gap-14">
  return (
    <div className="flex h-screen">
      <div className="flex flex-col max-sm:hidden items-center justify-center w-2/5">
      <SideComponent
      icon={<IoEarthOutline style={{ fontSize: "200px"}}/>}
      headingTitle="Start an Experiment"
      description="Provide your name, check the box if you want to set a password and/or have spectators"
      />
      </div>
        <div className="flex flex-col items-center justify-center w-2/5">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="mb-6">
            <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter your name <span className="text-purple-500">*</span>
            </label>
            <input
              type="text"
              id="userName"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              //   focus:outline-none focus:ring-2 focus:ring-indigo-500
              onChange={(e) => setUserName(e.target.value)}
              value={userName}
            />
          </div>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2 mb-4 mt-4">
              <input
                type="checkbox"
                id="usePassword"
                className="h-4 w-4"
                checked={passwordIsSelected}
                onChange={() => setPasswordIsSelected(!passwordIsSelected)}
              />
              <label
                htmlFor="usePassword"
                className="text-sm font-medium text-gray-700"
              >
                Use Password
              </label>
            </div>
            {passwordIsSelected && (
              <div className="mt-2">
                <label
                  htmlFor="Password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password <span className="text-purple-500">*</span>
                </label>
                <input
                  id="Password"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="allowSpectators"
                className="h-4 w-4"
                checked={allowSpectators}
                onChange={() => setAllowSpectators(!allowSpectators)}
              />
              <label
                htmlFor="allowSpectators"
                className="text-sm font-medium text-gray-700"
              >
                Allow Spectators
              </label>
            </div>
          </div>
          </div>
          <div className="flex gap-10 items-center justify-center">
            <button
              type="submit"
              disabled={!userName.trim()}
              className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                userName.trim()
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              Host Lobby
            </button>
            {/*This will redirect to Media Page */}
          </div>
        </form>
      </div>
      </div>
  );
}
