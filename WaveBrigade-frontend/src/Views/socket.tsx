import { io } from 'socket.io-client';
const socket = io("http://localhost:3000", 
    {
        autoConnect: true //Prevents auto-connection when socket is imported
    }
);
export default socket;