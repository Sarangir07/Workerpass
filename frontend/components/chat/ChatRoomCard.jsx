import { formatChatTime, getConversationDisplay, getInitials, getRoomLastMessage } from "./chatUtils";
import OnlineStatusBadge from "./OnlineStatusBadge";

export default function ChatRoomCard({ active, currentUser, onSelect, online, room, unreadCount = 0 }) {
  const display = getConversationDisplay(room, currentUser);

  return (
    <button
      className={`group grid w-full grid-cols-[48px_1fr] gap-3 rounded-xl p-3 text-left transition ${
        active
          ? "bg-slate-950 text-white shadow-xl shadow-slate-950/20"
          : "bg-white/70 text-slate-950 hover:-translate-y-0.5 hover:bg-white hover:shadow-lg"
      }`}
      type="button"
      onClick={() => onSelect(room)}
    >
      <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-gradient-to-br from-cyan-500 to-slate-900 text-white">
        {display.image ? (
          <img
            alt={display.title}
            className="h-full w-full object-cover"
            src={display.image}
          />
        ) : (
          <span className="grid h-full w-full place-items-center text-sm font-black">{getInitials(display.fallbackName)}</span>
        )}
        <span className={`absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 ${active ? "border-slate-950" : "border-white"} ${online ? "bg-emerald-500" : "bg-slate-300"}`} />
      </div>

      <span className="min-w-0">
        <span className="flex items-start justify-between gap-2">
          <span className={`truncate text-sm font-black ${active ? "text-white" : "text-slate-950"}`}>
            {display.title}
          </span>
          <span className={`shrink-0 text-[11px] font-black ${active ? "text-slate-300" : "text-slate-400"}`}>
            {formatChatTime(room.lastMessageAt || room.updatedAt)}
          </span>
        </span>
        <span className={`mt-1 line-clamp-1 block text-xs font-semibold ${active ? "text-slate-300" : "text-slate-500"}`}>
          {display.subtitle}
        </span>
        <span className={`mt-1 line-clamp-1 block text-xs font-semibold ${active ? "text-slate-400" : "text-slate-500"}`}>
          {getRoomLastMessage(room)}
        </span>
        <span className="mt-2 flex items-center justify-between gap-2">
          <OnlineStatusBadge online={online} />
          {unreadCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-cyan-500 px-1.5 text-[11px] font-black text-white">
              {unreadCount}
            </span>
          )}
        </span>
      </span>
    </button>
  );
}
