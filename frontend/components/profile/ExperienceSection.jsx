"use client";

import { useState } from "react";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import EmptyState from "./EmptyState";
import ProfileTextArea from "./ProfileTextArea";
import SectionCard from "./SectionCard";

const emptyExperience = {
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  current: false,
  description: ""
};

export default function ExperienceSection({ onUpdate, profile }) {
  const [draft, setDraft] = useState(emptyExperience);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function addExperience() {
    if (!draft.company.trim() || !draft.role.trim()) return;
    onUpdate("experiences", [draft, ...profile.experiences]);
    setDraft(emptyExperience);
  }

  function removeExperience(indexToRemove) {
    onUpdate(
      "experiences",
      profile.experiences.filter((_, index) => index !== indexToRemove)
    );
  }

  return (
    <SectionCard id="experience" title="Experience" subtitle="Build a simple work history employers can scan quickly.">
      <div className="rounded-2xl border border-slate-200 bg-white/60 p-4">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            label="Company name"
            placeholder="Cafe Nova"
            value={draft.company}
            onChange={(event) => updateDraft("company", event.target.value)}
          />
          <TextField
            label="Job role"
            placeholder="Waiter"
            value={draft.role}
            onChange={(event) => updateDraft("role", event.target.value)}
          />
          <TextField
            label="Start date"
            type="month"
            value={draft.startDate}
            onChange={(event) => updateDraft("startDate", event.target.value)}
          />
          <TextField
            disabled={draft.current}
            label="End date"
            type="month"
            value={draft.endDate}
            onChange={(event) => updateDraft("endDate", event.target.value)}
          />
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-600">
          <input
            checked={draft.current}
            className="h-4 w-4 rounded border-slate-300"
            type="checkbox"
            onChange={(event) => updateDraft("current", event.target.checked)}
          />
          Currently working here
        </label>
        <div className="mt-4">
          <ProfileTextArea
            label="Description"
            placeholder="Responsibilities, achievements, or tools used."
            value={draft.description}
            onChange={(event) => updateDraft("description", event.target.value)}
          />
        </div>
        <Button className="mt-4" type="button" onClick={addExperience}>
          Add experience
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {profile.experiences.length === 0 && (
          <EmptyState title="No experience added" text="Add your first job or work assignment to build trust." />
        )}
        {profile.experiences.map((item, index) => (
          <article className="relative rounded-2xl border border-slate-200 bg-white/75 p-5" key={`${item.company}-${index}`}>
            <div className="absolute left-5 top-6 h-3 w-3 rounded-full bg-cyan-500" />
            <div className="pl-7">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-black text-slate-950">{item.role}</h3>
                  <p className="text-sm font-bold text-slate-500">{item.company}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">
                    {item.startDate || "Start"} - {item.current ? "Present" : item.endDate || "End"}
                  </p>
                </div>
                <button className="text-sm font-black text-rose-600" type="button" onClick={() => removeExperience(index)}>
                  Remove
                </button>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
