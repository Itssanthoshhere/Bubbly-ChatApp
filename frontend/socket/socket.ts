import { API_URL } from "@/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export async function connectSocket(): Promise<Socket> {
  const token = await AsyncStorage.getItem("token");

  if (!token) {
    throw new Error("No token found. User must login first");
  }

  if (!socket) {
    socket = io(API_URL, {
      auth: { token },
    });

    // Wait for connection
    await new Promise((resolve) => {
      socket?.on("connect", () => {
        console.log("Socket connected: ", socket?.id);
        resolve(true);
      });
    });

+    // Handle disconnection
+    socket.on("disconnect", () => {
      console.log("Socket Disconnected");
    });
  }

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
