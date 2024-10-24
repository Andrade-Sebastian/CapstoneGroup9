
import { useState } from "react";
import { Listbox, ListboxItem } from "@nextui-org/listbox";
import {LabContainer} from "../Components/LabContainer.tsx"
import { useNavigate } from "react-router-dom";

//added routing to /host/select-lab
//8:49 - 
//created HostSelectlabPage
//installed nextUI
//Use a listbox from nextUI
//https://nextui.org/docs/components/listbox


export default function HostSelectLabPage()
{
    const [experimentName, setExperimentName] = useState("");
    const [labDescription, setLabDescription] = useState("");
    const navigateTo = useNavigate();


    //const [labs, setLabs] = useState([]); //will hold the labs 

    function handleSubmit(e: { preventDefault: () => void; })
    {
        e.preventDefault(); {/* For now*/}
        
        console.log("Lab Name: " + experimentName);
        console.log("Lab Description: " + labDescription);
        console.log("Continue Button clicked");
        console.log("Navigating to Media");
    }


    return (
        <div>

            <form onSubmit={handleSubmit}>
                <label htmlFor="experimentName" > Enter Name of Experiment* </label>
                    <input type="text" id="experimentName" onChange={(e) => setExperimentName(e.target.value)}/> 

                <label htmlFor="labDescription"> Description* </label>    
                <input type="text" id="labDescription" onChange={(e) => setLabDescription(e.target.value)} />
            </form>

            <div className="flex flex-col gap-4">
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
            </div>
            <button onClick={() => navigateTo("/host/select-media")}>Continue</button>
        </div>
    )
}



