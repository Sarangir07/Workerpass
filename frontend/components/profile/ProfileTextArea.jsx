export default function ProfileTextArea({ error, label, helper, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <textarea
        className={`min-h-28 w-full resize-y rounded-lg border bg-white/85 px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
          error
            ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200/70"
            : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-200/70"
        }`}
        {...props}
      />
      {error && <span className="mt-2 block text-sm font-semibold text-rose-600">{error}</span>}
      {!error && helper && <span className="mt-2 block text-sm text-slate-500">{helper}</span>}
    </label>
  );
}
