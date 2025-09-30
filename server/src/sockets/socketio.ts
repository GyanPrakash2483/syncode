import { Server, Socket } from "socket.io";
import CodespaceRegistry from "../codespace/CodespaceRegistry";

export default function socketio(io: Server, socket: Socket) {
  socket.on('reguser', (data) => {
    socket.join(data.codespaceId);
    const codespace = CodespaceRegistry.getCodespace(data.codespaceId);
    codespace?.files.forEach((file) => {
      socket.emit('fileupdate', {
        filename: file.filename,
        content: file.content
      })
    })
  })

  socket.on('mousemove', (data) => {
    socket.to(data.codespaceId).emit('mouseupdate', {
      username: data.username,
      mouseX: data.mouseX,
      mouseY: data.mouseY
    })
  })


  socket.on('clientfileupdate', (data) => {
    const codespace = CodespaceRegistry.getCodespace(data.codespaceId);
    codespace?.updateFile(data.filename, data.content);
    console.log(data)
    socket.to(data.codespaceId).emit('fileupdate', {
      filename: data.filename,
      content: data.content
    })

  })

}