import Plot from 'react-plotly.js';
import React, {useState, useEffect} from 'react';
import socket from '../Views/socket.tsx';
import { ipcRenderer, session } from 'electron';

//Chart Types
//ECG Heart Rate - 1
//Body Temperature - 2
//Skin Response - 3
interface IUserDataType {
    chart_types: string[];
    user_id: number;
}

const now: Date = new Date();

const MAX_POINTS = 100;

export default function ChartComponent(props: IUserDataType) {
    let lastDataType = 0;
    
    const [plotState, setPlotData] = useState<{[key:string]: number[]}> ({
       heartRate: [],
       temperature: [],
       gsr: [], 
    });

    const [timeState, acceptTimeState] = useState<Array<number>>([]);
    //const [edaState, acceptEdaDataState] = useState<Array<number>>([]);
    // const [min, setMin] = useState(93);
    // const [max, setMax] = useState(98);
    const [min, setMin] = useState(0);
    const [max, setMax] = useState(100);
    const ipc = window.api;

    const chartMeta = {
        heartRate : { name: "BPM", color: "rgb(255,0,0)", type: 1},
        temperature : { name: "°F", color: "rgb(0,0,255)", type: 2},
        gsr : { name: "EDA", color: "rgb(75,0,130)", type: 3}

    };
    
    const updateSeries = (key: string, newVal: number) => {
        setPlotData((prev) => {
            const updated = [...prev[key], newVal];
            return {
                ...prev,
                [key]: updated.length > MAX_POINTS ? updated.slice(-MAX_POINTS) : updated
            };
        });
    };

    console.log("CHART TYPE: ", props.chart_type);

    const addDataPoint = (type: string, value: number, ancDataFrame, auxDataFrame, timeStamp: number) => {

        setPlotData((prev) => {
            const updated = [...prev[type], value];
            return {
                ...prev,
                [type]: updated.length > MAX_POINTS ? updated.slice(-MAX_POINTS) : updated
            };
        });

        setMax((prevMax) => Math.max(prevMax, Math.round(value)));
        setMin((prevMin) => Math.min(prevMin, Math.round(value) - 1));

        
    }

    useEffect(() => {

        setPlotData({
            heartRate: [],
            temperature: [],
            gsr: []
        });

        const onUpdate = (payload) => {
            const {ancData, auxData, ipAddress, serialNumber, backendIp, hostSessionId, userId, heartRate, frontEndSocketId, assignSocketId} = payload;
            if(String(props.user_id) !== String(userId)){
                return;
            }
            if(props.chart_types.includes('heartRate')){
                addDataPoint('heartRate', heartRate, ancData, auxData, ancData.timestamp)
            }
            if(props.chart_types.includes('temperature')){
                const temp = ancData.data2  * 1.8 + 32;
                addDataPoint('temperature', temp, ancData, auxData, ancData.timestamp);
            }
            if(props.chart_types.includes('gsr')){
                const gsrVal = ancData.data1;
                addDataPoint('gsr', gsrVal, ancData, auxData, ancData.timestamp);
            }
        }
        socket.on('update', onUpdate);

        return () => {
            socket.off('update', onUpdate);
        };
    }, [addDataPoint, timeState, props.user_id, props.chart_types]);

    return(
        <div className='w-full h-full'>
            <div id={`chart-${props.user_id}`}>
                
                <Plot
                    data={props.chart_types
                        .filter((type) => chartMeta[type]) 
                        .map((type) => ({
                          y: plotState[type],
                          type: 'line',
                          mode: 'lines',
                          name: chartMeta[type].name,
                          line: { color: chartMeta[type].color },
                        }))
                      }
                    // {u
                    //     x: timeState,
                    //     y: edaState,
                    //     xaxis: 'x2',
                    //     yaxis: 'y2',
                    //     mode: 'lines+markers',          // Line chart
                    //     type: 'line',
                    //     name: 'EDA', // Label for the trace
                    //     line: {color: 'rgb(75,0,130)'} // Line color
                    // }
                    layout = {{
                        autosize: true,
                        responsive: true,
                        width: 700,
                        height: 350,
                        margin: {l:40, r: 10, b: 40, t: 10},
                        yaxis: {
                            title: "Sensor Values",
                            range: [min, max + 5],
                            tick: 1,
                        },
                        showlegend: true,
                    }}
                    config={{
                        displayModeBar: false 
                      }}

                    useResizeHandler={true}
                    style ={{ width: "100%", height: "100%"}}
                />
            </div> 
        </div>
    );
}