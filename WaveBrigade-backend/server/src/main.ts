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
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { off } from "node:process";
import dbClient from "./controllers/dbClient.ts";
import {
  removeSpectatorFromSession,
  removeUserFromSession,
  getUserSessionIDFromSocketID,
} from "./controllers/database.ts";
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
//Getting video logic to show for the joiner, the get is in joiner fe active experiment
app.get("/get-videoFile/:filename", (req: Request, res: Response) => {
  const { filename } = req.params;
  if (filename.includes("..")) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Filename" });
  }
  const filePath = path.join(__dirname, "/media/video-lab/", filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ success: false, message: "Video not found" });
  }
});
//Getting gallery logic to show for the joiner, the get is in joiner fe active experiment
app.get("/get-gallery/:filename", (req: Request, res: Response) => {
  const { filename } = req.params;
  if (filename.includes("..")) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Filename" });
  }
  const filePath = path.join(__dirname, "/media/gallery-lab/", filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ success: false, message: "Image not found" });
  }
});

//Getting article logic to show for the joiner, the get is in joiner fe active experiment
app.get("/get-articleFile/:filename", (req: Request, res: Response) => {
  const { filename } = req.params;
  if (filename.includes("..")) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid Filename" });
  }
  const filePath = path.join(__dirname, "/media/article-lab/", filename);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ success: false, message: "Video not found" });
  }
});

let latestExperimentType = null;
let isVideoPlaying = false;
let latestSeekTime = 0;
let latestExperimentData = null;
let isMasked = false;
let userStates = {};

io.on("connection", (socket) => {
  // console.log("(main.ts): User Connected | socketID: " + socket.id)
  // console.log(`(main.ts): Total connections: ${io.engine.clientsCount}`);
  socket.on("register-user", (userId) => {
    userStates[socket.id] = { userId };
    console.log(`User registered: ${userId} with socket ${socket.id}`);
  });

  socket.on("client-assignment", () => {
    console.log(
      "(main.ts): Emitting client-assignment with socketId:",
      socket.id
    );

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
    latestExperimentData = data;
    io.emit("experiment-data", data);
    console.log("hopefully emitted");
  });

  socket.on("message", (data) => {
    console.log("Here is the message:", data);
    io.emit("message", data);
  });

  socket.on("experiment-active", (data) => {
    console.log("The experiment is", data);
    io.emit("experiment-active", data);
  });

  socket.on("kick", async (nicknameSocketID) => {
    console.log("Received kick event for", nicknameSocketID);
    console.log("(main.ts): Current socketSessionMap:", socketSessionMap);

    const targetSocket = io.sockets.sockets.get(nicknameSocketID);

    if (targetSocket) {
      io.to(nicknameSocketID).emit("kick", nicknameSocketID);
      console.log("(main.ts) Emitted kick event.");
      targetSocket.disconnect(true); // Ensures a forced disconnect
      console.log(
        `(main.ts): Successfully disconnected socket ${nicknameSocketID}`
      );
    } else {
      console.log(`(main.ts): No socket found with ID ${nicknameSocketID}`);
    }
    // io.emit("kick", nicknameSocketID);

    // io.emit("kick", socketID);
    
  })

  socket.on("kick-active-student", (data) => {
    console.log("Recieved active student: ", data);
    io.emit("kick-active-student", data);
  })
  
  socket.on("joiner-connected", async (data) => {
    const { socketID, nickname, lastFourSerial } = data;
    console.log(
      `Received joiner-connected event in the backend for socket: ${socketID} of the name ${nickname} with their last four serial number being ${lastFourSerial}`
    );
    console.log("Now emitting event to host FE");
    io.emit("joiner-connected", { socketID, nickname, lastFourSerial });
  });

  //send socket Id to brainflow
  socket.on("brainflow-assignment", () => {
    console.log(
      "(main.ts): Emitting brainflow-assignment with socketId:",
      socket.id
    );
    socket.emit("brainflow-assignment", { socketId: socket.id });
  });

  socket.on("experiment-type", (data) => {
    console.log("Event received: experiment-type in BE", data);
    latestExperimentType = data;
    io.emit("experiment-type", data);
  });

  socket.on("toggle-mask", ({ userId } = {}) => {
    console.log("Toggling mask...");
    isMasked = !isMasked;
    console.log(
      `Toggling mask. userId: ${userId}, new mask state: ${isMasked}`
    );
    if (!userId) {
      console.log("No userId detected, must be masknig all users");
      for (const [socketID, info] of Object.entries(userStates)) {
        io.to(socketID).emit("toggle-mask", {
          userId: info.userId,
          isMasked,
        });
      }
    } else {
      for (const [socketID, info] of Object.entries(userStates)) {
        console.log(`UserID ${userId} and info.userId ${info.userId}`);
        console.log(`userId detected, must be maskning one user, ${userId}`);
        if (info.userId == userId) {
          io.to(socketID).emit("toggle-mask", {
            userId,
            isMasked,
          });
          break;
        }
      }
    }
  });

  socket.on("join-room", () => {
    console.log("User joined, latest experiment:", latestExperimentType);
    const userInfo = userStates[socket.id];
    if (userInfo && userInfo.userId) {
      socket.emit("toggle-mask", {
        userId: userInfo.userId,
        isMasked: isMasked,
      });
    }

    if (latestExperimentType !== null) {
      socket.emit("experiment-type", latestExperimentType);
    }
    if (latestExperimentType === 1) {
      console.log(
        "ExperimentType is a video, sending an emit to joiner to tell them the video state. Is video playing?",
        isVideoPlaying
      );
      socket.emit("play-video", isVideoPlaying);
      socket.emit("seek-video", latestSeekTime);
    }
    if (latestExperimentType === 3 && latestExperimentData) {
      console.log("Gallery lab, sending data to joiner");
      socket.emit("experiment-data", latestExperimentData);
    }
  });

  //recieve emotibit data
  socket.on("update", (payload) => {
    const {
      ancData,
      auxData,
      heartRate,
      ipAddress,
      serialNumber,
      backendIp,
      hostSessionId,
      userId,
      frontEndSocketId,
      assignSocketId,
    } = payload;
    //console.log("Update Event: Received data:", JSON.stringify(heartRate));
    io.emit("update", payload);
  });

  //Socket Video Player
  socket.on("play-video", (data) => {
    console.log(
      "[Socket: play-video] Attempting to play/pause video. Data passed:",
      data
    );
    isVideoPlaying = data;
    socket.broadcast.emit("play-video", data); //sending to joiners, not to the host with broadcast.emit
  });

  socket.on("seek-video", (seconds) => {
    console.log(
      "Socket: seek-video] Attempting to seek video. Seconds passed:",
      seconds
    );
    latestSeekTime = seconds;
    socket.broadcast.emit("seek-video", seconds);
  });

  socket.on("image-selected", (image) => {
    console.log(
      "In event image-selected, now attempting to send image to students"
    );
    socket.broadcast.emit("image-selected", image);
    console.log("Broadcasted image to students");
  });

  session_handlers(io, socket, rooms, isHost);

  socket.on("end-experiment", (session) => {
    console.log("Ending experiment");
    io.emit("end-experiment", session);
  });

  socket.on("disconnect", async (data) => {
    // console.log(`(main.ts): User Disconnected | socketID: ${socket.id}`);
    // console.log(`(main.ts): Total connections: ${io.engine.clientsCount}`);

    console.log("User disconnected: ", socket.id);
    console.log("Reason: ", data);

    delete userStates[socket.id];
    const sessionID = getSessionBySocket(socket.id);

    const sessionIDnum: number | null = await getUserSessionIDFromSocketID(
      socket.id
    );
    const sessionIDstr = String(sessionIDnum);

    try{
      const session = await hostDisconnect(socket.id);
      io.emit("end-experiment", session.sessionid);

    } catch(error){
      console.log("Couldn't find a session with that host socket id");
    }

    try {
      console.log(
        "trying to remove joiner with sessionid " +
          sessionIDnum +
          "and socketid " +
          socket.id
      );
      await removeUserFromSession(sessionIDstr, socket.id);
    } catch (err) {
      console.error("Error removing joiner from session:", err);
    }

    try {
      console.log(
        "removing spectator with sessionid " +
          sessionID +
          "and socketid" +
          socket.id
      );
      await removeSpectatorFromSession(sessionIDnum, socket.id);
    } catch (err) {
      console.error("Error removing spectator from session:", err);
    }

    if (sessionID) {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_PATH}/joiner/leave-room`,
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

dbClient.end();
