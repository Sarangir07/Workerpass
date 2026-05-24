"use client";

import { availabilityOptions } from "../../lib/profileData";
import SectionCard from "./SectionCard";

export default function AvailabilitySection({ onUpdate, profile }) {
  const selected = availabilityOptions.find((item) => item.id === profile.availability);

  return (
    <SectionCard
      id="availability"
      title="Availability Status"
      subtitle="Let employers know whether they can contact you right now."
      action={
        <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
          {selected?.badge}
        </span>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {availabilityOptions.map((item) => (
          <button
            className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
              profile.availability === item.id
                ? "border-cyan-400 bg-cyan-50 shadow-cyan-900/10"
                : "border-slate-200 bg-white/75"
            }`}
            key={item.id}
            type="button"
            onClick={() => onUpdate("availability", item.id)}
          >
            <span className="block text-sm font-black text-slate-950">{item.label}</span>
            <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500">
              {item.badge}
            </span>
          </button>
        ))}
      </div>
    </SectionCard>
  );
}
