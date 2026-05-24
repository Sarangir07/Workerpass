export default function SectionCard({ id, title, subtitle, children, action }) {
  return (
    <section
      className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-6"
      id={id}
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight text-slate-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm leading-6 text-slate-600">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
