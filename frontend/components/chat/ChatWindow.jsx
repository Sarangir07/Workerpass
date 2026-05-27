"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../ui/Button";
import ChatMessageBubble from "./ChatMessageBubble";
import { formatDateDivider, getConversationDisplay, getInitials, getUserId, groupMessagesByDate } from "./chatUtils";
import EmptyChatState from "./EmptyChatState";
import FileUploadPreview from "./FileUploadPreview";
import OnlineStatusBadge from "./OnlineStatusBadge";
import TypingIndicator from "./TypingIndicator";

export default function ChatWindow({
  attachment,
  currentUser,
  hasMore,
  loadingMessages,
  messages,
  onAttachment,
  onBack,
  onLoadOlder,
  onMessageDraft,
  onOpenImage,
  onSend,
  online,
  room,
  sending,
  typing
}) {
  const [draft, setDraft] = useState("");
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, room?._id, typing]);

  if (!room) {
    return <EmptyChatState userType={currentUser?.userType} />;
  }

  const display = getConversationDisplay(room, currentUser);

  function submitMessage(event) {
    event?.preventDefault();

    if (!draft.trim() && !attachment) {
      return;
    }

    onSend(draft, attachment);
    setDraft("");
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-white/45">
      <header className="flex items-center gap-3 border-b border-white/70 bg-white/80 p-3 backdrop-blur-xl sm:p-4">
        <button className="rounded-lg px-3 py-2 text-sm font-black text-slate-600 hover:bg-slate-100 md:hidden" type="button" onClick={onBack}>
          Back
        </button>
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
          <span className={`absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white ${online ? "bg-emerald-500" : "bg-slate-300"}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-black text-slate-950">{display.title}</h2>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="truncate text-xs font-bold text-slate-500">{display.subtitle}</span>
            <OnlineStatusBadge online={online} />
          </div>
        </div>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,#e7fbff_0,#f8fafc_42%,#eef2ff_100%)] p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {hasMore && (
            <div className="text-center">
              <button
                className="rounded-full border border-slate-200 bg-white/85 px-4 py-2 text-xs font-black text-slate-600 shadow-sm hover:bg-white"
                disabled={loadingMessages}
                type="button"
                onClick={onLoadOlder}
              >
                {loadingMessages ? "Loading..." : "Load older messages"}
              </button>
            </div>
          )}

          {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
            <div className="space-y-3" key={dateKey}>
              <div className="sticky top-0 z-10 text-center">
                <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-black uppercase text-slate-500 shadow-sm">
                  {formatDateDivider(dateMessages[0]?.createdAt)}
                </span>
              </div>
              {dateMessages.map((message) => {
                const mine = getUserId(message.sender) === getUserId(currentUser) || String(message.sender) === getUserId(currentUser);
                return (
                  <button
                    className="block w-full text-left"
                    key={message._id || message.localId}
                    type="button"
                    onClick={() => message.attachment?.type?.startsWith("image/") && onOpenImage(message.attachment)}
                  >
                    <ChatMessageBubble message={message} mine={mine} />
                  </button>
                );
              })}
            </div>
          ))}
          <TypingIndicator visible={typing} />
        </div>
      </div>

      <FileUploadPreview file={attachment} onClear={() => onAttachment(null)} />

      <form className="border-t border-white/70 bg-white/85 p-3 backdrop-blur-xl" onSubmit={submitMessage}>
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <input
            ref={fileInputRef}
            className="hidden"
            type="file"
            onChange={(event) => onAttachment(event.target.files?.[0] || null)}
          />
          <button
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-600 shadow-sm hover:bg-slate-50"
            title="Attach file"
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            +
          </button>
          <button
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-sm font-black text-slate-600 shadow-sm hover:bg-slate-50"
            title="Emoji"
            type="button"
          >
            :)
          </button>
          <textarea
            className="max-h-32 min-h-11 flex-1 resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/70"
            placeholder="Write a message"
            rows={1}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              onMessageDraft(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submitMessage();
              }
            }}
          />
          <Button className="h-11 min-h-11 shrink-0 px-4" disabled={!draft.trim() && !attachment} loading={sending} type="submit">
            Send
          </Button>
        </div>
      </form>
    </section>
  );
}
