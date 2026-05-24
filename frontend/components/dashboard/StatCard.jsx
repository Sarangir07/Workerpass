export default function StatCard({ label, value, tone = "cyan" }) {
  const tones = {
    cyan: "from-cyan-50 to-white text-cyan-800",
    emerald: "from-emerald-50 to-white text-emerald-800",
    amber: "from-amber-50 to-white text-amber-800",
    slate: "from-slate-100 to-white text-slate-800"
  };

  return (
    <article className={`rounded-2xl border border-white/70 bg-gradient-to-br p-5 shadow-lg shadow-slate-900/5 ${tones[tone]}`}>
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
    </article>
  );
}
