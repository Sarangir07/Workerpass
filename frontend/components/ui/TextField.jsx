export default function TextField({
  error,
  label,
  rightSlot,
  helper,
  className = "",
  ...props
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <span className="relative block">
        <input
          className={`min-h-12 w-full rounded-lg border bg-white/85 px-4 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
            error
              ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200/70"
              : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-200/70"
          } ${rightSlot ? "pr-12" : ""}`}
          {...props}
        />
        {rightSlot && <span className="absolute inset-y-0 right-2 flex items-center">{rightSlot}</span>}
      </span>
      {error && <span className="mt-2 block text-sm font-semibold text-rose-600">{error}</span>}
      {!error && helper && <span className="mt-2 block text-sm text-slate-500">{helper}</span>}
    </label>
  );
}
