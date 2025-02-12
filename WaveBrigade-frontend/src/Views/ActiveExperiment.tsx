import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "./socket.tsx";
import ChartComponent from "../Components/ChartComponent.tsx";
import React from "react";

export default function ActiveExperiment() {

    const [recievedData, setRecievedData] = useState<number[]>([]);
    
    useEffect(() =>{
        console.log("Running active experiment");

        socket.on("update", (data) => {
            if (Array.isArray(data)) {
                console.log("Data received:", data);
                setRecievedData(data);
              } else {
                console.error("Did not receive an array of data, received:", data);
              }
    });
    return () => {
        socket.off("update");
      };
    }, [recievedData]);

    return(
      <div className="flex h-screen bg-gray-100 p-4">
      {/* Main Image Section */}
      <div className="flex flex-col items-center w-3/4 p-4 bg-white shadow-md rounded-lg">
        <div className="relative">
          <button  className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl">
            Image
          </button>
          <img  className="rounded-lg w-full" />
          <button className="absolute right-0 top-1/2 -translate-y-1/2 text-3xl">
            
          </button>
        </div>
        <ChartComponent></ChartComponent>
        <div className="w-full mt-4 bg-gray-200 h-32 rounded-md flex items-center justify-center text-gray-500">
          ECG Chart - 72 BPM Average
        </div>
        <div className="mt-4 flex items-center space-x-4">

        </div>
      </div>

      {/* Sidebar Image List */}
      <div className="w-1/4 p-4 bg-white shadow-md rounded-lg overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Image List</h2>
       
      </div>
    </div>
    );
}
