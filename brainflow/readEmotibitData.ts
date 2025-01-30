import { BoardIds, BoardShim, BrainFlowInputParams, BrainFlowPresets} from 'brainflow';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');

//is initialized flag for socket id 
//gets it from backend

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

const ancHeaders = ['Package', 'EDA', 'Temperature', 'Thermistor', 'Timestamp', 'Unknown']; //create a list of headers for the csv
const ancFilePath = './anc_from_streamer.csv';
writeHeaderstoCSV(ancFilePath, ancHeaders);

const auxHeaders = ['Package', 'PPG_Red', 'PPG_Infa_Red', 'PPG_Green', 'Timestamp', 'Unknown'];
const auxFilePath = './aux_from_streamer.csv';
writeHeaderstoCSV(auxFilePath, auxHeaders);

//const params = new BrainFlowInputParams();
const board = new BoardShim(BoardIds.EMOTIBIT_BOARD, {});
const board_id = BoardIds.EMOTIBIT_BOARD;
const ancCSV = fs.createReadStream(ancFilePath);
const auxCSV = fs.createReadStream(auxFilePath);

const currentDate = new Date('2024-12-3');
const currentTime = currentDate.getTime();
const passedDate = new Date();



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
            // console.log(data_current[0][2]);
            // const interval = setInterval(() => {
            //     console.log("in interval")
            //     const data = {
            //     timestamp: data_current[0][1],
            //     randomValue: Math.random(),
            //     };
            //     socket.emit('update', data);
            // }, 100);
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

runExample();