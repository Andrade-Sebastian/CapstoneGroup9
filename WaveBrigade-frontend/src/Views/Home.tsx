import React from "react";
import { useNavigate } from "react-router-dom";


export default function Home()
{
    const navigateTo = useNavigate();

    function handleJoinButtonClick()
    {
        navigateTo("join");
    }

    function handleHostButtonClick()
    {
        navigateTo("host/create");
    }

    function handleLabButtonClick()
    {
        navigateTo("create-lab");
    }

    return (
        <div>
            <div className="justify-center">
                <p>Welcome to Wavebrigade!</p>
            </div>
            
            <div className="flex justify-center items-center h-screen">
                <button className="px-20" onClick={handleHostButtonClick}>Host</button> 
                <button className="px-20" onClick={handleJoinButtonClick}>Join</button> 
                {/* replace google.com with the link to the next page on Figma */}
                <button className="px-20" onClick={handleLabButtonClick}> Create New Experiment </button>
                {/* <p>Educator: <a href="create-lab">Create New Experiment</a></p> */}
            </div>
            
        </div>
    )
}