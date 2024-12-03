import { useLocation } from "react-router-dom";
import { useEffect, useState, useMemo} from "react";


import socket from './socket.tsx';


export default function WaitingRoom() {

    //states + previous data from join page
    const location = useLocation(); //data passed when going to waiting room
    console.log("@Waiting room | location.state:", JSON.stringify(location.state));

    const { nickName, roomCode } = location.state || {};
    console.log("(WAITING ROOM) nickName: " + nickName + "roomCode: " + roomCode)
    const [nicknames, setNickNames] = useState<string[]>([]);


    //use memo for rendering users 
    const nickNameMapping = useMemo(() =>
        nicknames.map((name, index) => ( 
            <li key={index}> {name}</li>
        )), [nicknames]
    )
    // {nicknames.map((name, index) => ( 
    //     <li key={index}> {name}</li>
    
    console.log("Nicknames in waiting room: " + nicknames);


    useEffect(() => {

        const userInformation = {
            nickName: nickName, 
            roomCode: roomCode
        };
        
        console.log("Student name" + nickName)
        console.log("Room codeeeeeeeeeeeeeeeeeeeeeee: " + roomCode)
        //json object nickname roomcode (key value pair)
        console.log("-------------" + "In WAITINGROOM.TSX -> First useEffect." + "-------------")
        console.log("Emitting join_waiting_room event with: ", JSON.stringify(userInformation));
        
        socket.emit("join_waiting_room", userInformation);
        console.log("done sending" + userInformation)
        
        console.log("-------------")
        return () => {
            socket.off("join_waiting_room");
        };
    }, [nickName, roomCode]);

    useEffect(() => {
        console.log("-------------" + "In WAITINGROOM.TSX -> BEFORE SOCKET.ON | Second useEffect." + "-------------")
        //problem here
        socket.on("receive_names", (names) => { //when new user joins
            console.log("names recieved in waitingroom line 46" + names )
            //console.log("Receive message!", names)

            if (Array.isArray(names)) { 
                console.log("Nicknames received:", names);
                setNickNames(prevState => {
                    const uniqueNames: string[] = [];
                    prevState.forEach((name, i) => {
                        if(name !== names[i]){
                            uniqueNames.push(name);
                        }

                    })
                    return [...prevState, ...uniqueNames]
                }); 
            }
            else{
                console.error("Did not receive an array of names, only received: ", names)
            }
        });
        console.log("-------------")
        return () => {
            socket.off("receive_names");
        };
    }, [location.state]); 

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <h1 className="text-center text-3xl font-semibold mb-6 text-gray-800">Waiting Room</h1>
            <p>Room Code: {roomCode}</p>
            <p>Nickname: {nickName}</p>
            <h3> Users in the room:</h3>
            <ul>
                {/* Array is mapped over, supposed to update when new nicknames are added */}
                {nickNameMapping}
            </ul>
            </div>
        </div>
    );
}

