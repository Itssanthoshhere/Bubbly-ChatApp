import { Socket, Server as SocketIOServer } from "socket.io";
import User from "../models/User.ts";
import { generateToken } from "../utils/token.ts";
import { log } from "console";

// Function to register user-related event handlers
export function registerUserEvents(io: SocketIOServer, socket: Socket) {
  socket.on("testSocket", (data) => {
    socket.emit("testSocket", { msg: "Realtime updates!" });
  });

  socket.on(
    "updateProfile",
    async (data: { name?: string; avatar?: string }) => {
      console.log("Updateprofile event: ", data);

      const userId = socket.data.userId;
      if (!userId) {
        return socket.emit("updateProfile", {
          success: false,
          msg: "Unauthorized",
        });
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { name: data.name, avatar: data.avatar },
          { new: true } // will return the user with updated values
        );

        if (!updatedUser) {
          return socket.emit("updateProfile", {
            success: false,
            msg: "User not found",
          });
        }

        // Generate token with updated user values
        const newToken = generateToken(updatedUser);

        socket.emit("updateProfile", {
          success: true,
          data: { token: newToken },
          msg: "Profile updated successfully",
        });
      } catch (error) {
        console.log("Error updating profile: ", error);
        socket.emit("updateProfile", {
          success: false,
          msg: "Error updating profile",
        });
      }
    }
  );

  // NOTE: Get Contacts API
  socket.on("getContacts", async () => {
    // NOTE: First, checking we have the current user
    try {
      const currentUserId = socket.data.userId;
      if (!currentUserId) {
        socket.emit("getContacts", {
          success: false,
          msg: "Unauthorized",
        });
        return;
      }

      // NOTE: Getting all the users
      const users = await User.find(
        { _id: { $ne: currentUserId } },
        { password: 0 } // exclude password field
      ).lean(); // will fetch js objects

      // NOTE: And mapping contacts
      const contacts = users.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatar: user.avatar || "",
      }));

      // NOTE: then, Sending Response
      socket.emit("getContacts", {
        success: true,
        data: contacts,
      });
      // NOTE: In case of any error response aswell
    } catch (error: any) {
      console.log("getContacts error: ", error);
      socket.emit("getContacts", {
        success: false,
        msg: "Failed to fetch contacts",
      });
    }
  });
}
