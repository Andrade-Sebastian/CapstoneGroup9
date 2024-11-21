import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {Checkbox} from "@nextui-org/react";
import socket from './socket.tsx';


export default function JoinPage() {
    //states
    const [nickName, setNickName] = useState("");
    const [StudentInputRoomCode, setStudentInputRoomCode] = useState("");
    const [nickNameReceived, setNickNameReceived] = useState("");
    const [isJoining, setIsJoining] = useState(false);
    
    const [error, setError] = useState("");
    
    const navigateTo = useNavigate();
    
    useEffect(() => {
        socket.on("receive_names", (names) => {
            if (Array.isArray(names)) {
                const lastNickName = names[names.length - 1];
                setNickNameReceived(names.join(", "));
                console.log("nickNameRecieved: " + nickNameReceived)
                setNickName(lastNickName);
                console.log("lastNickname: " + lastNickName)
            }
        });

        socket.on("error", (err) => {
            setError(err.message);
            setIsJoining(false);
        })
        
        return () => {
            socket.off("receive_names");
            socket.off("error");
        };
    }, []);
    
    useEffect(() => {
        console.log("nickNameRecieved: " + nickNameReceived)
        console.log("nickname: " + nickName)
        console.log("StudentInputRoomCode: " + StudentInputRoomCode)
        if (nickName && nickNameReceived && StudentInputRoomCode) {
            navigateTo("/waiting-room", { state: { nickName, roomCode: StudentInputRoomCode } });
        }
    }, [nickNameReceived, nickName, navigateTo, StudentInputRoomCode]);
    
    //socketIO stuff
    function joinRoom() {
        console.log("-------------"+ "In JOINPAGE.TSX -> joinRoom function."+"-------------")
        if (StudentInputRoomCode && nickName) { //if both are entered
            if (!isJoining) {
                setIsJoining(true); // Prevent further clicks while waiting for server response
                
                // Emit the join_room event to the server
                socket.emit("join_room", { nickName, StudentInputRoomCode });
                
                console.log("Room code sent", StudentInputRoomCode);
                // After emitting, wait for response (assuming success/error handling via socket)
                socket.on("error", (error) => {
                    console.error(error.message);
                    setIsJoining(false); // Allow retry if an error occurs
                });
                
                socket.on("receive_names", (names) => {
                    console.log("Names received", names);
                    setIsJoining(false); // Join successful, reset flag
                });
            }
            socket.emit("join_room", { nickName, StudentInputRoomCode }); //emits join_room event with roomCode and nickName
            socket.on("error", (err)=>{
                setError(err.message);
                console.log("room does not exist1")
            })
        }
        else{
            setError("Please enter both a nickname and a room code...");
            return;
        }
        console.log("-------------")
    };
    
    function sendNickName(){ // sends nickname to the server
        console.log("-------------" +"In JOINPAGE.TSX -> sendNickName function."+"-------------")
        
        socket.emit("send_name", { nickName, StudentInputRoomCode });
        console.log("Name Sent:", nickName);
        console.log("------------------------------")
    };
    
    //error here
    // useEffect(() => {
        //     socket.on("receive_names", (names) => { //listens for receive_names from server, nickNameReceieved updates when it does
        //         // console.log("names[names.length - 1]: " + names[names.length - 1])
        //         // setNickNameToWaitingRoom(names[names.length - 1])
        //         // console.log("The nickNameToWaitingRoom value is :"+nickNameToWaitingRoom)
        //         // setNickName(names[names.length - 1])// set user's nickname to the most recently added nickname --- POTENTIAL FUTURE BUG
        //         // console.log("-------------"+"IN JOIN PAGE, IN RECEIVE_NAMES: Received names: ", JSON.stringify(names) + "-------------")
        //         if (Array.isArray(names)) { //array of nicknames of users in the room is sent
        //             console.log("Dis shit do be an array")
        //             setNickNameReceived(names.join(", "));
        //             console.log("nickName: " + nickName + " nickNameRecieved: " + nickNameReceived)
        //             console.log("sending to waiting room: ", names, " ", StudentInputRoomCode)
        //             navigateTo("/waiting-room", { state: { nickName, StudentInputRoomCode } });
        //         }
        //     //     else if (names && names.users){
            //     //         console.log("Hooooraaaaaay its hitting else if!")
            //     //     }
            //     //     else{
                //     //         console.log("Dis shit aint an array")
                //     //     }
                //     //     console.log("-------------------------")
    //     // });
    
    //     return () => {
        //         socket.off("receive_names"); 
        //     };
        // }, []);
        

        //Check whether the room code exists in the backend
        // function validateRoomCode(){
            
        // }
        
        function handleSubmit(e: { preventDefault: () => void; }) { //form submits so the events are triggered
            e.preventDefault();
            joinRoom();
            sendNickName();
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
                <input onClick={joinRoom} disabled={isJoining} type="submit" value={"Join"} />
            </form>
            <p>{nickNameReceived}</p>
        </div>
    );
}