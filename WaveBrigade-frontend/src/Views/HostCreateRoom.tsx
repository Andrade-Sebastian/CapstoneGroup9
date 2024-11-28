import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@nextui-org/react";
import axios from "axios";

// This is where the host will create the room

export default function HostCreateRoom() {
  const [userName, setUserName] = useState("");
  const navigateTo = useNavigate();
  const [passwordIsSelected, setPasswordIsSelected] = useState(false);
  const [allowSpectators, setAllowSpectators] = useState(false);
  const [password, setPassword] = useState(""); //store this in backend!!

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

  function handleSubmit(e: { preventDefault: () => void }) {
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
        password: password,
      },
      allowSpectators: allowSpectators,
    });

    console.log("sessionInfo: " + JSON.stringify(sessionInfo));

    axios
      .post("http://localhost:3000/host/session/create", {
        sessionName: "Awesome",
        selectedExperimentId: "17",
        allowSpectators: true,
        credentials: {
          passwordEnabled: false,
          password: "",
        },
      })
      .then((response) => {
        console.log(response.data.configuration);
      });

    console.log("Username: " + userName);
    console.log("Continue Button clicked");
    console.log("Navigating to Media");

    navigateTo("/host/select-lab", { state: { userName } }); //for now
  }

  console.log("Is the password selected? " + passwordIsSelected);
  console.log("Allow Spectators? " + allowSpectators);
  console.log("---------");

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white rounded-lg shawdow-lg p-8 max-w-md w-full">
        <h2 className="text-center text-3xl font-semibold mb-6 text-gray-800">
          Host a Lobby
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-gray-700 mb-2">
              Enter your name <span className="text-red-500">*</span>
            </label>
            {/* <div className="border-solid border-2 border-neutral-600 text-black"> */}
            <input
              type="text"
              id="userName"
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              //   focus:outline-none focus:ring-2 focus:ring-indigo-500
              onChange={(e) => setUserName(e.target.value)}
            ></input>
          </div>
          <div className="flex gap-4 mb-4">
            <Checkbox
              size="lg"
              color="default"
              radius="full"
              onValueChange={() => setPasswordIsSelected(!passwordIsSelected)}
            >
              Use Password
            </Checkbox>
            {passwordIsSelected ? (
              <div className="mt-3">
                <label
                  htmlFor="Password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <input
                  id="Password"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onChange={(e) => setPassword(e.target.value)}
                ></input>
              </div>
            ) : null}
          </div>
          <div className="mb-4">
            <Checkbox
              size="lg"
              color="primary"
              onValueChange={() => setAllowSpectators(!allowSpectators)}
            >
              Allow Spectators
            </Checkbox>
          </div>
          <div className="flex gap-10 items-center justify-center">
            <button>
              <input type="submit" value={"Host Lobby"} className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out"></input>{" "}
            </button>
            {/*This will redirect to Media Page */}
          </div>
        </form>
      </div>
    </div>
  );
}
