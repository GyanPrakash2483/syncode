import { Server, Socket } from "socket.io";
import CodespaceRegistry from "../codespace/CodespaceRegistry";

const emitTimers: Record<string, NodeJS.Timeout> = {};

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

    if (emitTimers[data.codespaceId]) {
      clearTimeout(emitTimers[data.codespaceId]);
    }

    // Schedule a new emit after 1 second
    emitTimers[data.codespaceId] = setTimeout(() => {
      socket.to(data.codespaceId).emit('fileupdate', {
        filename: data.filename,
        content: data.content
      });

      delete emitTimers[data.codespaceId];
    }, 1000);
  });

  socket.on('clientfiledelete', (data) => {
    const codespace = CodespaceRegistry.getCodespace(data.codespaceId);
    codespace?.deleteFile(data.filename);

    socket.to(data.codespaceId).emit('deletefile', {
      filename: data.filename
    })
  })

  socket.on('clientfilerename', (data) => {
    const codespace = CodespaceRegistry.getCodespace(data.codespaceId);
    codespace?.renameFile(data.filename, data.newfilename);

    socket.to(data.codespaceId).emit('filerename', data);
  })

}