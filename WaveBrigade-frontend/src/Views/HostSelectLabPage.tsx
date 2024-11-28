import React from "React";
import { useState } from "react";
import { Listbox, ListboxItem } from "@nextui-org/listbox";
import { Card, CardBody, Checkbox, CheckboxGroup } from "@nextui-org/react";
import { LabContainer } from "../Components/LabContainer.tsx";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";

//added routing to /host/select-lab
//8:49 -
//created HostSelectlabPage
//installed nextUI
//Use a listbox from nextUI
//https://nextui.org/docs/components/listbox

//    const { nickName, roomCode } = location.state || {};
export default function HostSelectLabPage() {
    const location = useLocation();
    console.log(
        "@HOST SELECT LAB | location.state:",
        JSON.stringify(location.state),
    );

    const { userName } = location.state;
    console.log("HOSTSELECTLAB userName: " + userName);
    const [experimentName, setExperimentName] = useState("");
    const [labDescription, setLabDescription] = useState("");
    const [videoLabIsSelected, setVideoLabIsSelected] = useState(false);
    const [pictureLabIsSelected, setPictureLabIsSelected] = useState(false);
    const [galleryLabIsSelected, setGalleryLabIsSelected] = useState(false);
    const navigateTo = useNavigate();

    //const [labs, setLabs] = useState([]); //will hold the labs

    function handleSubmit(e: { preventDefault: () => void }) {
        e.preventDefault();
        {/* For now*/}

        console.log("Lab Name: " + experimentName);
        console.log("Lab Description: " + labDescription);
        console.log("Continue Button clicked");
        console.log("Navigating to Media");
    }
    
    // export default function ExperimentCreationForm({ handleSubmit, setExperimentName, setLabDescription, userName }) {
    return (
          <div className="flex justify-center items-center min-h-screen p-4">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <h1 className="text-3xl font-semibold text-center mb-4 text-gray-800">Experiment Creation</h1>
      
                <label htmlFor="experimentName" className="font-semibold text-gray-700">
                  Enter Name of Experiment <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  id="experimentName"
                  className="border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter experiment name"
                  onChange={(e) => setExperimentName(e.target.value)}
                />
      
                <label htmlFor="labDescription" className="font-semibold text-gray-700">
                  Description <span className="text-red-600">*</span> {/* make this required*/}
                </label>
                <textarea
                  id="labDescription"
                  className="border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Provide a description of the experiment"
                  onChange={(e) => setLabDescription(e.target.value)}
                ></textarea>
      
                <div className="flex flex-col gap-6">
                  {/* Video Lab Checkbox and Description */}
                  <div className="flex items-start gap-4 border border-gray-300 rounded-md">
                    <Checkbox size="lg" color="primary" value="video-lab" className="font-semibold" onValueChange={() => setVideoLabIsSelected(!videoLabIsSelected)}>
                      Video Lab
                    </Checkbox>
                    {/* {videoLabIsSelected ? (
                      setPictureLabIsSelected = false;
                      setGalleryLabIsSelected = false;
                    ) : null} */}
                    <p className="text-gray-700 py-3">
                      Create a video lab experiment. Insert your own video or include a link for the experiment.
                    </p>
                  </div>
      
                  {/* Picture Lab Checkbox and Description */}
                  <div className="flex items-start gap-4 border border-gray-300 rounded-md">
                    <Checkbox size="lg" color="primary" value="picture-lab" className="font-semibold" onValueChange={() => setPictureLabIsSelected(!pictureLabIsSelected)}>
                      Picture Lab
                    </Checkbox>
                    <p className="text-gray-700 py-4">
                      Create a picture lab experiment. Insert your own picture or include a gif for the experiment.
                    </p>
                  </div>
      
                  {/* Gallery Lab Checkbox and Description */}
                  <div className="flex items-start gap-4 border border-gray-300 rounded-md">
                    <Checkbox size="lg" color="primary" value="gallery-lab" className="font-semibold" onValueChange={() => setGalleryLabIsSelected(!galleryLabIsSelected)}>
                      Gallery Lab
                    </Checkbox>
                    <p className="text-gray-700 py-4 ">
                      Create a gallery experiment. Insert pictures to create a gallery style lab.
                    </p>
                  </div>
                </div>
      
                <button
                  type="submit"
                  className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out"
                  onClick={() => navigateTo("/host/select-media", { state: { userName } })}
                >
                  Continue
                </button>
              </form>
            </div>
          </div>
        );
      }
      
