import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ConnectEmotiBit() {
  const [serialNumber, setSerialNumber] = useState("");
  const navigateTo = useNavigate();

//   useEffect(() => {

//     if (serialNumber) {
//       navigateTo("/waiting-room", {
//         state: { serialNumber },
//       });
//     }
//   }, [serialNumber]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="bg-white rounded-lg shawdow-lg p-8 max-w-xl w-full">
        <h1 className="text-center text-3xl font-semibold mb-6 text-gray-800">
          CONNECT YO EMORTIBIT
        </h1>

        <form
          onSubmit={() => {
            console.log("asd");
          }}
        >
          <label
            htmlFor="serial-num"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            See the last four digits of your EmotiBit's serial number? Enter it
            here!
          </label>
          <input
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            id="serial-num"
            type="text"
            placeholder="ex. 1234"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
          />

          <div className="flex gap-10 items-center justify-center">
            <button
              disabled={!serialNumber.trim()}
              type="submit"
              className={`mt-6 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                serialNumber.trim()
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
              onClick={() => navigateTo("/waiting-room")}
            >
              Join Lobby
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
