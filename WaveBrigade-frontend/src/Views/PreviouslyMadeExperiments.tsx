import React from "react";
import { useNavigate } from "react-router-dom";

export default function PreviouslyMadeExperiments(){
    const navigateTo = useNavigate()


    return(
    <>
        
        <div>
            <h1 style={{textAlign: "center"}}>View previously made experiments</h1>
        </div>

        <div style={{ backgroundColor: 'gray' }}>
            <div> 
                <p> Video Lab #3</p> 
                <p>A sexy Mike Tyson with his cheeks out lab to monitor temperature and arousal.</p>
            </div>

            <div> 
                <p>Picture Lab #3</p> 
                <p>A gallery of your mom's pictures and videos being naughty.”</p>
            </div>

            <div>
                <p>Gallery Lab #5</p>
                <p>Exploring students' arousal level of your Mom.</p>
            </div>
            
            <h2 style={{textAlign: "center"}}> Create an Experiment</h2>
            <div style={{display: "flex", justifyContent: "center", }}>
                <button style={{backgroundColor: "blue"}} onClick={() => navigateTo("/createLab/select-lab")}>Create Experiment</button>
            </div>
        </div>



    </>
    )
    
}