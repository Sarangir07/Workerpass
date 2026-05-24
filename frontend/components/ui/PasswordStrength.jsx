export default function PasswordStrength({ password }) {
  const score = getScore(password);
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];
  const colors = ["bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-cyan-500", "bg-emerald-500"];

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            className={`h-2 rounded-full ${index <= score ? colors[score] : "bg-slate-200"}`}
            key={index}
          />
        ))}
      </div>
      <p className="text-sm font-semibold text-slate-600">{labels[score]}</p>
    </div>
  );
}

function getScore(password = "") {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  return Math.min(score, 4);
}
