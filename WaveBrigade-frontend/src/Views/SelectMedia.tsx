//Select Media Page (Page for importing media)
import { useState } from "react"
import { useNavigate } from "react-router-dom";

export default function SelectMedia(){
    const navigateTo = useNavigate();

    const [URL, setURL] = useState("")
    const [code, setCode] = useState("")

    function handleCreateLobbyButtonClick()
    {   const lobbyCode = generateRandomCode(6);
        setCode(lobbyCode);
        console.log("Generated Lobby Code: ", lobbyCode);
        //navigateTo("/host/host-waiting-room");
        navigateTo("/host/select-media") //kept so lobby code can be seen
    }

    //URL Submission
    function handleSubmit(e: { preventDefault: () => void; }){
        e.preventDefault()
        console.log("URL:" + URL)
    }

    //generate random code
    function generateRandomCode(length: number){
        const numbers = '0123456789';
        let lobbyCode = '';
        for (let i = 0; i < length; i++){
            lobbyCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        return lobbyCode;
    }
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