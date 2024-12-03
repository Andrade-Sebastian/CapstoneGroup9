import {type Server, type Socket} from "npm:socket.io@4.8.1";

export default function session_handlers(_io: Server, _socket: Socket){
    // _socket.on("create_room", (data) => {
    //     //TODO: Have generated code here(Check google docs)

    //     isHost = true;
    //     const {roomCode} = data;

    //     console.log("====================================NEW SESSION STARTED HERE==========================================================")
    //     console.log("------------" + "In INDEX.JS -> create_room event." + "-------------")
    //     console.log("Data received from client: ", data);
    //     console.log("roomCode recieved: ", roomCode);

    //     if(isHost){
            
    //         if (!rooms[roomCode]) { //if room doesn't exist
    //             rooms[roomCode] = {
    //                 users: [], //create empty list for that room
    //             }; 
    //             _socket.join(roomCode);
    //             _socket.emit("room_created", {roomCode});
    //         }
    //         else{
    //             _socket.emit("error", { message: "Room already exists."});
    //         }

    //         console.log("------END CREATE ROOM EVENT-------")
    //     }
    // });
    _socket.emit("test_event", {message: "hello world"});
}  
