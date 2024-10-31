//Select Media Page (Page for importing media)
import { useState } from "react"
import { useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';

const socket = io("http://localhost:3002");

export default function SelectMedia(){

    //States
    const [URL, setURL] = useState("")
    const [code, setCode] = useState("")
    
    const navigateTo = useNavigate();

    //Create Lobby Button || When button is clicked, lobby code is generated
    function handleCreateLobbyButtonClick()
    {  
        send_generated_code();
        navigateTo("/waiting-room") //kept so lobby code can be seen
    }

    //URL Submission || Select Media Logic
    function handleSubmit(e: { preventDefault: () => void; }){
        e.preventDefault();
        send_generated_code();
        console.log("URL:" + URL)
    }

    //generate random code || Must send code to server
    function generateRandomCode(length: number){
        const numbers = '0123456789';
        let lobbyCode = '';
        for (let i = 0; i < length; i++){
            lobbyCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        return lobbyCode;
    }

    //Socket IO Stuff
    function send_generated_code() {
        const lobbyCode = generateRandomCode(6);
        setCode(lobbyCode);
        console.log("Generated Lobby Code: ", lobbyCode);
        if (lobbyCode) {
            socket.emit("send_code", { lobbyCode }); //emits generated code event with room code
            console.log("Room code sent", lobbyCode);
        }
    };
    return(
        <div>
            <p>Select Media Page</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="URL"> URL </label>
                <input type="text" id="URL" onChange={(e) => setURL(e.target.value)}/> 
            </form>
            <button onClick={handleCreateLobbyButtonClick}>Create Lobby</button>

            {<p>Lobby Code: {code}</p>}
        </div>
    )
}