import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import codespaceExistController from "./controllers/codespaceExistController";
import createCodespace from "./controllers/createCodespaceController";
import socketio from "./sockets/socketio";
import healthIndicator from "./controllers/healthIndicator";
import gemini from "./controllers/gemini";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", healthIndicator);
app.get("/api/existcodespace", codespaceExistController);
app.post("/api/createcodespace", createCodespace);
app.post("/api/gemini", gemini);

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

io.on('connection', (socket) => {
    console.log(`New socket connection: ${socket.id}`);
    socketio(io, socket);
})

server.listen(8080, () => {
    console.log("Server listening at http://localhost:8080");
})