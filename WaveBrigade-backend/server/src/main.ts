const PORT = 3000;
const ORIGIN = "http://localhost:5173";
import grpc from "npm:@grpc/grpc-js";
import socketSessionMap, { getSessionBySocket, removeSocket } from "./sessionMappings.ts";
import axios from "axios";

//CHANGE TO RELATIVE PATH
const PROTO_PATH = "./server/src/grpc/protos/emotiBits.proto";
import * as protoLoader from "npm:@grpc/proto-loader";

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};
  
var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
  
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const emotiBits = protoDescriptor.emotiBits.findDevices;

export const client = new emotiBits("localhost:50051", grpc.credentials.createInsecure());

import express from "npm:express@^4.17.1";
import cors from "npm:cors";
import { Server } from "npm:socket.io@^4.8.1";
import { createServer } from "node:http";
import hostRouter from "./routes/host_routes.ts"
import joinerRouter from "./routes/joiner_routes.ts"
import session_handlers from "./handlers/session_handlers.ts";
import experimentRouter from "./routes/experiment_routes.ts";

const app = express();
const server = createServer(app);

app.use(cors());
//app.use(cors({origin: ORIGIN}));
app.use("/host", hostRouter); 
app.use("/joiner", joinerRouter); 
app.use("/experiment", experimentRouter);


export const io = new Server(server, {
    cors: {
        origin: ORIGIN,
    },
});

const rooms: { [key: string]: any} = {};
const currentSessions: { [key: string]: ISession } = {};
const sessionNamespace = io.of("/session");
let isHost = true;


io.on("connection", (socket) => {
    console.log("(main.ts): User Connected | socketID: " + socket.id)
    console.log(`(main.ts): Total connections: ${io.engine.clientsCount}`);

    socket.on("client-assignment", () => {
        console.log("(main.ts): Emitting client-assignment with socketId:", socket.id);
        socket.emit("client-assignment", {socketId: socket.id});
    }); // Send socket ID to the client

    //recieve emotibit data
    socket.on('update', (data) => {
       // console.log('Received data:', data);
    });

    session_handlers(io, socket, rooms, isHost);

    //console.log("Running Script");
    socket.on("update", (data) => {
        console.log(data);
        io.emit("update", data);
    })
    
    socket.on("disconnect", async (data) => {
        console.log(`(main.ts): User Disconnected | socketID: ${socket.id}`);
        console.log(`(main.ts): Total connections: ${io.engine.clientsCount}`);


        const sessionID = getSessionBySocket(socket.id);

        if (sessionID) {
            try {
                const response = await axios.post(
                    `http://localhost:3000/leave-room/${sessionID}/${socket.id}`
                );

                // Clean up the mapping
                removeSocket(socket.id);
                console.log(JSON.stringify(socketSessionMap))

            } 
            catch (error) 
            {
                if (axios.isAxiosError(error)) 
                {
                    console.error("Error removing user ", error.response?.data || error.message);
                } 
                else 
                {
                    console.error("Error removing user ", error);
                }
            }
        } 
        else 
        {
            console.log(`No session found for disconnected socket: ${socket.id}`);
        }
    });

        socket.emit("clear-session");
    });



server.listen(PORT, () => {
    console.log(`(main.ts): Express & SocketIO Server running at http://localhost:${PORT}`);
})
