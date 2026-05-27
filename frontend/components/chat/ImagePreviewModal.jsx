export default function ImagePreviewModal({ image, onClose }) {
  if (!image) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl rounded-2xl border border-white/20 bg-white p-3 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="truncate text-sm font-black text-slate-950">{image.name || "Image preview"}</p>
          <button className="rounded-lg px-3 py-2 text-sm font-black text-slate-500 hover:bg-slate-100" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <img alt={image.name || "Preview"} className="max-h-[74vh] w-full rounded-xl object-contain" src={image.url} />
      </div>
    </div>
  );
}
