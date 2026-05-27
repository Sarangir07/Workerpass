"use client";

import { useMemo, useState } from "react";
import Skeleton from "../ui/Skeleton";
import ChatRoomCard from "./ChatRoomCard";
import { getConversationSearchText } from "./chatUtils";

export default function ChatSidebar({
  activeRoomId,
  connected,
  currentUser,
  loading,
  mobileOpen,
  onSelectRoom,
  onlineUsers,
  rooms,
  unreadByRoom
}) {
  const [search, setSearch] = useState("");
  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) =>
        getConversationSearchText(room, currentUser).includes(search.toLowerCase())
      ),
    [currentUser, rooms, search]
  );

  return (
    <aside className={`${mobileOpen ? "flex" : "hidden"} min-h-0 flex-col border-white/70 bg-white/75 backdrop-blur-xl md:flex md:w-[360px] md:border-r`}>
      <div className="border-b border-white/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase text-cyan-700">WorkCred chat</p>
            <h1 className="text-2xl font-black tracking-tight text-slate-950">Messages</h1>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-black ${connected ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {connected ? "Live" : "Connecting"}
          </span>
        </div>
        <div className="mt-4">
          <input
            className="h-11 w-full rounded-lg border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/70"
            placeholder="Search conversations"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
        {loading ? (
          <>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </>
        ) : filteredRooms.length ? (
          filteredRooms.map((room) => (
            <ChatRoomCard
              active={room._id === activeRoomId}
              currentUser={currentUser}
              key={room._id}
              online={Boolean(onlineUsers[getParticipantId(room, currentUser)])}
              room={room}
              unreadCount={unreadByRoom[room._id] || 0}
              onSelect={onSelectRoom}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-5 text-center">
            <p className="text-sm font-black text-slate-950">{rooms.length ? "No conversations found" : "No conversations yet"}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {currentUser?.userType === "worker"
                ? "No job applications yet. Apply for jobs to start chatting with employers."
                : "No workers have applied yet."}
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}

function getParticipantId(room, currentUser) {
  const participant = currentUser?.userType === "worker" ? room.employer : room.worker;
  return participant?._id || participant?.id || "";
}
