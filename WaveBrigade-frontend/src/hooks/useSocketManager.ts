import { useEffect } from "react";
//import { io } from "socket.io-client";
import socket from '../Views/socket';
export function useSocketManager(){
    useEffect(() => {
        socket.on("initialization:socketAssignment", (data) => {
            const { socketId } = data;
            console.log("FROM USESOCKETMANAGERHOOK || Received socketid: ", socketId);

            //saving socketID and last connected timestamp to session storage
            sessionStorage.setItem("socket_id", socketId);
            sessionStorage.setItem("last_connected", Date.now().toString());
        });
        
        //clearing session storage if last connected is older than 5 minutes
        const lastConnected = sessionStorage.getItem("last_connected");
        if(lastConnected){
            const timeElapsed = Date.now() - parseInt(lastConnected, 10);
            if (timeElapsed > 5 * 60 * 1000) { //set to 5 mins
                sessionStorage.setItem("last_connected", "null");
                sessionStorage.setItem("socket_id", "null")

            }
        }
        return () => {
            socket.off("initialization:socketAssigment");
            socket.disconnect();
        };
    }, []);

}