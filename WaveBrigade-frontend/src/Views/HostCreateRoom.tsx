import { useState } from "react";
import { useNavigate } from "react-router-dom";

// This is where the host will create the room 

export default function HostCreateRoom()
{
    const [userName, setUserName] = useState("");
    const navigateTo = useNavigate();


    function handleSubmit(e: { preventDefault: () => void; })
    {
        e.preventDefault(); {/* For now*/}

        console.log("Username: " + userName);
        console.log("Continue Button clicked");
        console.log("Navigating to Media");

        navigateTo("/host/select-lab")//for now
    }

    return( 
       <div>
        <form onSubmit={handleSubmit}>
            <label htmlFor="userName"> Enter your name </label>
            <input type="text" id="userName" onChange={(e) => setUserName(e.target.value)}></input>
            <input type="submit" value={"Host Lobby"}></input> {/*This will redirect to Media Page */}
        </form>
       </div> 
    )
}