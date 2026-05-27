require("dotenv").config();

const http = require("http");
const app = require("./app");
const connectDatabase = require("./config/database");
const registerChatSocket = require("./sockets/chat.socket");
const ensureChatRoomIndexes = require("./utils/chatIndexes");

const port = process.env.PORT || 5000;
const server = http.createServer(app);

server.on("error", (error) => {
  console.error("HTTP server error:", error.message);
});

const io = registerChatSocket(server);
io.engine.on("connection_error", (error) => {
  console.error("Socket.IO connection error:", error.message);
});

connectDatabase()
  .then(async () => {
    try {
      await ensureChatRoomIndexes();
    } catch (error) {
      console.error("Chat index setup failed:", error.message);
    }
  })
  .then(() => {
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`API health check: http://localhost:${port}/`);
      console.log(`Auth login endpoint: http://localhost:${port}/api/auth/login`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
