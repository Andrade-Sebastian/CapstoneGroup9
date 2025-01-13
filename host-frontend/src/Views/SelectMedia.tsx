//Select Media Page (Page for importing media)
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

import socket from './socket';

export default function SelectMedia(){

    // useLocation to retrieve information about host name 
    //States
    const location = useLocation()
    console.log("@SELECT MEDIA | location.state:", JSON.stringify(location.state));

    const {userName} = location.state || {}
    console.log("SELECTMEDIA userName: "  + userName)

    const [URL, setURL] = useState("")
    const [code, setCode] = useState("")
    const navigateTo = useNavigate();

    

    //Create Lobby Button || When button is clicked, lobby code is generated
    function handleCreateLobbyButtonClick()
    {   const lobbyCode = generateRandomCode(6);
        console.log("Generated Lobby Code: ", lobbyCode);
        setCode(lobbyCode);
        createRoom(lobbyCode);
        //navigateTo("/waiting-room") //kept so lobby code can be seen
    }

    //URL Submission || Select Media Logic
    function handleSubmit(e: { preventDefault: () => void; }){
        e.preventDefault();
        console.log("URL:" + URL)
    }

    //generate random code || Must send code to server || Note:  generate in backend, not here
    function generateRandomCode(length: number){
        const numbers = '0123456789';
        let lobbyCode = '';
        for (let i = 0; i < length; i++){
            lobbyCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        return lobbyCode;
    }

    //Socket IO Stuff to create room
    function createRoom(roomCode: string) {
        socket.emit("create_room", {roomCode}); //emits generated code event with room code 
        console.log("Room code sent", roomCode);
        //add a parameter?
        socket.on("room_created", () => {
            console.log("Lobby created with code:", JSON.stringify(roomCode));
            navigateTo("/waiting-room", {state: {nickName: userName, roomCode}}); //include room code as part of route??
        });
        socket.on("error", (err: Error)=> {
            console.error(err.message);
            console.log("Creation of room error hit...")
        })
    };

    return(
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <h1 className="text-3xl font-semibold text-center mb-4 text-gray-800">Select Media Page</h1>

                <label htmlFor="URL" className="font-semibold text-gray-700"> URL </label>
                <input type="text" id="URL" className="border border-gray-300 rounded-md p-3 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Enter URL" onChange={(e) => setURL(e.target.value)}/> 
            <button type="submit" className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out" onClick={handleCreateLobbyButtonClick}>Create Lobby</button>
            {/* {<p>Lobby Code: {code}</p>} */}
            </form>

            </div>
        </div>
    )
}