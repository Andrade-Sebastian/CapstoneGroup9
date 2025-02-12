import Plot from 'react-plotly.js';
import React, {useState, useEffect} from 'react';
import { socket } from './Views/socket.tsx';

export default function ChartComponent() {

    const [plotState, acceptPlotDataState] = useState<Array<number>>([]);
    const [timeState, acceptTimeState] = useState<Array<number>>([]);
    const [edaState, acceptEdaDataState] = useState<Array<number>>([]);

    function addTempDataPoint(dataFrame: number, timeStamp: number){
        
        const numOfPoints = plotState.length;
        const numOfTimeStamps = timeState.length;

        const farenheit = (dataFrame * 1.8) + 32;
        
        console.log("LENGTH OF ARRAY: ", numOfPoints);
        console.log("TEMP: ", farenheit);

        if(numOfTimeStamps == 10){
            timeState.shift();
            acceptTimeState(timeState => [...timeState, timeStamp * 1000]);
        }
        else{
            acceptTimeState(timeState => [...timeState, timeStamp * 1000]);
        }

        if(numOfPoints == 100){
            plotState.shift();
            acceptPlotDataState(plotState => [...plotState, (dataFrame * 1.8) + 32]);
        }
        else{
            acceptPlotDataState(plotState => [...plotState, (dataFrame * 1.8) + 32]);
        }

    }

    function addEdaDataPoint(dataFrame: number){
        const numOfPoints = edaState.length;

        console.log("EDA: ", dataFrame);

        if(numOfPoints == 10){
            edaState.shift();
            acceptEdaDataState(edaState => [...edaState, dataFrame]);
        }
        else{
            acceptEdaDataState(edaState => [...edaState, dataFrame]);
        }

    }

    useEffect(() => {

        // function brainflowConnect(){
        //     console.log("(main.ts): Emitting brainflow-assignment with socketId:", socket.id);
        //     socket.emit("brainflow-client-assign", {socketId: socket.id});
        // }

        function simulateData(){
            const randomTemp = Math.random(); // Random temperature between 0 and 40
            const randomEda = Math.random() * 2; // Random EDA value between 0 and 2
            const currentTime = Date.now() / 1000; // Current timestamp in seconds

            addTempDataPoint(randomTemp, currentTime);
        }

        function onUpdate(payload){
            const {data, ipAddress, serialNumber, backendIp, hostSessionId, userId, frontEndSocketId, assignSocketId} = payload;
            //console.log('Update Event: Received data:', JSON.stringify(payload));
            
            //addTempDataPoint(data.data2, data.timestamp);
            
            //addEdaDataPoint(data.data1);

        }
       // brainflowConnect();
        //socket.on("brainflow-assignment", brainflowConnect);
        //Plot.relayout(Chart, onUpdate);
        
        const counter = 0;
        const intervalId = setInterval(() => {
            
            simulateData();
            Plot.extendTraces(Chart, { y: plotState, x: timeState});

            if(counter > 100){
                Plot.relayout(Chart, {
                    xaxis: {
                        range: [counter - 100, counter],
                    }
                })
            }
        }, 50);

        //recieve emotibit data
        //socket.on('update', onUpdate);

        // socket.on("connect", () => {
        //     console.log("Connect");
        // })

        

        return () => {
            // socket.off("brainflow-assignment", brainflowConnect);
           // socket.off("update", onUpdate);
            clearInterval(intervalId);
            //clearInterval(interval);
        };
    }, [addTempDataPoint, addEdaDataPoint, timeState]);

    return(
        <div className='h-auto w-auto'>
            <h1>EmotiBit Data Plot</h1>
            <div id="chart">
                <Plot
                    data={[
                    {
                        //x: timeState,
                        y: plotState,
                        mode: 'lines+markers',          // Line chart
                        type: 'line',
                        name: 'Temperature (°C)', // Label for the trace
                        line: {color: 'rgb(255, 99, 132)'} // Line color
                    },
                    // {
                    //     x: timeState,
                    //     y: edaState,
                    //     xaxis: 'x2',
                    //     yaxis: 'y2',
                    //     mode: 'lines+markers',          // Line chart
                    //     type: 'line',
                    //     name: 'EDA', // Label for the trace
                    //     line: {color: 'rgb(75,0,130)'} // Line color
                    // }
                    ]}
                    layout = {{
                        width: 1200,
                        height: 800,
                       // grid: {rows: 1, columns: 2, pattern: 'independent'},
                        //title: 'Temperature over Time',
                        // xaxis: {
                        //     title: 'Timestamp',
                        //     dtick: 1,
                        //     //type: 'date',         // Time axis for the x-axis
                        //     //tickformat: '%H:%M', // Display hours, minutes, and seconds in the tooltip
                        // },
                        yaxis: {
                            title: 'Temperature (°C)',
                            range: [30, 36],
                            tick: 0.5,
                        },
                        // xaxis2: {
                        //     title: 'Timestamp',
                        //     type: 'date',         // Time axis for the x-axis
                        //     tickformat: '%H:%M', // Display hours, minutes, and seconds in the tooltip
                        // },
                        // yaxis2: {
                        //     title: 'EDA',
                        //     autorange: true,
                        //     dtick: 0.5,
                        // },
                        showlegend: true,
                        //responsive: true,
                    }}
                />
            </div> 
        </div>
    );
}