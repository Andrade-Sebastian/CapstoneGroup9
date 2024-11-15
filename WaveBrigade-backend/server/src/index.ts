import express, { Request, Response } from 'express';

const app = express();
import  http  from "node:http";
const server = http.createServer(app);
import {Server}  from "npm:socket.io";
import cors from "cors";

//cors setup
app.use(cors());
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", //this is for frontend
        methods: ["GET", "POST"], //this allows get and post to be used
    },
});


// app.get('/', (req: Request, res: Response) => {
//     res.send('Hello, TypeScript Express!');
// });

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});



server.listen(3000, () => {
  console.log('TYPESCRIPT listening on *:3000');
});