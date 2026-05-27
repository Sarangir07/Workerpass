const { Server } = require("socket.io");
const { getAllowedOrigins, isAllowedOrigin } = require("../config/cors");
const User = require("../models/user.model");
const chatService = require("../services/chat.service");
const { verifyToken } = require("../utils/authTokens");

function getToken(socket) {
  const authToken = socket.handshake.auth?.token;
  const header = socket.handshake.headers?.authorization || "";
  const [scheme, headerToken] = header.split(" ");

  if (authToken) {
    return authToken;
  }

  if (scheme === "Bearer" && headerToken) {
    return headerToken;
  }

  return null;
}

function registerChatSocket(server) {
  const io = new Server(server, {
    cors: {
      credentials: true,
      methods: ["GET", "POST"],
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`Socket.IO CORS blocked origin: ${origin}`));
      }
    }
  });

  console.log(`Socket.IO allowed origins: ${getAllowedOrigins().join(", ")}`);

  io.use(async (socket, next) => {
    try {
      const token = getToken(socket);

      if (!token) {
        return next(new Error("Authentication token is required"));
      }

      const payload = verifyToken(token);
      const user = await User.findById(payload.id);

      if (!user || !["worker", "employer"].includes(user.userType)) {
        return next(new Error("Invalid authentication token"));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error("Socket authentication failed:", error.message);
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.email}`);

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.user.email} (${reason})`);
    });

    socket.on("chat:join-room", async ({ roomId } = {}, callback) => {
      try {
        const room = await chatService.getRoomForUser(roomId, socket.user._id);
        socket.join(room._id.toString());
        callback?.({ success: true, roomId: room._id.toString() });
      } catch (error) {
        console.error("Socket join room failed:", error.message);
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("chat:leave-room", async ({ roomId } = {}, callback) => {
      try {
        const room = await chatService.getRoomForUser(roomId, socket.user._id);
        socket.leave(room._id.toString());
        callback?.({ success: true, roomId: room._id.toString() });
      } catch (error) {
        console.error("Socket leave room failed:", error.message);
        callback?.({ success: false, message: error.message });
      }
    });

    socket.on("chat:send-message", async ({ roomId, message } = {}, callback) => {
      try {
        const chatMessage = await chatService.createMessage(roomId, socket.user, message);
        io.to(chatMessage.room.toString()).emit("chat:receive-message", chatMessage);
        callback?.({ success: true, message: chatMessage });
      } catch (error) {
        console.error("Socket send message failed:", error.message);
        callback?.({ success: false, message: error.message });
      }
    });
  });

  return io;
}

module.exports = registerChatSocket;
