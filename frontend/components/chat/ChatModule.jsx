"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Toast from "../ui/Toast";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import ImagePreviewModal from "./ImagePreviewModal";
import { getChatMessages, getChatRooms, getStoredUser, sendChatMessage } from "../../services/chat/api";
import useChatSocket from "../../hooks/useChatSocket";
import { sortRooms } from "./chatUtils";

const PAGE_SIZE = 30;

export default function ChatModule() {
  const router = useRouter();
  const params = useParams();
  const activeRoomId = typeof params?.roomId === "string" ? params.roomId : "";
  const initialRouteRoomIdRef = useRef(activeRoomId);
  const hasAutoSelectedRoomRef = useRef(Boolean(activeRoomId));
  const [currentUser, setCurrentUser] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [messagesByRoom, setMessagesByRoom] = useState({});
  const [pageByRoom, setPageByRoom] = useState({});
  const [hasMoreByRoom, setHasMoreByRoom] = useState({});
  const [unreadByRoom, setUnreadByRoom] = useState({});
  const [onlineUsers, setOnlineUsers] = useState({});
  const [typingByRoom, setTypingByRoom] = useState({});
  const [attachment, setAttachment] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [mobileListOpen, setMobileListOpen] = useState(!activeRoomId);

  const activeRoom = useMemo(() => rooms.find((room) => room._id === activeRoomId), [activeRoomId, rooms]);
  const activeMessages = messagesByRoom[activeRoomId] || [];

  const handleIncomingMessage = useCallback(
    (message) => {
      const roomId = message.room;

      setMessagesByRoom((current) => {
        const roomMessages = current[roomId] || [];

        if (roomMessages.some((item) => item._id === message._id)) {
          return current;
        }

        return {
          ...current,
          [roomId]: [...roomMessages, message]
        };
      });

      setRooms((current) =>
        sortRooms(
          current.map((room) =>
            room._id === roomId
              ? {
                  ...room,
                  lastMessage: message,
                  lastMessageAt: message.createdAt,
                  updatedAt: message.createdAt
                }
              : room
          )
        )
      );

      if (roomId !== activeRoomId) {
        setUnreadByRoom((current) => ({ ...current, [roomId]: (current[roomId] || 0) + 1 }));
        setToastType("success");
        setToast(`New message: ${message.message}`);
      }
    },
    [activeRoomId]
  );

  const { connected, emitTyping, sendSocketMessage } = useChatSocket({
    activeRoomId,
    onIncomingMessage: handleIncomingMessage,
    onStatusChange: (payload) => {
      if (payload?.userId) {
        setOnlineUsers((current) => ({ ...current, [payload.userId]: payload.online }));
      }
    },
    onTyping: (payload) => {
      if (payload?.roomId) {
        setTypingByRoom((current) => ({ ...current, [payload.roomId]: payload.isTyping }));
      }
    }
  });

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  useEffect(() => {
    if (activeRoomId) {
      setAttachment(null);
      setMobileListOpen(false);
      setUnreadByRoom((current) => ({ ...current, [activeRoomId]: 0 }));
    }
  }, [activeRoomId]);

  useEffect(() => {
    let mounted = true;

    async function loadRooms() {
      try {
        setLoadingRooms(true);
        const data = await getChatRooms();

        if (!mounted) return;

        const sortedRooms = sortRooms(data);
        setRooms(sortedRooms);

        if (!initialRouteRoomIdRef.current && !hasAutoSelectedRoomRef.current && sortedRooms[0]?._id) {
          hasAutoSelectedRoomRef.current = true;
          router.replace(`/chat/${sortedRooms[0]._id}`);
        }
      } catch (error) {
        if (mounted) {
          setToastType("error");
          setToast(error.message);
        }
      } finally {
        if (mounted) {
          setLoadingRooms(false);
        }
      }
    }

    loadRooms();
    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!activeRoomId || messagesByRoom[activeRoomId]) {
      return;
    }

    loadMessages(activeRoomId, 1);
  }, [activeRoomId, messagesByRoom]);

  async function loadMessages(roomId, page) {
    try {
      setLoadingMessages(true);
      const data = await getChatMessages(roomId, page, PAGE_SIZE);

      setMessagesByRoom((current) => ({
        ...current,
        [roomId]: page === 1 ? data : [...data, ...(current[roomId] || [])]
      }));
      setPageByRoom((current) => ({ ...current, [roomId]: page }));
      setHasMoreByRoom((current) => ({ ...current, [roomId]: data.length === PAGE_SIZE }));
    } catch (error) {
      setToastType("error");
      setToast(error.message);
    } finally {
      setLoadingMessages(false);
    }
  }

  function selectRoom(room) {
    if (room._id === activeRoomId) {
      setMobileListOpen(false);
      return;
    }

    setAttachment(null);
    setMobileListOpen(false);
    setUnreadByRoom((current) => ({ ...current, [room._id]: 0 }));
    router.push(`/chat/${room._id}`);
  }

  async function sendMessage(draft, file) {
    if (!activeRoomId) {
      return;
    }

    const attachmentText = file ? `\n\nAttachment ready: ${file.name}` : "";
    const messageText = `${draft.trim()}${attachmentText}`.trim();

    if (!messageText) {
      return;
    }

    try {
      setSending(true);
      await new Promise((resolve, reject) => {
        sendSocketMessage(activeRoomId, messageText, async (result) => {
          try {
            if (result?.success) {
              setAttachment(null);
              resolve();
              return;
            }

            const fallbackMessage = await sendChatMessage(activeRoomId, messageText);
            handleIncomingMessage(fallbackMessage);
            setAttachment(null);
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      setToastType("error");
      setToast(error.message);
    } finally {
      setSending(false);
    }
  }

  function handleDraft(value) {
    emitTyping(activeRoomId, Boolean(value.trim()));
  }

  const hasMore = Boolean(hasMoreByRoom[activeRoomId]);
  const activeParticipantId = activeRoom
    ? currentUser?.userType === "worker"
      ? activeRoom.employer?._id
      : activeRoom.worker?._id
    : "";

  return (
    <main className="h-screen overflow-hidden bg-[linear-gradient(135deg,#eef7fb_0%,#f8fafc_48%,#eef2ff_100%)]">
      <Toast message={toast} type={toastType} />
      <div className="mx-auto flex h-full max-w-7xl overflow-hidden border-x border-white/70 bg-white/35 shadow-2xl shadow-slate-900/10">
        <ChatSidebar
          activeRoomId={activeRoomId}
          connected={connected}
          currentUser={currentUser}
          loading={loadingRooms}
          mobileOpen={mobileListOpen}
          onlineUsers={onlineUsers}
          rooms={rooms}
          unreadByRoom={unreadByRoom}
          onSelectRoom={selectRoom}
        />

        <div className={`${mobileListOpen ? "hidden" : "flex"} min-w-0 flex-1 flex-col md:flex`}>
          <ChatWindow
            attachment={attachment}
            currentUser={currentUser}
            hasMore={hasMore}
            loadingMessages={loadingMessages}
            messages={activeMessages}
            online={Boolean(onlineUsers[activeParticipantId])}
            room={activeRoom}
            sending={sending}
            typing={Boolean(typingByRoom[activeRoomId])}
            onAttachment={setAttachment}
            onBack={() => setMobileListOpen(true)}
            onLoadOlder={() => loadMessages(activeRoomId, (pageByRoom[activeRoomId] || 1) + 1)}
            onMessageDraft={handleDraft}
            onOpenImage={setPreviewImage}
            onSend={sendMessage}
          />
        </div>
      </div>
      <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
    </main>
  );
}
