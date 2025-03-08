/*
Author:
Data:
Description:
 */
const PORT = 3000;
const HOST = "0.0.0.0";
const ORIGIN_JOINER = "http://localhost:4500";
const ORIGIN_HOST = "http://localhost:5173";

import grpc from "npm:@grpc/grpc-js";
import socketSessionMap, {
  addSocketToSession,
  getSessionBySocket,
  removeSocket,
} from "./sessionMappings.ts";
import axios from "npm:axios";

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

export const client = new emotiBits(
  "wb-backend-grpc:50051",
  grpc.credentials.createInsecure()
);

import express from "npm:express@^4.17.1";
import cors from "npm:cors";
import { Server } from "npm:socket.io@^4.8.1";
import { createServer } from "node:http";
import hostRouter from "./routes/host_routes.ts";
import joinerRouter from "./routes/joiner_routes.ts";
import session_handlers from "./handlers/session_handlers.ts";
import experimentRouter from "./routes/experiment_routes.ts";
import databaseRouter from "./routes/database_routes.ts";
import { Request, Response } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const app = express();

// app.get('/get-ip', (req, res) => {
//     const ipAddress = req.headers['x-forwarded-for'] || req.ip;
//     res.send({
//         "message": `Your IP address is: ${ipAddress}`
//     });
// });

const server = createServer(app);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
//app.use(cors({origin: ORIGIN}));
app.use("/host", hostRouter);
app.use("/joiner", joinerRouter);
app.use("/database", databaseRouter);
app.use("/experiment", experimentRouter);
// app.use('/media', express.static(path.join(__dirname, 'media')));

export const io = new Server(server, {
  cors: {
    origin: [ORIGIN_HOST, ORIGIN_JOINER],
  },
});

const rooms: { [key: string]: any } = {};
const currentSessions: { [key: string]: ISession } = {};
const sessionNamespace = io.of("/session");
let isHost = true;

let frontEndSocketId = null;

app.get("/get-brainflow-info", (req: Request, res: Response) => {
  console.log("Getting Express IP");
  const ipAddress = req.ip;
  res.send({
    ip: ipAddress,
    //"port": PORT
  });
});

app.get("/ip", (req: Request, res: Response) => {
  console.log("(joiner_routes.ts): in /ip");
  const ipAddress = (req.headers["x-forwarded-for"] as string) || req.ip;
  res.status(200).send({
    message: `Your IP address is: ${ipAddress}`,
  });
});

//Getting photo logic to show for the joiner, the get is in joiner fe active experiment
app.get("/get-photo/:filename", (req: Request, res: Response) => {
  const { filename } = req.params;
  if (filename.includes("..")) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Filename" });
  }
  const filePath = path.join(__dirname, "/media/photo-lab/", filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ success: false, message: "Image not found" });
  }
});

io.on("connection", (socket) => {
  
  // console.log("(main.ts): User Connected | socketID: " + socket.id)
  // console.log(`(main.ts): Total connections: ${io.engine.clientsCount}`);

  socket.on("client-assignment", () => {
    //console.log("(main.ts): Emitting client-assignment with socketId:", socket.id);
    socket.emit("client-assignment", { socketId: socket.id });
  }); // Send socket ID to the client

  socket.on("session-start", () => {
    console.log("In session-create");
    io.emit("session-start");
  });
  socket.on("session-start-spectator", () => {
    console.log("In session-create");
    io.emit("session-start-spectator");
  });
  socket.on("experiment-data", (data) => {
    console.log("In experiment-data in main.ts, here is the data", data);
    io.emit("experiment-data", data);
    console.log("hopefully emitted");
  });

  socket.on("kick", async (nicknameSocketID) => {
    console.log("(main.ts): Received socket ID:", nicknameSocketID);
    console.log("(main.ts): Current socketSessionMap:", socketSessionMap);

    const targetSocket = io.sockets.sockets.get(nicknameSocketID);
    
    if (targetSocket) {
        targetSocket.disconnect(true); // Ensures a forced disconnect
        console.log(`(main.ts): Successfully disconnected socket ${nicknameSocketID}`);
    } else {
        console.log(`(main.ts): No socket found with ID ${nicknameSocketID}`);
    }
    
    io.to(nicknameSocketID).emit("kick", nicknameSocketID); 
    // io.emit("kick", nicknameSocketID);

    // io.emit("kick", socketID);

  })

  //send socket Id to brainflow
  socket.on("brainflow-assignment", () => {
    console.log(
      "(main.ts): Emitting brainflow-assignment with socketId:",
      socket.id
    );
    socket.emit("brainflow-assignment", { socketId: socket.id });
  });

  //recieve emotibit data
  socket.on("update", (payload) => {
    const {
      ancData,
      auxData,
      ipAddress,
      serialNumber,
      backendIp,
      hostSessionId,
      userId,
      frontEndSocketId,
      assignSocketId,
    } = payload;
    console.log("Update Event: Received data:", JSON.stringify(ancData.data1));
    io.emit("update", payload);
  });

  session_handlers(io, socket, rooms, isHost);

  socket.on("end-experiment", () => {
    console.log("Ending experiment");
    io.emit("end-experiment");
  });
  //console.log("Running Script");
  // socket.on("update", (data) => {
  //     console.log(data);
  //     io.emit("update", data);
  // })

  socket.on("disconnect", async (data) => {
    // console.log(`(main.ts): User Disconnected | socketID: ${socket.id}`);
    // console.log(`(main.ts): Total connections: ${io.engine.clientsCount}`);

    console.log("User disconnected: ", socket.id);
    console.log("Reason: ", data);
    const sessionID = getSessionBySocket(socket.id);

    if (sessionID) {
      try {
        const response = await axios.post(
          `http://localhost:3000/joiner/leave-room`,
          {
            sessionID: sessionID,
            socketID: socket.id,
          }
        );
        //emit to host that a user disconnected
        // io.emit(response.hostsocketid).emit(
        //   "destroy-brainflow-launch",
        //   "destroy user's brainflow launch"
        // );
        // Clean up the mapping
        removeSocket(socket.id);
        console.log(JSON.stringify(socketSessionMap));
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error(
            "Error removing user ",
            error.response?.data || error.message
          );
        } else {
          console.error("Error removing user ", error);
        }
      }
    } else {
      console.log(`No session found for disconnected socket: ${socket.id}`);
    }
  });

  socket.emit("clear-session");
});

server.listen(PORT, HOST, () => {
  console.log(
    `(main.ts): Express & SocketIO Server running at http://localhost:${PORT}`
  );
});
