import { API_URL } from "../../components/auth/api";

function getToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("workcred_token") || "";
}

function authHeaders(extraHeaders = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Please login before opening chat.");
  }

  return {
    Authorization: `Bearer ${token}`,
    ...extraHeaders
  };
}

async function chatRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: authHeaders(options.headers)
    });
  } catch (error) {
    throw new Error(`Cannot connect to WorkCred API at ${API_URL}. Check that the backend server is running.`);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Chat request failed");
  }

  return data;
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem("workcred_user") || "null");
  } catch (error) {
    return null;
  }
}

export function getChatRooms() {
  return chatRequest("/chat/rooms");
}

export function createChatRoom(payload) {
  return chatRequest("/chat/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function getChatMessages(roomId, page = 1, limit = 30) {
  return chatRequest(`/chat/rooms/${roomId}/messages?page=${page}&limit=${limit}`);
}

export function sendChatMessage(roomId, message) {
  return chatRequest(`/chat/rooms/${roomId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message })
  });
}

export function getAuthToken() {
  return getToken();
}
