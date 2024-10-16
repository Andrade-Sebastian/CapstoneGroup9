
export default function Home()
{
    return (
        <div>

        <div className="justify-center">
            <p>Welcome to Wavebrigade!</p>
        </div>
        
        <div className="flex justify-center items-center h-screen">
            <button className="px-20" onClick={() => console.log("Join Clicked")}>Join</button>
            <button className="px-20" onClick={() => console.log("Host Clicked")}>Host</button>
        </div>

        </div>
    )
}