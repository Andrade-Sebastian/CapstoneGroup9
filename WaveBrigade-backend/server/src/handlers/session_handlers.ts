import {type Server, type Socket} from "npm:socket.io@4.8.1";

export default function session_handlers(_io: Server, _socket: Socket, rooms: { [key: string]: any }, isHost: boolean){
    _socket.on("create_room", (data) => {
        //TODO: Have generated code here(Check google docs)

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
                _socket.join(roomCode);
                _socket.emit("room_created", {roomCode});
            }
            else{
                _socket.emit("error", { message: "Room already exists."});
            }

            console.log("------END CREATE ROOM EVENT-------")
        }
    });

    _socket.on("join_room", (data) => { //listens for join_room event from a Student ONLY, expects room code and nickName
        console.log("LOOK AT ME" + JSON.stringify(data))
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
            _socket.join(StudentInputRoomCode); //adds user to room

            if (!nameIsDuplicate) 
            {   
                //prevents duplicate nicknames
                rooms[StudentInputRoomCode].users.push(nickName);
                _io.to(StudentInputRoomCode).emit("receive_names", rooms[StudentInputRoomCode].users); //should broadcast the updated list of names to everyone in the room
                
                console.log(`User ${nickName} joined room: ${StudentInputRoomCode}`);
                console.log(`Updated nicknames in room ${StudentInputRoomCode}:`, rooms[StudentInputRoomCode])
            }
            
        }
        else if (!isValidRoomCode) //if the room code is not valid
        {
            _socket.emit("error", {message: "Room does not exist."});
            console.log("ERROR: Room doesn't exist")
            return;
        }

        console.log("------END OF JOIN ROOM EVENT-------")
    });

    _socket.on("send_name", (data) => { //listens for send_name event from client
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
            _io.to(StudentInputRoomCode).emit("receive_names", rooms[StudentInputRoomCode].users);

            // console.log(`Updated nicknames in room ${StudentInputRoomCode}:`, rooms[StudentInputRoomCode]);
        }
        console.log("-------END OF SEND_NAME EVENT------")
        
    });

    //from waiting room
    _socket.on("join_waiting_room", (data) => {
        const {nickName, StudentInputRoomCode} = data;
        
        var isValidRoomCode = StudentInputRoomCode in rooms;

        console.log("-------------"+"In INDEX.JS -> join_waiting_room event."+"-------------")
        console.log("nickname: "+ nickName)
        console.log("All Rooms: " + JSON.stringify(rooms, null, 2))
        console.log("StudentInputRoomCode: " + StudentInputRoomCode + " session_handlers.ts")
        console.log("Valid room code? " +isValidRoomCode);

        
        if(isValidRoomCode)
        {
            _io.to(StudentInputRoomCode).emit("receive_names", rooms[StudentInputRoomCode].users);
            console.log("users in room: " + rooms[StudentInputRoomCode].users)
        }
        else
        {
            _socket.emit("error",{message:"Room doesn't exist."});
        }
        
        console.log("------END OF JOIN_WAITING_ROOM EVENT-------")
    })

    _socket.on("disconnect", () =>{
        console.log(`User disconnected: ${_socket.id}`)
    })

    //_socket.emit("test_event", {message: "hello world"});
}  
