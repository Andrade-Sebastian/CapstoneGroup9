import { BoardIds, BoardShim, BrainFlowInputParams, BrainFlowPresets} from 'brainflow';
import Papa from 'papaparse';
import * as fs from 'fs';

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
const Headers = ['Package', 'EDA', 'Temperature', 'Thermistor', 'Timestamp', 'Unkown'].join('\t') + '\n';
const FilePath = '/Users/haley/Capstone_2024/CapstoneGroup9/WaveBrigade-backend/anc_from_streamer.csv';
const writeStream = fs.createWriteStream(FilePath);
writeStream.write(Headers);
writeStream.close();

//const params = new BrainFlowInputParams();
const board = new BoardShim(BoardIds.EMOTIBIT_BOARD, {});
const board_id = BoardIds.EMOTIBIT_BOARD;
const csv = fs.createReadStream('/Users/haley/Capstone_2024/CapstoneGroup9/WaveBrigade-backend/anc_from_streamer.csv');

async function runExample (): Promise<void>
{
    
    
    board.prepareSession();
    const presets = BoardShim.getBoardPresets(board_id);
    
    //board.addStreamer("file://aux_from_streamer.csv:w", BrainFlowPresets.AUXILIARY_PRESET);
    board.addStreamer("file://anc_from_streamer.csv:a", BrainFlowPresets.ANCILLARY_PRESET);
    board.startStream();
    await sleep (3000);
    board.stopStream();

    const data_current = board.getBoardData(100, BrainFlowPresets.ANCILLARY_PRESET);

    //to find which channel each data is on
    //const channel_number = BoardShim.getPpgChannels(board_id, BrainFlowPresets.AUXILIARY_PRESET);
    board.releaseSession();

    //console.info(channel_number);
    console.info("Description");
    console.info(BoardShim.getBoardDescr(BoardIds.EMOTIBIT_BOARD));
    console.info('Data');
    console.info(data_current);

    Papa.parse<ancData>(csv, {
        header: true,
        delimiter: '\t',
        dynamicTyping: true,
          
        complete: () => {
            console.log("Finished parsing");
        },
        step: (results) => {
          console.log("Row data:", results.data);
        },
        });
}

runExample();

