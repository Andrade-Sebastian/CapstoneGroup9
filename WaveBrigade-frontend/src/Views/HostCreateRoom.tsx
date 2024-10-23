import { useState } from "react";
import { useNavigate } from "react-router-dom";

// This is where the host will create the room 

export default function HostCreateRoom()
{

    const [experimentName, setExperimentName] = useState("");
    const [labDescription, setLabDescription] = useState("");
    const navigateTo = useNavigate();


    function handleSubmit(e)
    {
        e.preventDefault(); {/* For now*/}

        console.log("Lab Name: " + experimentName);
        console.log("Lab Description: " + labDescription);
        console.log("Continue Button clicked");
        console.log("Navigating to Media");

        navigateTo("/")//for now
    }

    return( 
       <div>
        <form onSubmit={handleSubmit}>
            <label htmlFor="experimentName" > Enter Name of Experiment* </label>
                <input type="text" id="experimentName" onChange={(e) => setExperimentName(e.target.value)}/> 

            <label htmlFor="labDescription"> Description* </label>    
            <input type="text" id="labDescription" onChange={(e) => setLabDescription(e.target.value)} />

            <input type="submit" value={"Continue"}></input> {/*This will redirect to Media Page */}
        </form>
       </div> 
    )
}