/*
Author: Haley Marquez
Date: 
Description:

*/

import { BoardIds, BoardShim, BrainFlowInputParams, BrainFlowPresets} from 'brainflow';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import { io, Socket } from 'socket.io-client';
import { dbClient } from '../WaveBrigade-backend/server/src/controllers/database.ts'


//passed in from electron
const operationParameters = {
    ipAddress: process.argv[2],
    serialNumber: process.argv[3],
    backendIp: 'http://localhost:3000',
    hostSessionId: process.argv[5],
    userId: 1,
    assignSocketId: null,
}

const ancHeaders = ['Package', 'EDA', 'Temperature', 'Thermistor', 'Timestamp', 'Unknown']; //create a list of headers for the csv
const ancFilePath = './anc_from_streamer.csv';
const auxHeaders = ['Package', 'PPG_Red', 'PPG_Infa_Red', 'PPG_Green', 'Timestamp', 'Unknown'];
const auxFilePath = './aux_from_streamer.csv';
//const params = new BrainFlowInputParams();
const board = new BoardShim(BoardIds.EMOTIBIT_BOARD, {});
const board_id = BoardIds.EMOTIBIT_BOARD;
const ancCSV = fs.createReadStream(ancFilePath);
const auxCSV = fs.createReadStream(auxFilePath);

const currentDate = new Date('2024-12-3');
const currentTime = currentDate.getTime();
const passedDate = new Date();

function sleep(ms: number)
{
    return new Promise ((resolve) => 
    { setTimeout (resolve, ms); 
    });
}

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

//function to write headers that represent the data to the csv
function writeHeaderstoCSV(FilePath: string, Headers: string[]){
    const headers = Headers.join('\t') + '\n'; //need to specify that the list is a string joined by tabs since that is the delimiter
    const writeStream = fs.createWriteStream(FilePath);
    writeStream.write(headers);
    writeStream.end();
}

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

async function retrieveUserSocketID(userId: string){
    let id = parseInt(userId);
    try{
        await dbClient.connect();
        const result = dbClient.queryObject(`SELECT sessionid FROM "Users" WHERE userid = ${id}`);
        console.log(result);
    }
    finally {
    // Release the connection back into the pool
        await dbClient.end();
    }

}

function parseData(file){
    Papa.parse<bioData>(file, {
        header: true,
        delimiter: '\t',
        dynamicTyping: true,
          
        complete: () => {
            console.log("Finished parsing data");
        },
        step: (results) => {
          console.log("Row data:", results.data);
        },
        }
    );
}


async function main(): Promise<string>{
    let connectionSuccessful = false;
    const socket = io(`${operationParameters.backendIp}`);
    try{
        await requestSocketID(socket);
        console.log("Stored SocketID:", operationParameters.assignSocketId);
        connectionSuccessful = true;
    } 
    catch (error){
        console.error("Error fetching SocketID: ", error);
    }

    if(connectionSuccessful){
        retrieveUserSocketID(operationParameters.userId);
        writeHeaderstoCSV(ancFilePath, ancHeaders);
        writeHeaderstoCSV(auxFilePath, auxHeaders);
    }

    return "0"; 
}

async function runExample (): Promise<void>
{
    try{
        board.prepareSession();
        const presets = BoardShim.getBoardPresets(board_id);
        board.addStreamer("file://aux_from_streamer.csv:a", BrainFlowPresets.AUXILIARY_PRESET);
        board.addStreamer("file://anc_from_streamer.csv:a", BrainFlowPresets.ANCILLARY_PRESET);
        board.startStream();
        
    
    while(true){
        // const passedTime = passedDate.getTime();
        // console.log("CURRENT: " + currentTime);
        // console.log("PASSED: " + passedTime);
        const data_current = board.getBoardData(500, BrainFlowPresets.ANCILLARY_PRESET);
        if(data_current.length !== 0){ //doesn't log data if it is empty
            // console.log(data_current);
            // console.log(data_current[1][0]);
            const data = {
                package: data_current[0][0],
                data1: data_current[1][0],
                data2: data_current[2][0],
                data3: data_current[3][0],
                timestamp: data_current[4][0],
                unknown: data_current[5][0],
            };
            console.log("DATA :" + data.data1);
            socket.emit('update', data);
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
        parseData(ancCSV);
    }
}
    

    //to find which channel each data is on
    //const channel_number = BoardShim.getPpgChannels(board_id, BrainFlowPresets.AUXILIARY_PRESET);
    

    //console.info(channel_number);
    //used to display info about the board and to see how the current data is stored
    /*console.info("Description");
    console.info(BoardShim.getBoardDescr(BoardIds.EMOTIBIT_BOARD));
    console.info('Data');
    console.info(data_current);*/

main();