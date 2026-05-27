export default function TypingIndicator({ visible }) {
  if (!visible) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-500">
      <span className="flex h-8 items-center gap-1 rounded-full bg-white/85 px-3 shadow-sm">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:120ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:240ms]" />
      </span>
      typing
    </div>
  );
}
