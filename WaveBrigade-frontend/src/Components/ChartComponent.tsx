import Plot from "react-plotly.js";
import React, { useState, useEffect } from "react";
import socket from "../Views/socket.tsx";

//Chart Types
//ECG Heart Rate - 1
//Body Temperature - 2
//Skin Response - 3

interface IDataType {
  chart_type: number;
  chart_name: string;
  chart_color: string;
  user_id: string;
  className?: string;
}
let average = 0;
let low = 0;
let high = 0;
const now: Date = new Date();

export default function ChartComponent(props: IDataType) {
  let lastDataType = 0;

  const [plotState, acceptPlotDataState] = useState<Array<number>>([]);
  const [timeState, acceptTimeState] = useState<Array<number>>([]);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(1);
  //const [edaState, acceptEdaDataState] = useState<Array<number>>([]);

  function addDataPoint(
    ancDataFrame,
    auxDataFrame,
    heartRate,
    timeStamp: number
  ) {
    const numOfPoints = plotState.length;
    const numOfTimeStamps = timeState.length;
    let current_data = 0;

    //console.log("LENGTH OF ARRAY: ", numOfPoints);

    // CHART TYPE IF STATEMENTS
    if (props.chart_type === 1) {
      current_data = heartRate;
      //console.log("HR: ", current_data);
      //console.log( "ECG CHART")
    } else if (props.chart_type === 2) {
      current_data = ancDataFrame.data2 * 1.8 + 32;
      //console.log("TEMP CHART: ", current_data);
    } else if (props.chart_type === 3) {
      current_data = ancDataFrame.data1;
      //console.log("EDA CHART" , current_data);
    } else {
      console.log("Invalid Chart Type");
      return 0;
    }

    if (numOfPoints === 100) {
      //console.log("100 POINTS RECIEVED");
      const temp_plot = [...plotState];
      average = calculateAverage(temp_plot);
      temp_plot.shift();
      temp_plot.push(current_data);
      acceptPlotDataState(temp_plot);
      //acceptPlotDataState(plotState => plotState.slice(0, (100 - plotState.length)));
      // acceptPlotDataState(plotState => [...plotState, current_data]);
    } else {
      acceptPlotDataState((plotState) => [...plotState, current_data]);
    }
  }

  function calculateAverage(array) {
    let sum = 0;
    for (let i = 0; i < array.length; i++) {
      sum = array[i] + sum;
    }
    const avg = sum / array.length;
    low = Math.min(...array);
    high = Math.max(...array);
    return avg;
  }

  useEffect(() => {
    console.log("Clearing arrays");
    acceptPlotDataState([]);
    average = 0;
    low = 0;
    high = 0;
    if(props.chart_type === 1){
      setMin(60);
      setMax(90);
    }
    else if(props.chart_type === 2){
      
        setMin(80);
        setMax(98);
    }
    else if(props.chart_type === 3){
      setMin(0);
      setMax(2);
    }
    else{
        setMin(0);
        setMax(1);
    }
    // console.log("MAX: ", max);
    //   console.log("MIN: ", min);
  }, [props.chart_type]);

  //every 5 seconds check the max/min
  useEffect(() => {
    if (plotState.length === 0) return;

    const timeout = setTimeout(() => {
      const currentMin = Math.min(...plotState);
      const currentMax = Math.max(...plotState);
  
      setMin(currentMin);
      setMax(currentMax);
    }, 5000); // delay updates by 5 seconds
  
    return () => clearTimeout(timeout); // cleanup
  }, [plotState]);

  useEffect(() => {
    function brainflowConnect() {
      console.log(
        "(chartComponent.ts): Emitting brainflow-assignment with socketId:",
        socket.id
      );
      socket.emit("brainflow-client-assign", { socketId: socket.id });
    }

    // function simulateData(){
    //     const randomTemp = Math.random(); // Random temperature between 0 and 40
    //     const randomEda = Math.random() * 2; // Random EDA value between 0 and 2
    //     const currentTime = Date.now() / 1000; // Current timestamp in seconds

    //     //addTempDataPoint(randomTemp, currentTime);
    // }

    function onUpdate(payload) {
      const {
        ancData,
        auxData,
        heartRate,
        ipAddress,
        serialNumber,
        backendIp,
        hostSessionId,
        userId,
        frontEndSocketId,
        assignSocketId,
      } = payload;
      const selectedUser = String(userId);
      if (String(props.user_id) === selectedUser) {
        addDataPoint(ancData, auxData, heartRate, ancData.timestamp);
      }
    }
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
    socket.on("update", onUpdate);
    // socket.on("connect", () => {
    //     console.log("Connect");
    // })

    return () => {
      socket.off("brainflow-assignment", brainflowConnect);
      socket.off("update", onUpdate);
    };
  }, [addDataPoint, timeState]);

  return (
    <div className="flex flex-col w-full h-full max-h-full flex flex-col">
      <div className="flex flex-row gap-4">
        <div>Average: {average.toFixed(2)}</div>
        <div> Low: {low.toFixed(2)}</div>
        <div> High: {high.toFixed(2)}</div>
      </div>
      {/* <p> The user_id is: {props.user_id} </p> */}
      <Plot
        className="w-full h-full"
        data={[
          {
            //x: timeState,
            y: plotState,
            mode: "lines", // Line chart
            type: "line",
            name: props.chart_name, // Label for the trace
            line: { color: props.chart_color }, //'rgb(255, 99, 132)'} // Line color
          },
        ]}
        layout={{
          yaxis: {
            title: "Temperature (°F)", //props.chart_name,,
            range: [min, max + 1],
            tick: 1,
          },
          // margin: {
          //   l: 0,
          //   r: 0,
          //   b: 0,
          //   t: 0,
          // },
          showlegend: true,
          responsive: true,
        }}
        config={{
          displayModeBar: false,
          scrollZoom: false,
        }}
      />
    </div>
  );
}
