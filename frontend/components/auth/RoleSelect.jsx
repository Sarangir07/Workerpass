const roles = [
  { value: "worker", label: "Worker", caption: "Build your verified work profile" },
  { value: "employer", label: "Employer", caption: "Hire verified skilled workers" }
];

export default function RoleSelect({ value, onChange, error }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-bold text-slate-700">Select role</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((role) => (
          <button
            className={`rounded-lg border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
              value === role.value
                ? "border-cyan-500 bg-cyan-50 shadow-cyan-900/10"
                : "border-slate-200 bg-white/75"
            }`}
            key={role.value}
            type="button"
            onClick={() => onChange(role.value)}
          >
            <span className="block text-sm font-black text-slate-950">{role.label}</span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">{role.caption}</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-rose-600">{error}</p>}
    </fieldset>
  );
}
