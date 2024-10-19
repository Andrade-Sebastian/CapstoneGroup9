import { BoardIds, BoardShim, BrainFlowInputParams, BrainFlowPresets} from 'brainflow';

function sleep(ms: number)
{
    return new Promise ((resolve) => 
    { setTimeout (resolve, ms); 
    });
}

//const params = new BrainFlowInputParams();
const board = new BoardShim(BoardIds.EMOTIBIT_BOARD, {});
const board_id = BoardIds.EMOTIBIT_BOARD;


async function runExample (): Promise<void>
{
    
    
    board.prepareSession();
   // board.addStreamer("file://aux_from_streamer.csv:w", BrainFlowPresets.AUXILIARY_PRESET);
   // board.addStreamer("file://mag_from_streamer.csv:w", BrainFlowPresets.DEFAULT_PRESET);
    board.addStreamer("file://temp_from_streamer.csv:w", BrainFlowPresets.ANCILLARY_PRESET);
    board.startStream();
    await sleep (3000);
    board.stopStream();
    //const data = board.getBoardData();
   // const data_aux = board.getBoardData(100, BrainFlowPresets.AUXILIARY_PRESET);
    //const data_eeg = BoardShim.getMagnetometerChannels(board_id, BrainFlowPresets.DEFAULT_PRESET);
    const data_current = board.getBoardData(100, BrainFlowPresets.ANCILLARY_PRESET);
    const data_temp = BoardShim.getTemperatureChannels(board_id, BrainFlowPresets.ANCILLARY_PRESET);
    board.releaseSession();
    console.info(BoardShim.getDeviceName(board_id));
    console.info("Description");
    console.info(BoardShim.getBoardDescr(BoardIds.EMOTIBIT_BOARD));
    console.info('Data');
    //console.info(data);
    console.info(data_current);
   /* const csvContent = data_aux.map(row => row.join(',')).join('\n');
    fs.writeFileSync("aux.csv", csvContent);*/
}

runExample();

