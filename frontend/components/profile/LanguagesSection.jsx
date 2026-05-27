"use client";

import { useState } from "react";
import { languageSuggestions } from "../../lib/profileData";
import Button from "../ui/Button";
import EmptyState from "./EmptyState";
import SectionCard from "./SectionCard";

export default function LanguagesSection({ onUpdate, profile }) {
  const [draft, setDraft] = useState({ name: "", proficiency: "Conversational" });

  function addLanguage(name = draft.name) {
    if (!name.trim()) return;
    if (profile.languages.some((item) => item.name.toLowerCase() === name.toLowerCase())) return;
    onUpdate("languages", [...profile.languages, { name, proficiency: draft.proficiency }]);
  }

  function removeLanguage(name) {
    onUpdate(
      "languages",
      profile.languages.filter((item) => item.name !== name)
    );
  }

  return (
    <SectionCard id="languages" title="Languages" subtitle="Add languages and confidence levels for better matching.">
      <div className="grid gap-4 sm:grid-cols-[1fr_220px_auto]">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Language</span>
          <input
            className="min-h-12 w-full rounded-lg border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/70"
            value={draft.name}
            onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Proficiency</span>
          <select
            className="min-h-12 w-full rounded-lg border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/70"
            value={draft.proficiency}
            onChange={(event) => setDraft((current) => ({ ...current, proficiency: event.target.value }))}
          >
            <option>Basic</option>
            <option>Conversational</option>
            <option>Fluent</option>
            <option>Native</option>
          </select>
        </label>
        <Button className="self-end" type="button" onClick={() => addLanguage()}>
          Add
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {languageSuggestions.map((item) => (
          <button
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:border-cyan-300 hover:text-cyan-800"
            key={item}
            type="button"
            onClick={() => addLanguage(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {profile.languages.length === 0 && (
          <EmptyState title="No languages added" text="Add languages you can speak at work." />
        )}
        {profile.languages.map((item) => (
          <article className="rounded-2xl border border-slate-200 bg-white/75 p-4" key={item.name}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-black text-slate-950">{item.name}</h3>
                <p className="mt-1 text-sm font-semibold text-cyan-700">{item.proficiency}</p>
              </div>
              <button className="text-sm font-black text-rose-600" type="button" onClick={() => removeLanguage(item.name)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
