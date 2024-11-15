import http from "node:http"
import express from "npm:express";
import {Server} from "npm:socket.io";
import {ISession} from "./controllers/session_controller.ts";
import hostRouter from "./routes/host_routes.ts";

const app = express();
const server = http.createServer(app);

import cors, {CorsOptions} from "cors";


app.use(cors());

//cors setup for Deno
const corsOptions: CorsOptions = {
        origin: "http://localhost:5173", //this is for frontend
        methods: ["GET", "POST"], //this allows get and post to be used
    };


// CORS setup for Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // This is for the frontend
        methods: ["GET", "POST"], // This allows GET and POST to be used
    },
});

app.use(cors(corsOptions));


const currentSessions: { [key: string]: ISession } = {}

app.use('/host', hostRouter)

server.listen(3000, () => {
    console.log('express running at http://localhost:3000');
});

export {app, io, currentSessions}