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

    return (
        <div>

        <div className="justify-center">
            <p>Welcome to Wavebrigade!</p>
        </div>
        
        <div className="flex justify-center items-center h-screen">
            <button className="px-20" onClick={handleJoinButtonClick}>Join</button> 
            <button className="px-20" onClick={handleHostButtonClick}>Host</button> 
        </div>

        </div>
    )
}