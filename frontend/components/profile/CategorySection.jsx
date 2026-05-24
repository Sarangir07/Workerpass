"use client";

import { workerCategories } from "../../lib/profileData";
import SectionCard from "./SectionCard";

export default function CategorySection({ onUpdate, profile }) {
  return (
    <SectionCard id="category" title="Worker Category" subtitle="Choose the strongest category for your public profile.">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {workerCategories.map((category) => (
          <button
            className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
              profile.category === category.id
                ? "border-slate-950 bg-slate-950 text-white shadow-xl shadow-slate-950/20"
                : "border-slate-200 bg-white/75 text-slate-950"
            }`}
            key={category.id}
            type="button"
            onClick={() => onUpdate("category", category.id)}
          >
            <span className="block text-base font-black">{category.label}</span>
            <span className={`mt-2 block text-sm ${profile.category === category.id ? "text-slate-300" : "text-slate-500"}`}>
              {category.detail}
            </span>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
