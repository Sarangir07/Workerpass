export default function Toast({ message, type = "success" }) {
  if (!message) {
    return null;
  }

  const isError = type === "error";

  return (
    <div
      className={`toast-in fixed right-4 top-4 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm font-bold shadow-xl backdrop-blur ${
        isError
          ? "border-rose-200 bg-rose-50/95 text-rose-700"
          : "border-emerald-200 bg-emerald-50/95 text-emerald-700"
      }`}
      role="status"
    >
      {message}
    </div>
  );
}
