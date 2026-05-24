"use client";

import { useState } from "react";
import { suggestedSkills } from "../../lib/profileData";
import Button from "../ui/Button";
import TextField from "../ui/TextField";
import SectionCard from "./SectionCard";

export default function SkillsSection({ onUpdate, profile }) {
  const [skill, setSkill] = useState("");

  function addSkill(nextSkill) {
    const cleanSkill = nextSkill.trim();
    if (!cleanSkill || profile.skills.includes(cleanSkill)) return;
    onUpdate("skills", [...profile.skills, cleanSkill]);
    setSkill("");
  }

  function removeSkill(skillToRemove) {
    onUpdate(
      "skills",
      profile.skills.filter((item) => item !== skillToRemove)
    );
  }

  return (
    <SectionCard id="skills" title="Skills" subtitle="Show employers what you can do on day one.">
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <TextField
          label="Add skill"
          placeholder="Example: Baking"
          value={skill}
          onChange={(event) => setSkill(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addSkill(skill);
            }
          }}
        />
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Experience level</span>
          <select
            className="min-h-12 w-full rounded-lg border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/70"
            value={profile.experienceLevel}
            onChange={(event) => onUpdate("experienceLevel", event.target.value)}
          >
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Experienced</option>
            <option>Expert</option>
          </select>
        </label>
      </div>
      <Button className="mt-3" type="button" variant="soft" onClick={() => addSkill(skill)}>
        Add skill
      </Button>

      <div className="mt-5 flex flex-wrap gap-2">
        {profile.skills.map((item) => (
          <span
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white shadow-md"
            key={item}
          >
            {item}
            <button className="text-slate-300 hover:text-white" type="button" onClick={() => removeSkill(item)}>
              x
            </button>
          </span>
        ))}
      </div>

      <div className="mt-5">
        <p className="mb-3 text-sm font-black text-slate-700">Suggested skills</p>
        <div className="flex flex-wrap gap-2">
          {suggestedSkills.map((item) => (
            <button
              className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-bold text-slate-600 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:text-cyan-800"
              key={item}
              type="button"
              onClick={() => addSkill(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
