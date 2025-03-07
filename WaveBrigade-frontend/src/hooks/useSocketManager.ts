import { useEffect } from "react";
//import { io } from "socket.io-client";
import socket from '../Views/socket.tsx';
import { useJoinerStore } from "./stores/useJoinerStore.ts";


export function useSocketManager(){
    const {setUserSocketId} = useJoinerStore();
    useEffect(() => {
        socket.on("initialization:socketAssignment", (data) => {
            const { socketId } = data;
            console.log("FROM USESOCKETMANAGERHOOK || Received socketid: ", socketId);

            //saving socketID and last connected timestamp to session storage
            setUserSocketId(socketId);
           // sessionStorage.setItem("last_connected", Date.now().toString());
        });
        
        socket.on("session-start", () => {
           console.log("in session-start");
        });
        socket.on("session-start-spectator", () => {
           console.log("in session-start");
        });
        
        socket.on("experiment-data", () => {
           console.log("in experiment-data in useSocketManager");
        });
        

        //clearing session storage if last connected is older than 5 minutes
        // const lastConnected = sessionStorage.getItem("last_connected");
        // if(lastConnected){
        //     const timeElapsed = Date.now() - parseInt(lastConnected, 10);
        //     if (timeElapsed > 5 * 60 * 1000) { //set to 5 mins
        //         sessionStorage.setItem("last_connected", "null");
        //         sessionStorage.setItem("socket_id", "null")

        //     }
        //}
        return () => {
            socket.off("initialization:socketAssigment");
            socket.off("session-start");
            socket.off("experiment-data");
            socket.off("session-start-spectator")
            socket.disconnect();
        };
    }, []);

}