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

    socket.to(data.codespaceId).emit('fileupdate', {
      filename: data.filename,
      content: data.content
    })

  })

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