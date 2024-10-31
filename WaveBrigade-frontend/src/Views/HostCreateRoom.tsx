import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@nextui-org/react";

// This is where the host will create the room 

export default function HostCreateRoom()
{
    const [userName, setUserName] = useState("");
    const navigateTo = useNavigate();
    const [passwordIsSelected, setPasswordIsSelected] = useState(false);
    const [allowSpectators, setAllowSpectators] = useState(false);


    function handleSubmit(e: { preventDefault: () => void; })
    {
        e.preventDefault(); {/* For now*/}

        console.log("Username: " + userName);
        console.log("Continue Button clicked");
        console.log("Navigating to Media");

        navigateTo("/host/select-lab")//for now
    }

    console.log("Is the password selected? " + passwordIsSelected);
    console.log("Allow Spectators? " + allowSpectators);
    console.log("---------");

    
    return( 
        <div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="userName"> Enter your name </label>
                <input type="text" id="userName" onChange={(e) => setUserName(e.target.value)}></input>
                <input type="submit" value={"Host Lobby"}></input> {/*This will redirect to Media Page */}
            </form>
            <div className="flex gap-4" >
                <Checkbox size="sm" color="primary" onValueChange={() => setPasswordIsSelected(!passwordIsSelected)}>Use Password</Checkbox>
                {passwordIsSelected ? <div><label htmlFor="Password">Password</label><input id="Password" type="text" >Password</input></div> : null}
                <Checkbox size="sm" color="primary" onValueChange={() => setAllowSpectators(!allowSpectators)}>Allow Spectators</Checkbox>
            </div> 
       </div>
    )
}