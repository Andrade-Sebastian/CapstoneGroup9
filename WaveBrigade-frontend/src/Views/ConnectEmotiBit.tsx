import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import SideComponent from "../Components/SideComponent";
import { PiAtomThin } from "react-icons/pi";
import SerialCodeInput from "../Components/SerialInput";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

export default function ConnectEmotiBit() {
  const location = useLocation();
  const { nickName, roomCode } = location.state || {};
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigateTo = useNavigate();

const handleComplete = (code: string) => {
  console.log("Serial Code Entered:", code);
  setCode(code);
};
const handleSubmit = async (e: React.FormEvent) =>{
  e.preventDefault();

  const loadingToastId = toast.loading("Verifying code...");
  if (isSubmitting) return;

  setIsSubmitting(true);

  try{
    //logic for sending code to backend
    const response = await axios.post("http://localhost:3000/joiner/verify-code",{
      nickName,
      roomCode,
      serialCode: code,
    });
    if(response.data.success){
      toast.success("Connection Successful! Your EmotiBit was connected successfully", {id: loadingToastId});
      setTimeout(() => {
        navigateTo("/waiting-room", {state: {nickName, roomCode}});
      }, 2000);
      }
    else{
      //serial code doesn't match...
      toast.error("Connection failed. Looks like we couldn't get you connected. Please check your serial number and try again.", {id: loadingToastId});
    }
  } catch(error){
    console.log("error verifying code!");
    console.error("Error verifying code:", error);
    toast.error("Connection failed. Looks like we couldn't get you connected. Please check your serial number and try again.", {id: loadingToastId});
  } finally{
    setIsSubmitting(false);
  }
  };
  return (
    <div className="flex h-screen">
      <Toaster position="top-right" /> 
      <div className="flex flex-col items-center justify-center w-2/5">
             <SideComponent
             icon={<PiAtomThin style={{ fontSize: "200px" }} />}  
             headingTitle="Connect Your EmotiBit"
             description="It's time to grab your EmotiBit! Find its serial number and enter the last four digits to continue"
         />
        </div>
        <div className="flex flex-col items-center justify-center w-2/5">
        <form className="w-full max-w-md" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center ">
        <SerialCodeInput length={4} onComplete={handleComplete} onChange={(updatedCode) =>setCode(updatedCode)} />
            <button
              disabled={code.length !==4}
              type="submit"
              className={`mt-14 font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out ${
                code.length === 4
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              Join Lobby
            </button>
        </div>
            </form>
      </div>
    </div>
  );
}
