import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { register } from "module";
import { Server as SocketIOServer, Socket } from "socket.io";
import { registerUserEvents } from "./userEvents.ts";

dotenv.config();

export function initializeSocketServer(server: any): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Allow all origins for simplicity; adjust as needed for security
    },
  }); // Socket.IO server instance

  // Authentication middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: no token provided"));
    }

    jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          return next(new Error("Authentication error: invalid token"));
        }

        // Attach user info to socket object
        let userData = decoded.user;
        socket.data = userData;
        socket.data.userId = userData.id;
        next();
      }
    );
  });

  // When socket connects, register event handlers
  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId}, username: ${socket.data.name}`);

    // Register event handlers here
    registerUserEvents(io, socket);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
}
