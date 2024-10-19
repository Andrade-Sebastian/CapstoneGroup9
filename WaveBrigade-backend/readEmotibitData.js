"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const brainflow_1 = require("brainflow");
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
//const params = new BrainFlowInputParams();
const board = new brainflow_1.BoardShim(brainflow_1.BoardIds.EMOTIBIT_BOARD, {});
const board_id = brainflow_1.BoardIds.EMOTIBIT_BOARD;
function runExample() {
    return __awaiter(this, void 0, void 0, function* () {
        board.prepareSession();
        // board.addStreamer("file://aux_from_streamer.csv:w", BrainFlowPresets.AUXILIARY_PRESET);
        // board.addStreamer("file://mag_from_streamer.csv:w", BrainFlowPresets.DEFAULT_PRESET);
        board.addStreamer("file://temp_from_streamer.csv:w", brainflow_1.BrainFlowPresets.ANCILLARY_PRESET);
        board.startStream();
        yield sleep(3000);
        board.stopStream();
        //const data = board.getBoardData();
        // const data_aux = board.getBoardData(100, BrainFlowPresets.AUXILIARY_PRESET);
        //const data_eeg = BoardShim.getMagnetometerChannels(board_id, BrainFlowPresets.DEFAULT_PRESET);
        const data_current = board.getBoardData(100, brainflow_1.BrainFlowPresets.ANCILLARY_PRESET);
        const data_temp = brainflow_1.BoardShim.getTemperatureChannels(board_id, brainflow_1.BrainFlowPresets.ANCILLARY_PRESET);
        board.releaseSession();
        console.info(brainflow_1.BoardShim.getDeviceName(board_id));
        console.info("Description");
        console.info(brainflow_1.BoardShim.getBoardDescr(brainflow_1.BoardIds.EMOTIBIT_BOARD));
        console.info('Data');
        //console.info(data);
        console.info(data_current);
        /* const csvContent = data_aux.map(row => row.join(',')).join('\n');
         fs.writeFileSync("aux.csv", csvContent);*/
    });
}
runExample();
