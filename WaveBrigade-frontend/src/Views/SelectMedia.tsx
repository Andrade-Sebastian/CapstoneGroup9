import { useState } from "react"
import { useNavigate } from "react-router-dom";

export default function SelectMedia(){
    const navigateTo = useNavigate();

    function handleCreateLobbyButtonClick()
    {
        navigateTo("waitingRoom");
    }

    const [URL, setURL] = useState("")

    function handleSubmit(e){
        e.preventDefault()
        console.log("URL:" + URL)
    }
    return(
        <div>
            <p>Select Media Page</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="URL"> URL </label>
                <input type="text" id="URL" onChange={(e) => setURL(e.target.value)}/> 
            </form>
            <button onClick={handleCreateLobbyButtonClick}>Create Lobby</button>
        </div>
    )
}