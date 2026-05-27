export default function FileUploadPreview({ file, onClear }) {
  if (!file) {
    return null;
  }

  const isImage = file.type?.startsWith("image/");
  const previewUrl = isImage ? URL.createObjectURL(file) : "";

  return (
    <div className="border-t border-white/70 bg-white/80 p-3">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-lg bg-slate-950 text-xs font-black text-white">
          {isImage ? <img alt={file.name} className="h-full w-full object-cover" src={previewUrl} /> : "FILE"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-950">{file.name}</p>
          <p className="text-xs font-bold text-slate-500">{Math.ceil(file.size / 1024)} KB ready to attach</p>
        </div>
        <button className="rounded-lg px-3 py-2 text-xs font-black text-slate-500 hover:bg-white" type="button" onClick={onClear}>
          Remove
        </button>
      </div>
    </div>
  );
}
