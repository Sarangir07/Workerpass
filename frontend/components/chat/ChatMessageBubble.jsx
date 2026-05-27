import { formatMessageTime } from "./chatUtils";

export default function ChatMessageBubble({ message, mine }) {
  const hasAttachment = message.attachment;

  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[68%] ${
          mine
            ? "rounded-br-md bg-slate-950 text-white shadow-slate-950/15"
            : "rounded-bl-md border border-white/80 bg-white/90 text-slate-900"
        }`}
      >
        {hasAttachment && (
          <div className={`mb-2 overflow-hidden rounded-xl ${mine ? "bg-white/10" : "bg-slate-100"}`}>
            {message.attachment.type?.startsWith("image/") ? (
              <img alt={message.attachment.name} className="max-h-64 w-full object-cover" src={message.attachment.url} />
            ) : (
              <div className="p-3 text-sm font-black">{message.attachment.name}</div>
            )}
          </div>
        )}
        <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.message}</p>
        <div className={`mt-1 flex items-center justify-end gap-1 text-[11px] font-bold ${mine ? "text-slate-300" : "text-slate-400"}`}>
          <span>{formatMessageTime(message.createdAt)}</span>
          {mine && <span>{message.readAt ? "Seen" : "Sent"}</span>}
        </div>
      </div>
    </div>
  );
}
