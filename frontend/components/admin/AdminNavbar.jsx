"use client";

import { Bell, LogOut, Menu, Search } from "lucide-react";

export default function AdminNavbar({ admin, title, onMenuClick, onLogout }) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="flex min-h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button
          aria-label="Open sidebar"
          className="grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10 lg:hidden"
          type="button"
          onClick={onMenuClick}
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase text-cyan-300">Admin panel</p>
          <h1 className="truncate text-xl font-black text-white sm:text-2xl">{title}</h1>
        </div>

        <label className="hidden h-11 min-w-72 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-4 text-sm text-slate-300 transition focus-within:border-cyan-300/60 xl:flex">
          <Search size={18} className="text-slate-500" />
          <input
            className="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
            placeholder="Search users, jobs, reports"
          />
        </label>

        <button
          aria-label="Notifications"
          className="relative grid h-11 w-11 place-items-center rounded-lg border border-white/10 bg-white/[0.06] text-slate-200 transition hover:bg-white/10"
          type="button"
        >
          <Bell size={19} />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-cyan-300" />
        </button>

        <div className="hidden items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 sm:flex">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-cyan-300 to-emerald-300 text-sm font-black text-slate-950">
            {admin?.name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div className="max-w-36">
            <p className="truncate text-sm font-black text-white">{admin?.name || "Admin"}</p>
            <p className="truncate text-xs font-semibold text-slate-400">{admin?.email || "admin@workcred.com"}</p>
          </div>
        </div>

        <button
          className="hidden h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10 md:inline-flex"
          type="button"
          onClick={onLogout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
}
