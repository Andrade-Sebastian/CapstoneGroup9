import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SideComponent from "../components/Components/SideComponent.tsx";
import { IoEarthOutline } from "react-icons/io5";
import { Icon } from "react-icons-kit";
import { eyeOff } from "react-icons-kit/feather/eyeOff";
import { eye } from "react-icons-kit/feather/eye";

// This is where the host will create the room

export default function HostCreateRoom() {
  const [userName, setUserName] = useState("");
  const [passwordIsSelected, setPasswordIsSelected] = useState(false);
  const [allowSpectators, setAllowSpectators] = useState(false);
  const [password, setPassword] = useState(""); //store this in backend!!
  const [type, setType] = useState("password");
  const [icon, setIcon] = useState(eyeOff);
  const navigateTo = useNavigate();

  useEffect(() => 
  {
    console.log("in host create room")
  })
  function handleToggle() {
    //have eye open if text is censored, if not then eye closed
    if (type === "password") {
      setIcon(eye);
      setType("text");
    } else {
      setIcon(eyeOff);
      setType("password");
    }
  }

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
  
    console.log("creating an experiment");

    axios.post("http://localhost:3000/experiment/create", {
      "description": "Sexy ass mike tyson with a gyyaat",
      "name": "Mike Tyson Lab"
    })
      .then((response) => {
        console.log("Done creating an experiment");
        const newExperiment = response.data;
        console.log("Experiment: ", newExperiment);
        navigateTo("/host/select-lab", { state: { userName, newExperiment } }); //for now
      })
      .catch((error) => {
        console.error("Error creating experiment:", error);
        //navigateTo("/host/select-lab", { state: { userName } }); //for now
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
          icon={<IoEarthOutline style={{ fontSize: "200px" }} />}
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
                placeholder="Name"
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
                <div>
                  <label
                    htmlFor="Password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password <span className="text-purple-500">*</span>
                  </label>
                  <div>
                    <div>
                      <div className="mb-4 flex">
                        <input
                          name="password"
                          placeholder="Password"
                          id="Password"
                          type={type}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          onChange={(e) => setPassword(e.target.value)}
                          value={password}
                        />
                        <span
                          className="flex justify-around items-center"
                          onClick={handleToggle}
                        >
                          <Icon
                            className="absolute mr-10"
                            icon={icon}
                            size={25}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
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
                  ? "bg-[#7F56D9] hover:bg-violet-500 text-white"
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
