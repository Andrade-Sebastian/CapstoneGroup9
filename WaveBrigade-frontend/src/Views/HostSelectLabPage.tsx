
import { useState } from "react";
import { Listbox, ListboxItem } from "@nextui-org/listbox";
import {LabContainer} from "../Components/LabContainer.tsx"

//added routing to /host/select-lab
//8:49 - 
//created HostSelectlabPage
//installed nextUI
//Use a listbox from nextUI
//https://nextui.org/docs/components/listbox


// example import React, { useState } from 'react';

// function MyComponent() {
//     const [items, setItems] = useState([]);
  
//     const addItem = () => {
//       // Create a new array with the new item added
//       setItems([...items, 'New Item']);
//     };
  
//     return (
//       <div>
//         <ul>
//           {items.map((item, index) => (
//             <li key={index}>{item}</li>
//           ))}
//         </ul>
//         <button onClick={addItem}>Add Item</button>
//       </div>
//     );
//   }
export default function HostSelectLabPage()
{
    const [labs, setLabs] = useState([]); //will hold the labs 


    return (
        <div>
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
            <button onClick={() => console.log("Host Lab Button Clicked")}>Host Lobby</button>
        </div>
    )
}



