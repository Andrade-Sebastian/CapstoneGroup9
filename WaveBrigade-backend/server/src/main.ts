import express from "npm:express@^4.17.1";
import cors from "npm:cors";
import { Server } from "npm:socket.io@^4.8.1";
import { createServer } from "node:http";
import hostRouter from "./routes/host_routes.ts"
import session_handlers from "./handlers/session_handlers.ts";
import experimentRouter from "./routes/experiment_routes.ts";

const PORT = 3000;
const ORIGIN = "http://localhost:5173";

const app = express();
const server = createServer(app);

app.use(cors());
//app.use(cors({origin: ORIGIN}));
app.use("/host", hostRouter);
app.use("/experiment", experimentRouter);


export const io = new Server(server, {
    cors: {
        origin: ORIGIN,
    },
});

const rooms: { [key: string]: any} = {};
const currentSessions: { [key: string]: ISession } = {};
const sessionNamespace = io.of("/session");
let isHost = true;


io.on("connection", (socket) => {
    session_handlers(io, socket, rooms, isHost);
})

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
})