import { useNavigate } from "react-router-dom";

export default function Home()
{
    const navigateTo = useNavigate();

    function handleJoinButtonClick()
    {
        navigateTo("join");
    }

    return (
        <div>

        <div className="justify-center">
            <p>Welcome to Wavebrigade!</p>
        </div>
        
        <div className="flex justify-center items-center h-screen">
            <button className="px-20" onClick={handleJoinButtonClick}>Join</button> 
            <button className="px-20" onClick={() => console.log("Host Clicked")}>Host</button> {/*redirect to /host --Sebastian*/}
        </div>

        </div>
    )
}