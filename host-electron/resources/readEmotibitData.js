"use strict";
/*
Author: Haley Marquez
Description: Connects to the EmotiBit and collects data utilizing Brainflow's library
Sends collected data to the backend for manipulation

*/
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var socket_io_client_1 = require("socket.io-client");
//passed in from electron
var operationParameters = {
    ipAddress: process.argv[2],
    serialNumber: process.argv[3],
    backendIp: process.argv[4],
    userId: process.argv[5],
    frontEndSocketId: process.argv[6],
    sessionId: process.argv[7],
    assignSocketId: null
};
var ancHeaders = ['Package', 'EDA', 'Temperature', 'Thermistor', 'Timestamp', 'Unknown']; //create a list of headers for the csv
// const ancFilePath = './operationParameters.userId/anc_data.csv';
// const auxHeaders = ['Package', 'PPG_Red', 'PPG_Infa_Red', 'PPG_Green', 'Timestamp', 'Unknown'];
// const auxFilePath = './operationParameters.userId/aux_data.csv';
// const auxFilePath = './operationParameters.userId/aux_data.csv';
//initializes the board 
var board = new brainflow_1.BoardShim(brainflow_1.BoardIds.EMOTIBIT_BOARD, { serialNumber: operationParameters.serialNumber });
var board_id = brainflow_1.BoardIds.EMOTIBIT_BOARD;
function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
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
function requestSocketID(socket) {
    //avoids race condition with socketId
    return new Promise(function (resolve, reject) {
        socket.emit('brainflow-assignment');
        console.log("Emitting brainflow-assignment");
        socket.on('brainflow-assignment', function (messageObject) {
            operationParameters.assignSocketId = messageObject.socketId;
            console.log("Message object ", JSON.stringify(messageObject));
        });
        setTimeout(function () {
            //console.log("In timeout")
            resolve(JSON.stringify(operationParameters.assignSocketId));
        }, 2000);
    });
}
//preapres emotibit to start collecting data
function prepareBoard() {
    board.prepareSession();
    var presets = brainflow_1.BoardShim.getBoardPresets(board_id);
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
function sendData(socket) {
    return __awaiter(this, void 0, void 0, function () {
        var ancData, auxData, heart_rate, ppg_ir, ppg_r, anc_data, aux_data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ancData = {
                        package: 0,
                        data1: 0,
                        data2: 0,
                        data3: 0,
                        timestamp: 0,
                        unknown: 0,
                    };
                    auxData = {
                        package: 0,
                        data1: 0,
                        data2: 0,
                        data3: 0,
                        timestamp: 0,
                        unknown: 0,
                    };
                    heart_rate = 0;
                    ppg_ir = [];
                    ppg_r = [];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, 6, 8]);
                    prepareBoard();
                    successfulLaunch(socket);
                    board.startStream();
                    _a.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 4];
                    anc_data = board.getBoardData(500, brainflow_1.BrainFlowPresets.ANCILLARY_PRESET);
                    aux_data = board.getBoardData(500, brainflow_1.BrainFlowPresets.AUXILIARY_PRESET);
                    if (anc_data.length !== 0) { //doesn't log data if it is empty
                        ppg_ir = ppg_ir.concat(anc_data[2]);
                        ppg_r = ppg_r.concat(anc_data[1]);
                        //heart rate can only start collecting if there are enough data samples
                        if (ppg_ir.length >= 1024 && ppg_r.length >= 1024) {
                            brainflow_1.DataFilter.performBandPass(ppg_ir, 500, 5, 10, 2, 0, 0);
                            brainflow_1.DataFilter.performBandPass(ppg_r, 500, 5, 10, 2, 0, 0);
                            heart_rate = brainflow_1.DataFilter.getHeartRate(ppg_ir.slice(-1024), ppg_r.slice(-1024), 500, 1024);
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
                    }
                    ;
                    if (aux_data.length !== 0) {
                        auxData = {
                            package: aux_data[0][0],
                            data1: aux_data[1][0],
                            data2: aux_data[2][0],
                            data3: aux_data[3][0],
                            timestamp: aux_data[4][0],
                            unknown: aux_data[5][0],
                        };
                    }
                    ;
                    //emit to socket an object that holds data and op parameters
                    socket.emit('update', __assign({ ancData: ancData, auxData: auxData, heartRate: heart_rate }, operationParameters));
                    return [4 /*yield*/, sleep(200)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 2];
                case 4: return [3 /*break*/, 8];
                case 5:
                    error_1 = _a.sent();
                    console.error(error_1);
                    console.log("An error in brainflow has occured: ", error_1.exitCode);
                    process.exit(error_1.exitCode);
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, sleep(3000)];
                case 7:
                    _a.sent();
                    board.stopStream();
                    board.releaseSession();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function successfulLaunch(socket) {
    console.log("Brainflow has launched successfully");
    socket.emit("successful-brainflow-launch", socket.id);
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var connectionSuccessful, socket, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    connectionSuccessful = null;
                    socket = (0, socket_io_client_1.io)(operationParameters.backendIp);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, requestSocketID(socket)];
                case 2:
                    connectionSuccessful = _a.sent();
                    console.log("Stored SocketID:", operationParameters.assignSocketId);
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error fetching SocketID: ", error_2);
                    return [3 /*break*/, 4];
                case 4:
                    //ensures only a valid socket connection before attempting to connect to emotibit
                    if (connectionSuccessful) {
                        // writeHeaderstoCSV(ancFilePath, ancHeaders);
                        // writeHeaderstoCSV(auxFilePath, auxHeaders);
                        // prepareBoard();
                        sendData(socket);
                    }
                    return [2 /*return*/, 0];
            }
        });
    });
}
main();
