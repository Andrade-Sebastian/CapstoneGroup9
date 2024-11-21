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

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <h1>Experiment Creation</h1>
                <label htmlFor="experimentName">
                    Enter Name of Experiment*
                </label>
                <input
                    type="text"
                    id="experimentName"
                    onChange={(e) => setExperimentName(e.target.value)}
                />

                <label htmlFor="labDescription">Description*</label>
                <input
                    type="text"
                    id="labDescription"
                    onChange={(e) => setLabDescription(e.target.value)}
                />
            </form>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
      {/* Video Lab Checkbox and Description */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Checkbox size="sm" color="primary" value="video-lab">
          Video Lab
        </Checkbox>
        <p>
          Create a video lab experiment. Insert your own video or include a link for the experiment.
        </p>
      </div>

      {/* Picture Lab Checkbox and Description */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Checkbox size="sm" color="primary" value="picture-lab">
          Picture Lab
        </Checkbox>
        <p>
          Create a picture lab experiment. Insert your own picture or include a gif for the experiment.
        </p>
      </div>

      {/* Gallery Lab Checkbox and Description */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Checkbox size="sm" color="primary" value="gallery-lab">
          Gallery Lab
        </Checkbox>
        <p>
          Create a gallery experiment. Insert pictures to create a gallery style lab.
        </p>
      </div>
            {
                /* <div className="flex flex-col gap-4">
                <LabContainer>
                    <label htmlFor="labList" >Choose a Lab</label>
                    <Listbox variant="shadow" color="primary" onAction={(key) => console.log(key)}>
                        <ListboxItem key="Lab 1">Lab 1</ListboxItem>
                        <ListboxItem key="Lab 2">Lab 2</ListboxItem>
                        <ListboxItem key="Lab 3">Lab 3</ListboxItem>
                        <ListboxItem key="Lab 4">Lab 4</ListboxItem>
                        <ListboxItem key="Lab 5">Lab 5</ListboxItem>
                    </Listbox>
                </LabContainer>
            </div> */
            }
            <button
                onClick={() =>
                    navigateTo("/host/select-media", { state: { userName } })}
            >
                Continue
            </button>
        </div>
        </div>
    );
}
