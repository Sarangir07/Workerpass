"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BriefcaseBusiness,
  Building2,
  FileWarning,
  Gauge,
  LogOut,
  Settings,
  ShieldCheck,
  UserCheck,
  Users,
  X
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/admin-dashboard", icon: Gauge },
  { label: "Users", href: "/admin-dashboard/users", icon: Users },
  { label: "Workers", href: "/admin-dashboard/workers", icon: UserCheck },
  { label: "Employers", href: "/admin-dashboard/employers", icon: Building2 },
  { label: "Job Posts", href: "/admin-dashboard/jobs", icon: BriefcaseBusiness },
  { label: "Verifications", href: "/admin-dashboard/verifications", icon: ShieldCheck },
  { label: "Reports", href: "/admin-dashboard/reports", icon: FileWarning },
  { label: "Analytics", href: "/admin-dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/admin-dashboard/settings", icon: Settings }
];

export default function AdminSidebar({ open, onClose, onLogout }) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-white/10 bg-slate-950/95 px-4 py-5 text-white shadow-2xl shadow-black/40 backdrop-blur-xl transition-transform duration-300 lg:sticky lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2">
          <Link className="flex items-center gap-3" href="/admin-dashboard" onClick={onClose}>
            <span className="grid h-11 w-11 place-items-center rounded-lg bg-cyan-400 text-sm font-black text-slate-950">
              WC
            </span>
            <span>
              <span className="block text-lg font-black">WorkCred</span>
              <span className="text-xs font-semibold text-slate-400">Admin Console</span>
            </span>
          </Link>
          <button
            aria-label="Close sidebar"
            className="grid h-10 w-10 place-items-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white lg:hidden"
            type="button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8 flex-1 space-y-1">
          {menuItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;

            return (
              <Link
                className={`group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition duration-200 ${
                  active
                    ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"
                    : "text-slate-300 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white"
                }`}
                href={href}
                key={href}
                onClick={onClose}
              >
                <Icon size={19} className={active ? "text-slate-950" : "text-cyan-300"} />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          className="flex items-center gap-3 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-3 text-sm font-black text-red-100 transition hover:-translate-y-0.5 hover:bg-red-400/20"
          type="button"
          onClick={onLogout}
        >
          <LogOut size={19} />
          Logout
        </button>
      </aside>
    </>
  );
}
