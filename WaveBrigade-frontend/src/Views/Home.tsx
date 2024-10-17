
export default function Home()
{
    return (
        <div>

        <div className="justify-center">
            <p>Welcome to Wavebrigade!</p>
        </div>
        
        <div className="flex justify-center items-center h-screen">
            <button className="px-20" onClick={() => console.log("Join Clicked")}>Join</button> {/* redirect to /join --Eman*/}
            <p> hi brtohasfij </p>
            <button className="px-20" onClick={() => console.log("Host Clicked")}>Host</button> {/*redirect to /host --Sebastian*/}
        </div>

        </div>
    )
}