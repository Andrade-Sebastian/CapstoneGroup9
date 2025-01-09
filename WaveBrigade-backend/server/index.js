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

const rooms = {}; //stores nickname per room
let isHost = true;
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
    associatedEmotiBit: {
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
    
    //listens for send_code event from HostSelectMedia Page
    socket.on("create_room", (data) => {
        //TODO: Have generated code here(Check google docs)

        isHost = true;
        const {roomCode} = data;

        console.log("====================================NEW SESSION STARTED HERE==========================================================")
        console.log("------------" + "In INDEX.JS -> create_room event." + "-------------")
        console.log("Data received from client: ", data);
        console.log("roomCode recieved: ", roomCode);

        if(isHost){
            
            if (!rooms[roomCode]) { //if room doesn't exist
                rooms[roomCode] = {
                    users: [], //create empty list for that room
                }; 
                socket.join(roomCode);
                socket.emit("room_created", {roomCode});
            }
            else{
                socket.emit("error", { message: "Room already exists."});
            }

            console.log("------END CREATE ROOM EVENT-------")
        }
    });

    //user joins a room || From join page
    socket.on("join_room", (data) => { //listens for join_room event from a Student ONLY, expects room code and nickName

        const {nickName, StudentInputRoomCode} = data;
        var isValidRoomCode = StudentInputRoomCode in rooms;
        var nameIsDuplicate = isValidRoomCode && nickName in rooms[StudentInputRoomCode].users

        console.log("-------------"+"In INDEX.JS -> join_room event." + "-------------")
        console.log("Received room code from Student: " + StudentInputRoomCode)
        console.log("Is it a valid room code? " + isValidRoomCode)
        console.log("Is the name a duplicate?  " + nameIsDuplicate)
        
        
        //Checking if room exists, if it does already, send error
        if (isValidRoomCode)
        {
            socket.join(StudentInputRoomCode); //adds user to room

            if (!nameIsDuplicate) 
            {   
                //prevents duplicate nicknames
                rooms[StudentInputRoomCode].users.push(nickName);
                io.to(StudentInputRoomCode).emit("receive_names", rooms[StudentInputRoomCode].users); //should broadcast the updated list of names to everyone in the room
                
                console.log(`User ${nickName} joined room: ${StudentInputRoomCode}`);
                console.log(`Updated nicknames in room ${StudentInputRoomCode}:`, rooms[StudentInputRoomCode])
            }
            
        }
        else if (!isValidRoomCode) //if the room code is not valid
        {
            socket.emit("error", {message: "Room does not exist."});
            console.log("ERROR: Room doesn't exist")

            return;
        }

        console.log("------END OF JOIN ROOM EVENT-------")
    });

    //sending nickname || From Join Page
    socket.on("send_name", (data) => { //listens for send_name event from client
        const {nickName, StudentInputRoomCode} = data;
        var isValidRoomCode = StudentInputRoomCode in rooms;
        var nameIsDuplicate = isValidRoomCode && nickName in rooms[StudentInputRoomCode].users

        console.log("-------------" + "In INDEX.JS -> send_name event." + "-------------")
        if (!isValidRoomCode) 
        {
            rooms[StudentInputRoomCode] = {users: []}; 
        }
        if (!nameIsDuplicate && isValidRoomCode) 
        {
            io.to(StudentInputRoomCode).emit("receive_names", rooms[StudentInputRoomCode].users);

            // console.log(`Updated nicknames in room ${StudentInputRoomCode}:`, rooms[StudentInputRoomCode]);
        }
        console.log("-------END OF SEND_NAME EVENT------")
        
    });

    //from waiting room
    socket.on("join_waiting_room", (data) => {
        const {nickName, StudentInputRoomCode} = data;
        
        var isValidRoomCode = StudentInputRoomCode in rooms;

        console.log("-------------"+"In INDEX.JS -> join_waiting_room event."+"-------------")
        console.log("nickname: "+ nickName)
        console.log("All Rooms: " + JSON.stringify(rooms, null, 2))
        console.log("StudentInputRoomCode: " + StudentInputRoomCode + " index.js" )
        console.log("Valid room code? " +isValidRoomCode);

        
        if(isValidRoomCode)
        {
            io.to(StudentInputRoomCode).emit("receive_names", rooms[StudentInputRoomCode].users);
            console.log("users in room: " + rooms[StudentInputRoomCode].users)
        }
        else
        {
            socket.emit("error",{message:"Room doesn't exist."});
        }
        
        console.log("------END OF JOIN_WAITING_ROOM EVENT-------")
    })

    

    // // Send data to the client every 100ms
    // const interval = setInterval(() => {
    //     console.log("in interval")
    //     const data = {
    //     timestamp: new Date().toISOString(),
    //     randomValue: Math.random(),
    //     };
    //     socket.emit('update', data); // Emit an event called "data" with the payload
    // }, 100);

});

//TODO: Disconnect feature, two users, if one user disconnects, their name should be gone from the other user's device

server.listen(3002, () => {
    console.log("Server is running on port 3002...");
});
