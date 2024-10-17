import { useState } from "react"

export default function JoinPage()
{
    const [roomCode, setRoomCode] = useState("")

    function handleSubmit(e){
        e.preventDefault()
        console.log("Room Code:" + roomCode)
    }

    return(
        <div>
            <p>Join Page</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="roomCode"> Room Code </label>
                <input type="text" id="roomCode" onChange={(e) => setRoomCode(e.target.value)}/> 
                <input type="submit"/> 
            </form>
            <button onClick={() => console.log("Join clicked")}>Join</button> {/*This will redirect to the waiting room */}
        </div>
    )
}