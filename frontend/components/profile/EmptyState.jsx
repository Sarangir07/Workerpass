export default function EmptyState({ title, text }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-center">
      <p className="text-sm font-black text-slate-800">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}
