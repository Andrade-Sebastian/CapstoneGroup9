/*
Author: Haley Marquez
Description: Connects to the EmotiBit and collects data utilizing Brainflow's library 
Sends collected data to the backend for manipulation

*/

import { BoardIds, BoardShim, BrainFlowInputParams, BrainFlowPresets, DataFilter} from 'brainflow';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import { io, Socket } from 'socket.io-client';
import {exit} from "node:process";


//passed in from electron
const operationParameters = {
    ipAddress: process.argv[2],
    serialNumber: process.argv[3],
    backendIp: process.argv[4],
    userId: process.argv[5],
    frontEndSocketId: process.argv[6],
    sessionId: process.argv[7],
    assignSocketId: null
}

const ancHeaders = ['Package', 'EDA', 'Temperature', 'Thermistor', 'Timestamp', 'Unknown']; //create a list of headers for the csv
// const ancFilePath = './operationParameters.userId/anc_data.csv';
// const auxHeaders = ['Package', 'PPG_Red', 'PPG_Infa_Red', 'PPG_Green', 'Timestamp', 'Unknown'];
// const auxFilePath = './operationParameters.userId/aux_data.csv';

//initializes the board 
const board = new BoardShim(BoardIds.EMOTIBIT_BOARD, {});
const board_id = BoardIds.EMOTIBIT_BOARD;

//prepares files to be written to
// const ancCSV = fs.createReadStream(ancFilePath);
// const auxCSV = fs.createReadStream(auxFilePath);

// const currentDate = new Date('2024-12-3');
// const currentTime = currentDate.getTime();
// const passedDate = new Date();

/*
Channels
ANCILLARY
[1] EDA
[2] Temperature
[3] Thermistor 
[4] Timestamp

AUXILIARY
[1] PPG_R
[2] PPG_I
[3] PPG_G
[4] Timestamp
 */

//interfaces to specify what each column header represents
interface bioData {
    package: number;
    data1: number;
    data2: number;
    data3: number;
    timestamp: number;
    unknown: number;
}


function sleep(ms: number)
{
    return new Promise ((resolve) => 
    { setTimeout (resolve, ms); 
    });
}

//function to write headers that represent the data to the csv
// function writeHeaderstoCSV(FilePath: string, Headers: string[]){
//     const headers = Headers.join('\t') + '\n'; //need to specify that the list is a string joined by tabs since that is the delimiter
//     const writeStream = fs.createWriteStream(FilePath);
//     writeStream.write(headers);
//     writeStream.end();
// }

//request the socket id in order to emit back to backend
function requestSocketID(socket: Socket): Promise<string> 
{
    //avoids race condition with socketId
    return new Promise((resolve, reject) => 
        {
            socket.emit('brainflow-assignment');
            console.log("Emitting brainflow-assignment");
            socket.on('brainflow-assignment', (messageObject) => {
                operationParameters.assignSocketId = messageObject.socketId;
                console.log("Message object ", JSON.stringify(messageObject));
            });
            setTimeout(() => {
                //console.log("In timeout")
                resolve(JSON.stringify(operationParameters.assignSocketId))
                }, 2000);    
        })
}

//preapres emotibit to start collecting data
function prepareBoard(){
    board.prepareSession();
    const presets = BoardShim.getBoardPresets(board_id);
    // board.addStreamer("file://aux_from_streamer.csv:a", BrainFlowPresets.AUXILIARY_PRESET);
    // board.addStreamer("file://anc_from_streamer.csv:a", BrainFlowPresets.ANCILLARY_PRESET);
}

//parses data for the csv files
// function parseData(file){
//     Papa.parse<bioData>(file, {
//         header: true,
//         delimiter: '\t',
//         dynamicTyping: true,
          
//         complete: () => {
//             console.log("Finished parsing data");
//         },
//         step: (results) => {
//           console.log("Row data:", results.data);
//         },
//         }
//     );
// }

//given the back end socket, emit data from emotibit
//sends data and operation parameters to backend socket
async function sendData(socket: Socket): Promise<void>
{
    let ancData = {
        package: 0,
        data1: 0,
        data2: 0,
        data3: 0,
        timestamp: 0,
        unknown: 0,
    };

    let auxData = {
        package: 0,
        data1: 0,
        data2: 0,
        data3: 0,
        timestamp: 0,
        unknown: 0,
    }; 

    let heart_rate = 0;

    let ppg_ir: number[] = [];
    let ppg_r: number[] = [];

    try{
        prepareBoard();
        successfulLaunch(socket);
        board.startStream();
        while(true){
            
            // const passedTime = passedDate.getTime();
            // console.log("CURRENT: " + currentTime);
            // console.log("PASSED: " + passedTime);
            const anc_data = board.getBoardData(500, BrainFlowPresets.ANCILLARY_PRESET);
            const aux_data = board.getBoardData(500, BrainFlowPresets.AUXILIARY_PRESET);

            if(anc_data.length !== 0){ //doesn't log data if it is empty
                ppg_ir = ppg_ir.concat(anc_data[2]);
                ppg_r = ppg_r.concat(anc_data[1]);
                
                //heart rate can only start collecting if there are enough data samples
                if(ppg_ir.length >= 1024 && ppg_r.length >= 1024){
                   DataFilter.performBandPass(ppg_ir, 500, 5, 10, 2, 0, 0);
                   DataFilter.performBandPass(ppg_r, 500, 5, 10, 2, 0, 0);
        
                    heart_rate = DataFilter.getHeartRate(ppg_ir.slice(-1024), ppg_r.slice(-1024), 500, 1024);
                    console.log("HEART RATE: ", heart_rate);
                }
                
                ancData = {
                    package: anc_data[0][0],
                    data1: anc_data[1][0],
                    data2: anc_data[2][0],
                    data3: anc_data[3][0],
                    timestamp: anc_data[4][0],
                    unknown: anc_data[5][0],
                };
            };
            if(aux_data.length !== 0){
                    auxData = {
                        package: aux_data[0][0],
                        data1: aux_data[1][0],
                        data2: aux_data[2][0],
                        data3: aux_data[3][0],
                        timestamp: aux_data[4][0],
                        unknown: aux_data[5][0],
                    };
            };
            
                //emit to socket an object that holds data and op parameters
                socket.emit('update', {
                    ancData: ancData,
                    auxData: auxData,
                    heartRate: heart_rate,
                    ...operationParameters
                });
                await sleep(200);
            }
    }
    catch(error){
        console.error(error);
        console.log("An error in brainflow has occured: ", error.exitCode);
        process.exit(error.exitCode);
    }
    finally{
        await sleep (3000);
        board.stopStream();
        board.releaseSession();
        // parseData(ancCSV);
    }
}

function successfulLaunch(socket: Socket){
    console.log("Brainflow has launched successfully");
    socket.emit("successful-brainflow-launch", socket.id);
}

async function main(): Promise<number>{
    let connectionSuccessful: null | string = null;
    const socket = io(operationParameters.backendIp);
    try{
       connectionSuccessful = await requestSocketID(socket);
        console.log("Stored SocketID:", operationParameters.assignSocketId);
    } 
    catch (error){
        console.error("Error fetching SocketID: ", error);
    }

    //ensures only a valid socket connection before attempting to connect to emotibit
    if(connectionSuccessful){
        // writeHeaderstoCSV(ancFilePath, ancHeaders);
        // writeHeaderstoCSV(auxFilePath, auxHeaders);
       // prepareBoard();
        sendData(socket);
    }

    return 0; 
}

main();