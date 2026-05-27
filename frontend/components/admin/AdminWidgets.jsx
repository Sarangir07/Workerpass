"use client";

import {
  AlertTriangle,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Eye,
  Lock,
  Search,
  Trash2,
  Users
} from "lucide-react";

export const statIcons = {
  totalUsers: Users,
  totalWorkers: BadgeCheck,
  totalEmployers: Building2,
  totalJobs: BriefcaseBusiness,
  pendingVerifications: AlertTriangle
};

export function AdminStatCard({ label, value, icon: Icon = Users, gradient = "from-cyan-400 to-emerald-300" }) {
  return (
    <article className="group rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/[0.09]">
      <div className={`grid h-12 w-12 place-items-center rounded-lg bg-gradient-to-br ${gradient} text-slate-950 shadow-lg`}>
        <Icon size={22} />
      </div>
      <p className="mt-5 text-sm font-bold text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-black text-white">{value}</p>
    </article>
  );
}

export function StatusBadge({ value = "Active" }) {
  const normalized = String(value || "Active").toLowerCase();
  const tone =
    normalized.includes("reject") || normalized.includes("block")
      ? "border-red-300/30 bg-red-400/10 text-red-100"
      : normalized.includes("pending")
        ? "border-amber-300/30 bg-amber-300/10 text-amber-100"
        : "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${tone}`}>{value}</span>;
}

export function AdminToolbar({ search, onSearch, filter, onFilter, filters = [] }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex h-11 flex-1 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm text-slate-300">
        <Search size={18} className="text-slate-500" />
        <input
          className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
          placeholder="Search records"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </label>
      {filters.length > 0 && (
        <select
          className="h-11 rounded-lg border border-white/10 bg-slate-900 px-4 text-sm font-bold text-slate-100 outline-none transition hover:border-cyan-300/50"
          value={filter}
          onChange={(event) => onFilter(event.target.value)}
        >
          {filters.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

export function ActionButtons({ approve = false }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 text-slate-100 transition hover:bg-cyan-300 hover:text-slate-950" title="View" type="button">
        <Eye size={16} />
      </button>
      {approve ? (
        <>
          <button className="rounded-lg bg-emerald-300 px-3 py-2 text-xs font-black text-slate-950 transition hover:-translate-y-0.5" type="button">
            Approve
          </button>
          <button className="rounded-lg bg-red-400 px-3 py-2 text-xs font-black text-white transition hover:-translate-y-0.5" type="button">
            Reject
          </button>
        </>
      ) : (
        <>
          <button className="grid h-9 w-9 place-items-center rounded-lg bg-amber-300/15 text-amber-100 transition hover:bg-amber-300 hover:text-slate-950" title="Block" type="button">
            <Lock size={16} />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-lg bg-red-400/15 text-red-100 transition hover:bg-red-400 hover:text-white" title="Delete" type="button">
            <Trash2 size={16} />
          </button>
        </>
      )}
    </div>
  );
}

export function LoadingPanel() {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-8 text-center text-slate-300">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-cyan-300" />
      <p className="mt-4 text-sm font-bold">Loading admin data...</p>
    </div>
  );
}

export function ErrorPanel({ message }) {
  return (
    <div className="rounded-lg border border-red-300/20 bg-red-400/10 p-5 text-sm font-bold text-red-100">
      {message || "Unable to load admin data."}
    </div>
  );
}
