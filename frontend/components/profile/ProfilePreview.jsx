import { availabilityOptions, workerCategories } from "../../lib/profileData";
import SectionCard from "./SectionCard";

export default function ProfilePreview({ completion, profile }) {
  const category = workerCategories.find((item) => item.id === profile.category);
  const availability = availabilityOptions.find((item) => item.id === profile.availability);

  return (
    <SectionCard id="preview" title="Public Profile Preview" subtitle="A polished preview of what employers will scan.">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="bg-slate-950 p-6 text-white">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-cyan-300 to-emerald-300 text-2xl font-black text-slate-950">
              {profile.fullName
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-2xl font-black">{profile.fullName || "Worker name"}</h3>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black text-emerald-200">
                  Verified
                </span>
              </div>
              <p className="mt-1 text-slate-300">{category?.label || "Worker"} in {profile.address || "your city"}</p>
              <p className="mt-3 text-sm font-bold text-cyan-200">Rating placeholder: 4.8 / 5.0</p>
            </div>
          </div>
        </div>
        <div className="grid gap-5 p-6 lg:grid-cols-[1fr_260px]">
          <div>
            <p className="text-sm leading-6 text-slate-600">{profile.bio}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {profile.skills.slice(0, 6).map((skill) => (
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-800" key={skill}>
                  {skill}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-black text-slate-900">Experience summary</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {profile.experiences.length} role{profile.experiences.length === 1 ? "" : "s"} added, with{" "}
                {profile.experienceLevel.toLowerCase()} skill confidence.
              </p>
            </div>
          </div>
          <aside className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-500">Profile completion</p>
            <p className="mt-2 text-3xl font-black text-slate-950">{completion}%</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${completion}%` }} />
            </div>
            <p className="mt-5 text-sm font-bold text-slate-500">Availability</p>
            <p className="mt-1 font-black text-slate-950">{availability?.label}</p>
          </aside>
        </div>
      </div>
    </SectionCard>
  );
}
