import http from "node:http"
import express from "npm:express";
import {Server} from "npm:socket.io";
import {ISession} from "./controllers/session_controller.ts";
import hostRouter from "./routes/host_routes.ts";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const currentSessions: { [key: string]: ISession } = {}

app.use('/host', hostRouter)

server.listen(3000, () => {
    console.log('express running at http://localhost:3000');
});

export {app, io, currentSessions}