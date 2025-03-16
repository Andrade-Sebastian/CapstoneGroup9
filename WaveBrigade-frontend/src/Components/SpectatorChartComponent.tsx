import Plot from 'react-plotly.js';
import React, {useState, useEffect} from 'react';
import socket from '../Views/socket.tsx';

//Chart Types
//ECG Heart Rate - 1
//Body Temperature - 2
//Skin Response - 3
interface ISpectatorChartComponent {
    chart_type: number;
    chart_name: string;
    chart_color: string;
    focusedUserSocketID: string;
}
let max = 98;
let min = 93;
const now: Date = new Date();

export default function SpectatorChartComponent(props: ISpectatorChartComponent) {
    let lastDataType = 0;
    
    const [plotState, acceptPlotDataState] = useState<Array<number>>([]);
    const [timeState, acceptTimeState] = useState<Array<number>>([]);

    function addDataPoint(ancDataFrame, auxDataFrame, timeStamp: number){
        
        const numOfPoints = plotState.length;
        const numOfTimeStamps = timeState.length;
        let current_data = 0;

        // console.log("LENGTH OF ARRAY: ", numOfPoints);

        
        if(props.chart_type === 1){
            // console.log( "ECG CHART")
        }  
        else if(props.chart_type === 2){
            min = 80;
            max = 98;
            current_data = (ancDataFrame.data2 * 1.8) + 32;
            // console.log("TEMP CHART: ", current_data);
        }
        else if(props.chart_type === 3){
            min = 0;
            max = 2;
            current_data = (ancDataFrame.data1)
            // console.log("EDA CHART" , current_data);
        }
        else{
            // console.log("Invalid Chart Type");
            return 0;
        }

        let counter = 0;
        const intervalId = setInterval(() => {
            counter++
            max = Math.max(max, Math.round(current_data));
            min = max - 1;


            if(counter >= 5){
                clearInterval(intervalId);
                max = current_data;
                min = max - 1;
            }
        }, 10000);

        if(numOfPoints === 100){
            // console.log("100 POINTS RECIEVED");
            const temp_plot = [...plotState];
            temp_plot.shift();
            temp_plot.push(current_data);
            acceptPlotDataState(temp_plot);
        }
        else{
            acceptPlotDataState(plotState => [...plotState, current_data]);
        }
        
        
    }

    useEffect(() => {

        function brainflowConnect(){
            console.log("(chartComponent.ts): Emitting brainflow-assignment with socketId:", socket.id);
            socket.emit("brainflow-client-assign", {socketId: socket.id});
        }


        function onUpdate(payload){
            const {ancData, auxData, ipAddress, serialNumber, backendIp, hostSessionId, userId, frontEndSocketId, assignSocketId} = payload;
            addDataPoint(ancData, auxData, ancData.timestamp);
        }
        
        socket.on("brainflow-assignment", brainflowConnect);

        //recieve emotibit data
        socket.on('update', onUpdate);
             

        return () => {
            socket.off("brainflow-assignment", brainflowConnect);
            socket.off("update", onUpdate);
        };
    }, [addDataPoint, timeState]);

    return(
        <div className='h-auto w-auto'>
            <div id="chart">
                
                <Plot
                    data={[
                    {
                        //x: timeState,
                        y: plotState,
                        mode: 'lines',          // Line chart
                        type: 'line',
                        name: props.chart_name, // Label for the trace
                        line: {color: props.chart_color} //'rgb(255, 99, 132)'} // Line color
                    },
                    
                    ]}
                    layout = {{
                        width: 1000,
                        height: 500,
                       
                        yaxis: {
                            title: 'Temperature (°F)',//props.chart_name,,
                            range: [min, max + 1],
                            tick: 1,
                        },
                        showlegend: true,
                    }}
                    config={{
                        displayModeBar: false 
                      }}
                />
            </div> 
        </div>
    );
}