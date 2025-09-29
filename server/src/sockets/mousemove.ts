import { Server, Socket } from "socket.io";

export default function mousemove(io: Server, socket: Socket) {
  io.on('pointer', (data) => {
    console.log(data);
  })
}