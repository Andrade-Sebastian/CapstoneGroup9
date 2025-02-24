import Plot from 'react-plotly.js';
import React, {useState, useEffect} from 'react';
import socket from '../Views/socket.tsx';

//Chart Types
//ECG Heart Rate - 1
//Body Temperature - 2
//Skin Response - 3
interface IDataType {
    chart_type: number;
    //chart_name: string;
    //chart_color: string;
}

export default function ChartComponent(props: IDataType) {
    let lastDataType = 0;
    const [plotState, acceptPlotDataState] = useState<Array<number>>([]);
    const [timeState, acceptTimeState] = useState<Array<number>>([]);
    const [edaState, acceptEdaDataState] = useState<Array<number>>([]);

    function addDataPoint(ancDataFrame, auxDataFrame, timeStamp: number){
        
        const numOfPoints = plotState.length;
        const numOfTimeStamps = timeState.length;
        let current_data: number;

        console.log("LENGTH OF ARRAY: ", numOfPoints);

        if(numOfTimeStamps == 10){
            timeState.shift();
            acceptTimeState(timeState => [...timeState, timeStamp * 1000]);
        }
        else{
            acceptTimeState(timeState => [...timeState, timeStamp * 1000]);
        }

        // CHART TYPE IF STATEMENTS  
        if(props.chart_type === 1){
            console.log( "ECG CHART")
        }  
        else if(props.chart_type === 2){
            current_data = (ancDataFrame.data2 * 1.8) + 32;
            console.log("TEMP CHART: ", current_data);
        }
        else if(props.chart_type === 3){
            current_data = (ancDataFrame.data1);
            console.log("EDA CHART" , current_data);
        }
        else{
            console.log("Invalid Chart Type");
            return 0;
        }

        if(numOfPoints == 100){
            plotState.shift();
            acceptPlotDataState(plotState => [...plotState, current_data]);
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

        function simulateData(){
            const randomTemp = Math.random(); // Random temperature between 0 and 40
            const randomEda = Math.random() * 2; // Random EDA value between 0 and 2
            const currentTime = Date.now() / 1000; // Current timestamp in seconds

            //addTempDataPoint(randomTemp, currentTime);
        }

        function onUpdate(payload){
            console.log("=======================ONUPDATE")
            const {ancData, auxData, ipAddress, serialNumber, backendIp, hostSessionId, userId, frontEndSocketId, assignSocketId} = payload;
            console.log("INSIDE ON UPDATE FUNCTION");
            addDataPoint(ancData, auxData, ancData.timestamp);
        }
        socket.on("connect", () => {
            console.log("Connect");
        })
        //brainflowConnect();
        socket.on("brainflow-assignment", brainflowConnect);
        //Plot.relayout(Chart, onUpdate);
        
        // const counter = 0;
        // const intervalId = setInterval(() => {
            
        //     simulateData();
        //     Plot.extendTraces(Chart, { y: plotState, x: timeState});

        //     if(counter > 100){
        //         Plot.relayout(Chart, {
        //             xaxis: {
        //                 range: [counter - 100, counter],
        //             }
        //         })
        //     }
        // }, 50);

        //recieve emotibit data
        console.log("===============RIGHT BEFORE SOCKET ON UPDATE IN USE EFFECT TOO==========")
        socket.on('update', onUpdate);
        console.log("===============AFTER the stuff=============")
        

        

        return () => {
            socket.off("brainflow-assignment", brainflowConnect);
            socket.off("update", onUpdate);
            //clearInterval(intervalId);
            //clearInterval(interval);
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
                        mode: 'lines+markers',          // Line chart
                        type: 'line',
                        name: 'Temperature (°C)', //props.chart_name, // Label for the trace
                        line: {color: 'rgb(255, 99, 132)'} //props.chart_color } //'rgb(255, 99, 132)'} // Line color
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
                        width: 1000,
                        height: 300,
                       // grid: {rows: 1, columns: 2, pattern: 'independent'},
                        //title: 'Temperature over Time',
                        // xaxis: {
                        //     title: 'Timestamp',
                        //     dtick: 1,
                        //     //type: 'date',         // Time axis for the x-axis
                        //     //tickformat: '%H:%M', // Display hours, minutes, and seconds in the tooltip
                        // },
                        yaxis: {
                            title: 'Temperature (°C)',//props.chart_name,,
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
                    config={{
                        displayModeBar: false 
                      }}
                />
            </div> 
        </div>
    );
}