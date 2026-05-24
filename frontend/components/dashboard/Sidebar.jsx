const navItems = [
  ["overview", "Overview"],
  ["details", "Personal"],
  ["skills", "Skills"],
  ["experience", "Experience"],
  ["languages", "Languages"],
  ["uploads", "Uploads"],
  ["availability", "Availability"],
  ["preview", "Preview"]
];

export default function Sidebar({ activeSection, onSelect }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-white/70 bg-white/75 p-3 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {navItems.map(([id, label]) => (
            <button
              className={`whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm font-black transition ${
                activeSection === id
                  ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20"
                  : "text-slate-600 hover:bg-white hover:text-slate-950"
              }`}
              key={id}
              type="button"
              onClick={() => onSelect(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
