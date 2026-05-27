"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { getChatSocket } from "../lib/socket/chatSocket";

export default function useChatSocket({ activeRoomId, onIncomingMessage, onStatusChange, onTyping }) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const joinedRoomRef = useRef("");

  const handlers = useMemo(
    () => ({
      onIncomingMessage,
      onStatusChange,
      onTyping
    }),
    [onIncomingMessage, onStatusChange, onTyping]
  );

  useEffect(() => {
    const socket = getChatSocket();

    if (!socket) {
      return undefined;
    }

    socketRef.current = socket;

    function handleConnect() {
      setConnected(true);
    }

    function handleDisconnect() {
      setConnected(false);
    }

    function handleMessage(message) {
      handlers.onIncomingMessage?.(message);
    }

    function handleStatus(payload) {
      handlers.onStatusChange?.(payload);
    }

    function handleTyping(payload) {
      handlers.onTyping?.(payload);
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("chat:receive-message", handleMessage);
    socket.on("user:status", handleStatus);
    socket.on("chat:typing", handleTyping);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("chat:receive-message", handleMessage);
      socket.off("user:status", handleStatus);
      socket.off("chat:typing", handleTyping);
    };
  }, [handlers]);

  useEffect(() => {
    const socket = socketRef.current;

    if (!socket || !activeRoomId) {
      return;
    }

    if (joinedRoomRef.current && joinedRoomRef.current !== activeRoomId) {
      socket.emit("chat:leave-room", { roomId: joinedRoomRef.current });
    }

    socket.emit("chat:join-room", { roomId: activeRoomId });
    joinedRoomRef.current = activeRoomId;
  }, [activeRoomId]);

  function sendSocketMessage(roomId, message, callback) {
    const socket = socketRef.current;

    if (!socket?.connected) {
      callback?.({ success: false, message: "Socket is not connected" });
      return;
    }

    socket.emit("chat:send-message", { roomId, message }, callback);
  }

  function emitTyping(roomId, isTyping) {
    const socket = socketRef.current;

    if (socket?.connected && roomId) {
      socket.emit("chat:typing", { roomId, isTyping });
    }
  }

  return {
    connected,
    emitTyping,
    sendSocketMessage
  };
}
