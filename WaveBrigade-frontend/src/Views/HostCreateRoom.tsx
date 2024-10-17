import { useState } from "react";

// This is where the host will create the room 

export default function HostCreateRoom(){

    const [name, setUsername] = useState("");
    const [roomCode, setRoomCode] = useState("0000");
    const [lobbyName, setLobbyName] = useState("");

    function handleSubmit(e)
    {
        e.preventDefault(); {/* For now*/}

        console.log("Username: " + name)
        console.log("Room Code: " + roomCode)
        console.log("Lobby Name: " + lobbyName)
    }

    return( 
       <div>
        <form onSubmit={handleSubmit}>
            <label htmlFor="userName" > Enter your name </label>
                <input type="text" id="userName" onChange={(e) => setUsername(e.target.value)}/> 
            <label htmlFor="roomCode" >Enter a custom room code </label>
                <input type="text" id="roomCode" onChange={(e) => setRoomCode(e.target.value)}/> 
            <label htmlFor="lobbyName">Enter lobby name </label>
                <input type="text" id="lobbyName" onChange={(e) => setLobbyName(e.target.value)}/> 
            <input type="submit" value={"Host Lobby"}></input> {/*This will redirect to Select Lab Page */}
        </form>
       </div> 
    )
}