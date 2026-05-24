export default function AuthCard({ children, eyebrow, title, subtitle }) {
  return (
    <section className="w-full rounded-2xl border border-white/70 bg-white/75 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-7">
      <div className="mb-6">
        {eyebrow && <p className="mb-2 text-sm font-black uppercase text-cyan-700">{eyebrow}</p>}
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
