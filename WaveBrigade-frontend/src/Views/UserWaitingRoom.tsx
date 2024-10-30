import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3002");

export default function UserWaitingRoom() {

    //states + previous data from join page
    const location = useLocation(); //data passed when going to waiting room
    const { nickName, roomCode } = location.state || {};
    const [nicknames, setNickNames] = useState<string[]>([]);

    //use memo for rendering users 
    // {nicknames.map((name, index) => ( 
    //     <li key={index}> {name}</li>
    
    useEffect(() => {
        const userInformation = {
            nickName: nickName,
            roomCode: roomCode,
        };
        //json object nickname roomcode (key value pair)
        console.log("Joined waiting room");
        socket.emit("join_waiting_room", userInformation);
        return () => {
            socket.off("join_waiting_room");
        };
    }, []);
    useEffect(() => {
        socket.on("receive_names", (names) => { //when new user joins
            console.log("Receive message!", names)

            if (Array.isArray(names)) { 
                console.log("Nicknames received:", names);
                setNickNames(names); 
            } 
        });

        return () => {
            socket.off("receive_names");
        };
    }, []);

    return (
        <div>
            <h1>Waiting Room</h1>
            <p>Room Code: {roomCode}</p>
            <p>Nickname: {nickName}</p>
            <h3> Users in the room:</h3>
            <ul>
                {/* Array is mapped over, supposed to update when new nicknames are added */}
                
                {nicknames.map((name, index) => ( 
                    <li key={index}> {name}</li>
                ))}
            </ul>
        </div>
    );
}

