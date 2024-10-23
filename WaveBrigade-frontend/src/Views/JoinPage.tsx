import { useState } from "react"
import { useNavigate } from "react-router-dom";

export default function JoinPage()
{
    const [nickName, setNickName] = useState("")
    const [roomCode, setRoomCode] = useState("")
    const navigateTo = useNavigate();

    
    function handleSubmit(e){
        e.preventDefault()
        console.log("Nickname:" + nickName)
        console.log("Room Code:" + roomCode)
        navigateTo("user-waiting-room");
    }
    
    return(
        <div>
            <p>Join Page</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="nickName"> Enter your nickname </label>
                <input type="text" id="nickName" onChange={(e) => setNickName(e.target.value)} />
                <label htmlFor="roomCode"> Room Code </label>
                <input type="text" id="roomCode" onChange={(e) => setRoomCode(e.target.value)}/> 
                <input type="submit" value={"Join"}/> {/*This will redirect to the waiting room */}
            </form>
        </div>
    )
}