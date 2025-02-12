/*
Author: Haley Marquez
Description: Connects to the EmotiBit and collects data utilizing Brainflow's library 
Sends collected data to the backend for manipulation

*/

import { BoardIds, BoardShim, BrainFlowInputParams, BrainFlowPresets} from 'brainflow';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import { io, Socket } from 'socket.io-client';
import {exit} from "node:process";


//passed in from electron
const operationParameters = {
    ipAddress: process.argv[2],
    serialNumber: process.argv[3],
    backendIp: process.argv[4],
    hostSessionId: process.argv[5],
    userId: process.argv[6],
    frontEndSocketId: process.argv[7],
    assignSocketId: null
}

const ancHeaders = ['Package', 'EDA', 'Temperature', 'Thermistor', 'Timestamp', 'Unknown']; //create a list of headers for the csv
// const ancFilePath = './anc_from_streamer.csv';
// const auxHeaders = ['Package', 'PPG_Red', 'PPG_Infa_Red', 'PPG_Green', 'Timestamp', 'Unknown'];
// const auxFilePath = './aux_from_streamer.csv';

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
    try{
    
        while(true){
            // const passedTime = passedDate.getTime();
            // console.log("CURRENT: " + currentTime);
            // console.log("PASSED: " + passedTime);
            const data_current = board.getBoardData(500, BrainFlowPresets.ANCILLARY_PRESET);
            if(data_current.length !== 0){ //doesn't log data if it is empty
                const data = {
                    package: data_current[0][0],
                    data1: data_current[1][0],
                    data2: data_current[2][0],
                    data3: data_current[3][0],
                    timestamp: data_current[4][0],
                    unknown: data_current[5][0],
                };
                console.log("DATA :" + data.data1);
                //emit to socket an object that holds data and op parameters
                socket.emit('update', {
                    data: data,
                    ...operationParameters
                });
                await sleep(1000);
            }
    }}
    catch(error){
        console.error(error);
    }
    finally{
        await sleep (3000);
        board.stopStream();
        board.releaseSession();
        // parseData(ancCSV);
    }
}

async function main(): Promise<string>{
    let connectionSuccessful: null | string = null;
    const socket = io(`http://localhost:3000`);
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
        prepareBoard();
        sendData(operationParameters.assignSocketId);
    }

    return "0"; 
}

main();