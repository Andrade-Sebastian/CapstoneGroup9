import http from "node:http"
import express from "npm:express";
import {ISession} from "./controllers/session_controller.ts";
import hostRouter from "./routes/host_routes.ts";
import {Server, type Socket} from "npm:socket.io@4.8.1";
import {CLIENT_SOCKET_ASSIGNMENT} from "./events.ts";

const app = express();
const server = http.createServer(app);

import cors, {CorsOptions} from "cors";



// //cors setup for Deno
// const corsOptions: CorsOptions = {
//         origin: "*", //this is for frontend
//         //methods: "*", //this allows get and post to be used
//     };


// CORS setup for Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*" // This is for the frontend
         // This allows GET and POST to be used
    },
});

//app.use(cors);


const currentSessions: { [key: string]: ISession } = {}

app.use('/host', hostRouter)

const sessionNamespace = io.of("/session");

server.listen(3000, () => {
    console.log('express running at http://localhost:3000 -> server.ts');
});

export {app, io, currentSessions}