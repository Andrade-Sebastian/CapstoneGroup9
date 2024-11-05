import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';
import {Checkbox} from "@nextui-org/react";

const socket = io("http://localhost:3002");

export default function JoinPage() {
    //states
    const [nickName, setNickName] = useState("");
    const [StudentInputRoomCode, setStudentInputRoomCode] = useState("");
    const [nickNameReceived, setNickNameReceived] = useState("");
    
    const navigateTo = useNavigate();

    //socketIO stuff
    function joinRoom() {
        if (StudentInputRoomCode && nickName) { //if both are entered
            socket.emit("join_room", { StudentInputRoomCode, nickName }); //emits join_room event with roomCode and nickName
            console.log("Room code sent", StudentInputRoomCode);
        }
    };

    function sendNickName(){ // sends nickname to the server
        socket.emit("send_name", { nickName, StudentInputRoomCode });
        console.log("Name Sent:", nickName);
    };
    
    useEffect(() => {
        socket.on("receive_names", (names) => { //listens for receive_names from server, nickNameReceieved updates when it does
            if (Array.isArray(names)) { //array of nicknames of users in the room is sent
                setNickNameReceived(names.join(", "));
            }
        });

        return () => {
            socket.off("receive_names"); 
        };
    }, []);

    //Check whether the room code exists in the backend
    // function validateRoomCode(){
        
    // }

    function handleSubmit(e) { //form submits so the events are triggered
        e.preventDefault();
        joinRoom();
        sendNickName();
        navigateTo("/waiting-room", { state: { nickName, StudentInputRoomCode } });
    }
    
    return (
        <div>
            <p>Join Page</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="nickName"> Enter your nickname </label>     
                <input type="text" id="nickName" onChange={(e) => setNickName(e.target.value)} />
                <label htmlFor="StudentInputRoomCode"> Room Code </label>
                <input type="text" id="StudentInputRoomCode" onChange={(e) => setStudentInputRoomCode(e.target.value)} /> 
                <div className="flex gap-4">
                <Checkbox defaultSelected size="sm">Spectator</Checkbox>
                </div>

                <input type="submit" value={"Join"} />
            </form>
            <p>{nickNameReceived}</p>
        </div>
    );
}
