const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");
var json = require('jsonify');

app.use(cors());

//cors setup
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", //this is for frontend
        methods: ["GET", "POST"], //this allows get and post to be used
    },
});

// const nicknames = {};
const rooms = {}; //stores nickname per room


io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`); //when a new client connects to the server, it will log it

    //user joins a room
    socket.on("join_room", (data) => { //listens for join_room event from client, expects room code and nickName
        const {nickName, roomCode} = data;
        socket.join(roomCode);  //adds user to room
        if (!rooms[roomCode]) { //if room doesn't exist
            rooms[roomCode] = []; //create empty list for that room
        }
        if (!rooms[roomCode].includes(nickName)) { //prevents duplicate nicknames
            rooms[roomCode].push(nickName);
        }
        io.to(roomCode).emit("receive_names", rooms[roomCode]); //should broadcast the updated list of names to everyone in the room
        console.log(`User ${nickName} joined room: ${roomCode}`);
    });

   //sending nickname
    socket.on("send_name", (data) => { //listens for send_name event from client
        const {nickName, roomCode} = data;
        if (!rooms[roomCode]) {
            rooms[roomCode] = []; 
        }
        if (!rooms[roomCode].includes(nickName)) {
            rooms[roomCode].push(nickName);
        }
        
        io.to(roomCode).emit("receive_names", rooms[roomCode]);
        console.log(`Updated nicknames in room ${roomCode}:`, rooms[roomCode]);
    });

    socket.on("join_waiting_room", (data) => {
        // io.to(roomCode).emit("receive_names", rooms[roomCode]);
        const {nickName, roomCode} = data;
        console.log(nickName, roomCode);
        socket.emit("receive_names", rooms[roomCode]);
        console.log(roomCode, rooms);
        
    })
});

//Disconnect feature, two users, if one user disconnects, their name should be gone from the other user's device

server.listen(3002, () => {
    console.log("Server is running on port 3002...");
});
