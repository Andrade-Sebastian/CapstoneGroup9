import { useEffect } from "react";
import { useParams } from "react-router-dom";


{/*This is what the host will see while people do their labs*/}

export default function HostView()
{
    const {room} = useParams();

    useEffect(() => {
        console.log(room)
    }, [room])

    return (
        <div className="bg-blue-500">
            TEST: IF THIS IS BLUE, TAILWIND WORKS
            HostView - {room} {/*Placeholder*/}
        </div>
    )
}