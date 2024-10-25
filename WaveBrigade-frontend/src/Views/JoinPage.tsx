import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';

const socket = io("http://localhost:3002");

export default function JoinPage() {
    //states
    const [nickName, setNickName] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [nickNameReceived, setNickNameReceived] = useState("");
    
    const navigateTo = useNavigate();

    //socketIO stuff
    function joinRoom() {
        if (roomCode && nickName) { //if both are entered
            socket.emit("join_room", { roomCode, nickName }); //emits join_room event with roomCode and nickName
            console.log("Room code sent", roomCode);
        }
    };

    function sendNickName(){ // sends nickname to the server
        socket.emit("send_name", { nickName, roomCode });
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

    function handleSubmit(e) { //form submits so the events are triggered
        e.preventDefault();
        joinRoom();
        sendNickName();
        navigateTo("user-waiting-room", { state: { nickName, roomCode } });
    }
    
    return (
        <div>
            <p>Join Page</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="nickName"> Enter your nickname </label>     
                <input type="text" id="nickName" onChange={(e) => setNickName(e.target.value)} />
                <label htmlFor="roomCode"> Room Code </label>
                <input type="text" id="roomCode" onChange={(e) => setRoomCode(e.target.value)} /> 
                <input type="submit" value={"Join"} />
            </form>
            <p>{nickNameReceived}</p>
        </div>
    );
}
