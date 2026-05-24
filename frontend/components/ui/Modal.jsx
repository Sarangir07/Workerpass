"use client";

import Button from "./Button";

export default function Modal({ children, open, title, onClose }) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/70 bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          <button className="rounded-lg px-2 py-1 text-sm font-black text-slate-500 hover:bg-slate-100" type="button" onClick={onClose}>
            x
          </button>
        </div>
        {children}
        <Button className="mt-5 w-full" type="button" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}
