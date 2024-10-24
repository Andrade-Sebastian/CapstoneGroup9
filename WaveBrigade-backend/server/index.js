//Code from Socket.io (getting started tutorial)
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
    },
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on("connection", (socket) =>{
    console.log(`User Connected: ${socket.id}`);
    socket.on("join_room", (data) => {
        socket.join(data);
    });

    socket.on("send_name"), (data) => {
        socket.to(data.room).emit("receive_name", data);
    }
});

server.listen(3001, () => {
    console.log("Server is running...");
});