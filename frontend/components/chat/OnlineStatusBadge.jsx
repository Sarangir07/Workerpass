export default function OnlineStatusBadge({ lastSeen, online }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-black text-slate-500">
      <span className={`h-2.5 w-2.5 rounded-full ${online ? "bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.16)]" : "bg-slate-300"}`} />
      {online ? "Online" : lastSeen ? `Last seen ${lastSeen}` : "Offline"}
    </span>
  );
}
