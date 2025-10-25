import { Server as SocketIOServer, Socket } from "socket.io";

// Function to register user-related event handlers
export function registerUserEvents(io: SocketIOServer, socket: Socket) {
  socket.on("testSocket", (data) => {
    socket.emit("testSocket", { msg: "Realtime updates!" });
  });
}
