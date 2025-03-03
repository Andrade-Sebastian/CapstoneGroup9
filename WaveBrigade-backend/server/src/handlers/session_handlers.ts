import { Server, Socket } from "npm:socket.io@4.8.1";
import SessionManager, { ISession } from "../sessions_singleton.ts";

const sessionManager = SessionManager.getInstance();

//CHICKEN
export default function session_handlers(_io: Server, _socket: Socket) {
  _socket.on("create_room", (data) => {
    const { roomCode } = data;
    console.log("====================================NEW SESSION STARTED HERE==========================================================");
    console.log("In session_handlers.ts -> create_room event.");
    console.log("Data received from client: ", data);
    console.log("Room code received: ", roomCode);

    if (!sessionManager.getSession(roomCode)) { //CHICKEN
      const newSession: ISession = {
        sessionId: roomCode,
        sessionName: roomCode,
        hostSocketId: _socket.id,
        users: [],
        isInitialized: true,
        configuration: {},
        credentials: {},
        discoveredDevices: [],
      };

      sessionManager.addSession(roomCode, newSession); //CHICKEN
      _socket.join(roomCode);
      _socket.emit("room_created", { roomCode });
    } else {
      _socket.emit("error", { message: "Room already exists." });
    }
    console.log("------END CREATE ROOM EVENT-------");
  });

  _socket.on("join_room", (data) => {
    const { nickName, StudentInputRoomCode } = data; //CHICKEN

    if (session) {
      const userExists = session.users.find((user) => user.nickname === nickName);

      if (!userExists) {
        session.users.push({ userId: _socket.id, socketId: _socket.id, nickname: nickName });
        sessionManager.addSession(StudentInputRoomCode, session); //CHICKEN

        _socket.join(StudentInputRoomCode);
        _io.to(StudentInputRoomCode).emit("receive_names", session.users.map((user) => user.nickname));

        console.log(`User ${nickName} joined room: ${StudentInputRoomCode}`);
        console.log(`Updated nicknames in room ${StudentInputRoomCode}:`, session.users);
      } else {
        _socket.emit("error", { message: "Nickname already exists in this room." });
      }
    } else {
      _socket.emit("error", { message: "Room does not exist." });
    }

    console.log("------END OF JOIN ROOM EVENT-------");
  });

  _socket.on("join_waiting_room", (data) => {
    const { nickName, StudentInputRoomCode } = data;
    const session = sessionManager.getSession(StudentInputRoomCode); //CHICKEN

    if (session) {
      _io.to(StudentInputRoomCode).emit("receive_names", session.users.map((user) => user.nickname));
      console.log(`User ${nickName} joined waiting room: ${StudentInputRoomCode}`);
    } else {
      _socket.emit("error", { message: "Room does not exist." });
    }

    console.log("------END OF JOIN_WAITING_ROOM EVENT-------");
  });

  // _socket.on("disconnect", () => {
  //   console.log(`User disconnected: ${_socket.id}`);
  //   // Remove user from session
  //   const sessions = sessionManager.listSessions();
  //   for (const roomCode in sessions) {
  //     const session = sessions[roomCode];
  //     const userIndex = session.users.findIndex((user) => user.socketId === _socket.id);
  //     //CHICKEN
  //     if (userIndex !== -1) {
  //       session.users.splice(userIndex, 1);
  //       sessionManager.addSession(roomCode, session);
  //       _io.to(roomCode).emit("receive_names", session.users.map((user) => user.nickname));
  //       break;
  //     }
  //   }
  // });
}