import { Outlet } from "react-router-dom"

export default function HostRoot()
{
return(
    <div className="bg-green-400">
        <Outlet/> 
    </div>
)

}
