const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");

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
let roomObject = {
    lobbyName: undefined,
    sessionID: undefined,
    users: [],
    sessionPassword: undefined,
    hostSocketID: undefined,
    discoveredEmotiBits: []
};
//UID library, to generate user IDs
const userObject = {
    nickName: undefined,
    socketID: undefined,
    userID: undefined,
    associatedEmotiBit:{
        serialNumber: undefined,
        IPAddress: undefined,
    }
};

const emotiBitObject = {
    serialNumber: undefined,
    IPAddress: undefined,
};


io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`); //when a new client connects to the server, it will log it
    
    //From Host Select Media Page
    socket.on("create_room", (data) => { //listens for send_code event from SelectMedia Page
        //Have generated code here
        console.log("Data received from client:", data);
        const {roomCode} = data;
        console.log("Extracted roomCode:", roomCode);
        console.log("code recieved!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        if (!rooms[roomCode]) { //if room doesn't exist
            rooms[roomCode] = []; //create empty list for that room
            socket.join(roomCode);
            socket.emit("room_created", {roomCode});
        }
        else{
            console.log("Room exists");
        }

        console.log(`Room number: ${roomCode}`);
    });

    //user joins a room || From join page
    socket.on("join_room", (data) => { //listens for join_room event from client, expects room code and nickName
        const {nickName, StudentInputRoomCode} = data;
        if (!rooms[StudentInputRoomCode]) { //if room doesn't exist
            socket.join(StudentInputRoomCode);  //adds user to room
            if (!rooms[StudentInputRoomCode].users.includes(nickName)) { //prevents duplicate nicknames
                rooms[StudentInputRoomCode].users.push(nickName);
            }
        }
        io.to(StudentInputRoomCode).emit("receive_names", rooms[StudentInputRoomCode].users); //should broadcast the updated list of names to everyone in the room
        console.log(`User ${nickName} joined room: ${StudentInputRoomCode}`);
    });

   //sending nickname || From Join Page
    socket.on("send_name", (data) => { //listens for send_name event from client
        const {nickName, StudentInputRoomCode} = data;
        if (!rooms[StudentInputRoomCode]) {
            rooms[StudentInputRoomCode] = []; 
        }
        if (!rooms[StudentInputRoomCode].includes(nickName)) {
            rooms[StudentInputRoomCode].push(nickName);
        }
        
        io.to(StudentInputRoomCode).emit("receive_names", rooms[StudentInputRoomCode]);
        console.log(`Updated nicknames in room ${StudentInputRoomCode}:`, rooms[StudentInputRoomCode]);
    });

    //from waiting room
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
