import { io } from "socket.io-client";
import { API_URL } from "../../components/auth/api";
import { getAuthToken } from "../../services/chat/api";

let socket;

function getSocketUrl() {
  return API_URL.replace(/\/api\/?$/, "");
}

export function getChatSocket() {
  const token = getAuthToken();

  if (!token) {
    return null;
  }

  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: false,
      auth: { token },
      transports: ["websocket", "polling"]
    });
  }

  socket.auth = { token };
  return socket;
}

export function disconnectChatSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
