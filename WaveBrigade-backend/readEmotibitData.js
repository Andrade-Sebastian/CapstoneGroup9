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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var brainflow_1 = require("brainflow");
var Papa = require("papaparse");
var fs = require("fs");
var socket_io_client_1 = require("socket.io-client");
var socket = (0, socket_io_client_1.io)('http://localhost:3000');
var deviceIP = process.argv[2];
var deviceSerial = process.argv[3];
// const backendIP = process.argv[4];
// const hostSessionID = process.argv[5];
function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}
//function to write headers that represent the data to the csv
function writeHeaderstoCSV(FilePath, Headers) {
    var headers = Headers.join('\t') + '\n'; //need to specify that the list is a string joined by tabs since that is the delimiter
    var writeStream = fs.createWriteStream(FilePath);
    writeStream.write(headers);
    writeStream.end();
}
var ancHeaders = ['Package', 'EDA', 'Temperature', 'Thermistor', 'Timestamp', 'Unknown']; //create a list of headers for the csv
var ancFilePath = './anc_from_streamer.csv';
writeHeaderstoCSV(ancFilePath, ancHeaders);
var auxHeaders = ['Package', 'PPG_Red', 'PPG_Infa_Red', 'PPG_Green', 'Timestamp', 'Unknown'];
var auxFilePath = './aux_from_streamer.csv';
writeHeaderstoCSV(auxFilePath, auxHeaders);
var ancCSV = fs.createReadStream(ancFilePath);
var auxCSV = fs.createReadStream(auxFilePath);
// const currentDate = new Date('2024-12-3');
// const currentTime = currentDate.getTime();
// const passedDate = new Date();
console.log(process.argv);
function runBrainflow(deviceIPAddress, serialNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var board, board_id, presets, data_current, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    //const params = new BrainFlowInputParams({ipAddress: deviceIPAddress, serialNumber: serialNumber});
                    console.log("COMMAND LINE ARGUMENTS PASSED IN:" + deviceIPAddress + serialNumber);
                    board = new brainflow_1.BoardShim(brainflow_1.BoardIds.EMOTIBIT_BOARD, { ipAddress: deviceIPAddress, serialNumber: serialNumber });
                    board_id = brainflow_1.BoardIds.EMOTIBIT_BOARD;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 9]);
                    board.prepareSession();
                    presets = brainflow_1.BoardShim.getBoardPresets(board_id);
                    console.log();
                    board.addStreamer("file://aux_from_streamer.csv:a", brainflow_1.BrainFlowPresets.AUXILIARY_PRESET);
                    board.addStreamer("file://anc_from_streamer.csv:a", brainflow_1.BrainFlowPresets.ANCILLARY_PRESET);
                    board.startStream();
                    _a.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 5];
                    data_current = board.getBoardData(500, brainflow_1.BrainFlowPresets.ANCILLARY_PRESET);
                    if (!(data_current.length !== 0)) return [3 /*break*/, 4];
                    data = {
                        package: data_current[0][0],
                        data1: data_current[1][0],
                        data2: data_current[2][0],
                        data3: data_current[3][0],
                        timestamp: data_current[4][0],
                        unknown: data_current[5][0],
                    };
                    console.log("DATA :" + data.data1);
                    socket.emit('update', data);
                    return [4 /*yield*/, sleep(1000)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 9];
                case 6:
                    error_1 = _a.sent();
                    console.error(error_1);
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, sleep(3000)];
                case 8:
                    _a.sent();
                    board.stopStream();
                    board.releaseSession();
                    parseData(ancCSV);
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
//to find which channel each data is on
//const channel_number = BoardShim.getPpgChannels(board_id, BrainFlowPresets.AUXILIARY_PRESET);
//console.info(channel_number);
//used to display info about the board and to see how the current data is stored
/*console.info("Description");
console.info(BoardShim.getBoardDescr(BoardIds.EMOTIBIT_BOARD));
console.info('Data');
console.info(data_current);*/
function parseData(file) {
    Papa.parse(file, {
        header: true,
        delimiter: '\t',
        dynamicTyping: true,
        complete: function () {
            console.log("Finished parsing data");
        },
        step: function (results) {
            console.log("Row data:", results.data);
        },
    });
}
runBrainflow(deviceIP, deviceSerial);
