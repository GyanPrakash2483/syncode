import Server from "socket.io"
import { User, Vector2 } from "./entities/user";

const io = new Server(8080, {
  cors: {
    origin: "*"
  }
})

const codespaceRegistry = [];

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("joincodespace", ({ codespaceId, username}) => {
    socket.join(codespaceId);

    let codespace = codespaceRegistry.filter((codespace) => codespace.id === codespaceId)
    if(!codespace) {
      socket.emit('message', {
        message: "The room does not exist"
      })
    }
    codespace.addUser(new User(username, new Vector2(500, 500), socket.id))

    console.log(`${username} joined codespace ${codespaceId}`);
    socket.to(codespaceId).emit("message", `${username} joined codespace ${codespaceId}`);
  })

  socket.on("filecreate", ({codespaceId, filepath}) => {

  })

  socket.on("fileupdate", ({codespaceId, filepath, newcontent}) => {

  })

  socket.on("updatemousepos", ({codespaceId, newmousepos}) => {

  })

  socket.on("diconnecting", () => {

  })

})