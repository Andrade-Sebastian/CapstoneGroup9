import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "./socket.tsx";

export default function ActiveExperiment() {

    const [recievedData, setRecievedData] = useState<number[]>([]);
    
    useEffect(() =>{
        console.log("Running active experiment");

        socket.on("update", (data) => {
            if (data != null) {
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
        <h1>Active Experiment</h1>
    );
}