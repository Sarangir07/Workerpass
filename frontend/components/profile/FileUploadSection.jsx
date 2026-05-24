"use client";

import { useRef, useState } from "react";
import Button from "../ui/Button";
import SectionCard from "./SectionCard";

export default function FileUploadSection({ onUpdate, profile }) {
  const [photoPreview, setPhotoPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const photoInputRef = useRef(null);
  const resumeInputRef = useRef(null);

  function simulateProgress() {
    setProgress(20);
    setTimeout(() => setProgress(68), 180);
    setTimeout(() => setProgress(100), 420);
  }

  function handlePhoto(file) {
    if (!file) return;
    onUpdate("photo", file);
    setPhotoPreview(URL.createObjectURL(file));
    simulateProgress();
  }

  function handleResume(file) {
    if (!file) return;
    onUpdate("resume", file);
    simulateProgress();
  }

  function dropPhoto(event) {
    event.preventDefault();
    handlePhoto(event.dataTransfer.files?.[0]);
  }

  return (
    <SectionCard id="uploads" title="Profile Files" subtitle="Add a professional photo and resume for faster verification.">
      <div className="grid gap-5 lg:grid-cols-2">
        <div
          className="rounded-2xl border border-dashed border-cyan-300 bg-cyan-50/60 p-5 text-center transition hover:bg-cyan-50"
          role="button"
          tabIndex={0}
          onClick={() => photoInputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={dropPhoto}
        >
          <input
            accept="image/*"
            className="hidden"
            ref={photoInputRef}
            type="file"
            onChange={(event) => handlePhoto(event.target.files?.[0])}
          />
          <div className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-2xl bg-white shadow-inner">
            {photoPreview ? (
              <img alt="Profile preview" className="h-full w-full object-cover" src={photoPreview} />
            ) : (
              <span className="text-sm font-black text-slate-400">Photo</span>
            )}
          </div>
          <p className="mt-4 text-sm font-black text-slate-800">Drag and drop profile photo</p>
          <p className="mt-1 text-sm text-slate-500">JPG, PNG, or WEBP</p>
          {profile.photo && (
            <div className="mt-4 flex justify-center gap-2">
              <Button type="button" variant="secondary" onClick={() => photoInputRef.current?.click()}>
                Edit
              </Button>
              <Button
                type="button"
                variant="soft"
                onClick={(event) => {
                  event.stopPropagation();
                  onUpdate("photo", null);
                  setPhotoPreview("");
                }}
              >
                Remove
              </Button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
          <input
            accept=".pdf,.doc,.docx"
            className="hidden"
            ref={resumeInputRef}
            type="file"
            onChange={(event) => handleResume(event.target.files?.[0])}
          />
          <div className="rounded-xl bg-slate-950 p-5 text-white">
            <p className="text-sm font-black text-cyan-200">Resume</p>
            <h3 className="mt-6 text-xl font-black">{profile.resume?.name || "No resume uploaded"}</h3>
            <p className="mt-2 text-sm text-slate-300">PDF, DOC, or DOCX preview card</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Button type="button" onClick={() => resumeInputRef.current?.click()}>
              {profile.resume ? "Replace resume" : "Upload resume"}
            </Button>
            <Button disabled={!profile.resume} type="button" variant="secondary">
              Download
            </Button>
          </div>
        </div>
      </div>

      {progress > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
            <span>Upload progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-cyan-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </SectionCard>
  );
}
