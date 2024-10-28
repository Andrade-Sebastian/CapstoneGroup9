"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const brainflow_1 = require("brainflow");
const papaparse_1 = __importDefault(require("papaparse"));
const fs = __importStar(require("fs"));
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function writeHeaderstoCSV(FilePath, Headers) {
    const headers = Headers.join('\t') + '\n';
    const writeStream = fs.createWriteStream(FilePath);
    writeStream.write(headers);
    writeStream.end();
}
const ancHeaders = ['Package', 'EDA', 'Temperature', 'Thermistor', 'Timestamp', 'Unknown'];
const ancFilePath = '/Users/haley/Capstone_2024/CapstoneGroup9/WaveBrigade-backend/anc_from_streamer.csv';
writeHeaderstoCSV(ancFilePath, ancHeaders);
const auxHeaders = ['Package', 'PPG_Red', 'PPG_Infa_Red', 'PPG_Green', 'Timestamp', 'Unknown'];
const auxFilePath = '/Users/haley/Capstone_2024/CapstoneGroup9/WaveBrigade-backend/aux_from_streamer.csv';
writeHeaderstoCSV(auxFilePath, auxHeaders);
//const params = new BrainFlowInputParams();
const board = new brainflow_1.BoardShim(brainflow_1.BoardIds.EMOTIBIT_BOARD, {});
const board_id = brainflow_1.BoardIds.EMOTIBIT_BOARD;
const ancCSV = fs.createReadStream('/Users/haley/Capstone_2024/CapstoneGroup9/WaveBrigade-backend/anc_from_streamer.csv');
const auxCSV = fs.createReadStream('/Users/haley/Capstone_2024/CapstoneGroup9/WaveBrigade-backend/aux_from_streamer.csv');
function runExample() {
    return __awaiter(this, void 0, void 0, function* () {
        board.prepareSession();
        const presets = brainflow_1.BoardShim.getBoardPresets(board_id);
        board.addStreamer("file://aux_from_streamer.csv:a", brainflow_1.BrainFlowPresets.AUXILIARY_PRESET);
        board.addStreamer("file://anc_from_streamer.csv:a", brainflow_1.BrainFlowPresets.ANCILLARY_PRESET);
        board.startStream();
        yield sleep(3000);
        board.stopStream();
        const data_current = board.getBoardData(100, brainflow_1.BrainFlowPresets.ANCILLARY_PRESET);
        //to find which channel each data is on
        //const channel_number = BoardShim.getPpgChannels(board_id, BrainFlowPresets.AUXILIARY_PRESET);
        board.releaseSession();
        //console.info(channel_number);
        console.info("Description");
        console.info(brainflow_1.BoardShim.getBoardDescr(brainflow_1.BoardIds.EMOTIBIT_BOARD));
        console.info('Data');
        console.info(data_current);
        papaparse_1.default.parse(ancCSV, {
            header: true,
            delimiter: '\t',
            dynamicTyping: true,
            complete: () => {
                console.log("Finished parsing ANC data");
            },
            step: (results) => {
                console.log("Row data:", results.data);
            },
        });
        papaparse_1.default.parse(auxCSV, {
            header: true,
            delimiter: '\t',
            dynamicTyping: true,
            complete: () => {
                console.log("Finished parsing AUX data");
            },
            step: (results) => {
                console.log("Row data:", results.data);
            },
        });
    });
}
runExample();
