const styles = {
  error: "border-rose-200 bg-rose-50 text-rose-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  info: "border-cyan-200 bg-cyan-50 text-cyan-800"
};

export default function Alert({ children, type = "info" }) {
  if (!children) {
    return null;
  }

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm font-semibold ${styles[type]}`}>
      {children}
    </div>
  );
}
