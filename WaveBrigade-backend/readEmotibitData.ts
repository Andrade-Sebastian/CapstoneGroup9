import { BoardIds, BoardShim, BrainFlowInputParams, BrainFlowPresets} from 'brainflow';
import * as Papa from 'papaparse';
import * as fs from 'fs';
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');

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
interface ancData {
    package: number;
    eda: number;
    temperature: number;
    thermistor: number;
    timestamp: number;
    unknown: number;
}

interface auxData {
    package: number;
    ppgR: number;
    ppgI: number;
    ppgG: number;
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



async function runExample (): Promise<void>
{

     // Send data to the client every 100ms
     const interval = setInterval(() => {
        console.log("in interval")
        const data = {
        timestamp: new Date().toISOString(),
        randomValue: Math.random(),
        };
        socket.emit('update', data);
    }, 100);
    
    board.prepareSession();
    const presets = BoardShim.getBoardPresets(board_id);
    
    board.addStreamer("file://aux_from_streamer.csv:a", BrainFlowPresets.AUXILIARY_PRESET);
    board.addStreamer("file://anc_from_streamer.csv:a", BrainFlowPresets.ANCILLARY_PRESET);
    board.startStream();
    await sleep (3000);
    board.stopStream();

    const data_current = board.getBoardData(100, BrainFlowPresets.ANCILLARY_PRESET);

    //to find which channel each data is on
    //const channel_number = BoardShim.getPpgChannels(board_id, BrainFlowPresets.AUXILIARY_PRESET);
    board.releaseSession();

    //console.info(channel_number);
    //used to display info about the board and to see how the current data is stored
    /*console.info("Description");
    console.info(BoardShim.getBoardDescr(BoardIds.EMOTIBIT_BOARD));
    console.info('Data');
    console.info(data_current);*/

    Papa.parse<ancData>(ancCSV, {
        header: true,
        delimiter: '\t',
        dynamicTyping: true,
          
        complete: () => {
            console.log("Finished parsing ANC data");
        },
        step: (results) => {
          console.log("Row data:", results.data);
        },
        }
    );

    Papa.parse<auxData>(auxCSV, {
        header: true,
        delimiter: '\t',
        dynamicTyping: true,
          
        complete: () => {
            console.log("Finished parsing AUX data");
        },
        step: (results) => {
          console.log("Row data:", results.data);
        },
        }
    );
}

runExample();

