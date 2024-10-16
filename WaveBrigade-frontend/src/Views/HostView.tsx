import { useEffect } from "react";
import { useParams } from "react-router-dom";

export default function HostView()
{
    const {room} = useParams();

    useEffect(() => {
        console.log(room)
    }, [room])

    return (
        <div>
            HostView - {room} {/*Placeholder*/}
        </div>
    )
}