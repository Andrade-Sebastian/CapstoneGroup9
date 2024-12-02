import React, { ReactElement, useEffect, useState } from "react";
import { Listbox, ListboxItem } from "@nextui-org/listbox";
import { Card, CardBody, Checkbox, CheckboxGroup } from "@nextui-org/react";
import { LabContainer } from "../Components/LabContainer.tsx";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { IoVideocam } from "react-icons/io5";
import { TfiGallery } from "react-icons/tfi";
import { TiCamera } from "react-icons/ti";

import { HiAcademicCap } from "react-icons/hi";
import LabTemplatesCard from "../Components/LabTemplatesCard.tsx";
import CardComponentRadio from "../Components/CardComponentRadio.tsx";
//added routing to /host/select-lab
//8:49 -
//created HostSelectlabPage
//installed nextUI
//Use a listbox from nextUI
//https://nextui.org/docs/components/listbox

//    const { nickName, roomCode } = location.state || {};

export interface ILab {
  id: string;
  name: string;
  description: string;
  iconPath?: ReactElement;
}

export default function HostSelectLabPage() {
  const location = useLocation();
  console.log(
    "@HOST SELECT LAB | location.state:",
    JSON.stringify(location.state)
  );
  const { userName } = location.state;
  console.log("HOSTSELECTLAB userName: " + userName);
  const [experimentName, setExperimentName] = useState("");
  const [labDescription, setLabDescription] = useState("");
  const [selectedLab, setSelectedLab] = useState<ILab>();

  const labs: Array<ILab> = [
    {
      id: "01234",
      name: "Video Lab",
      description:
        "Create a video lab experiment. Insert your own video or include a link for the experiment.",
      iconPath: <IoVideocam className="size-8" />,
    },
    {
      id: "1",
      name: "Video Lab 2",
      description:
        "Create a video lab experiment. Insert your own video or include a link for the experiment.",
      iconPath: <IoVideocam className="size-8"/>,
    },
    {
      id: "2",
      name: "Picture Lab",
      description:
        "Create a picture lab experiment. Insert your own picture or include a gif for the experiment.",
      iconPath: <TiCamera className="size-8"/>,
    },
    {
      id: "3",
      name: "GalleryLab",
      description:
        "Create a gallery experiment. Insert pictures to create a gallery style lab.",
      iconPath: <TfiGallery className="size-8"/>,
    },
  ];
  const navigateTo = useNavigate();

  //const [labs, setLabs] = useState([]); //will hold the labs

  function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    {
      /* For now*/
    }

    console.log("Lab Name: " + experimentName);
    console.log("Lab Description: " + labDescription);
    console.log("Continue Button clicked");
    console.log("Navigating to Media");
  }

  useEffect(() => {
    console.log(selectedLab)
  }, [selectedLab])

  // export default function ExperimentCreationForm({ handleSubmit, setExperimentName, setLabDescription, userName }) {
  return (
    <div className="flex justify-center items-center min-h-screen h-auto p-4 place-content-center ">
      <div className="bg-white rounded-xl p-8 shadow-lg w-4/5 overflow-auto place-content-center">
        <form onSubmit={handleSubmit} className="flex flex-col gap-14">
          <h1 className="text-3xl font-semibold text-center mb-4 text-gray-800">
            Experiment Creation
          </h1>

          <label
            htmlFor="experimentName"
            className="font-semibold text-gray-700"
          >
            Enter Name of Experiment <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="experimentName"
            className="border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Enter experiment name"
            onChange={(e) => setExperimentName(e.target.value)}
          />

          <label
            htmlFor="labDescription"
            className="font-semibold text-gray-700"
          >
            Description <span className="text-red-600">*</span>{" "}
            {/* make this required*/}
          </label>
          <textarea
            id="labDescription"
            className="border border-gray-300 rounded-md p-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Provide a description of the experiment"
            onChange={(e) => setLabDescription(e.target.value)}
          ></textarea>

          <h2>
            <strong>Lab Templates</strong>
          </h2>

          {/* LAB TEMPLATES */}
          <div className="grid grid-cols-2 grid-rows-2 gap-20 items-center overflow-auto">
            {/* Video Lab Checkbox and Description */}

            {/*A Single lab */}
              {labs.map((lab) => (
                <CardComponentRadio key={lab.id} selectedLab={selectedLab} handler = {() => setSelectedLab(lab)} value={lab} headingTitle={lab.name} icon={lab.iconPath || <IoVideocam/>} description={lab.description} />
                
              ))}
         
          </div>

          <button
            type="submit"
            className="mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-md shadow-md transition duration-300 ease-in-out"
            onClick={() =>
              navigateTo("/host/select-media", { state: { userName } })
            }
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
