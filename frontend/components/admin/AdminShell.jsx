"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";
import { clearAdminSession } from "./adminApi";
import useAdminAuth from "./useAdminAuth";

export default function AdminShell({ title, children }) {
  const router = useRouter();
  const { admin, checking } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function logout() {
    clearAdminSession();
    router.replace("/admin-login");
  }

  if (checking) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-white/10 border-t-cyan-300" />
          <p className="mt-5 text-sm font-bold text-slate-300">Checking admin access...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_30%)]" />
      <div className="relative flex min-h-screen">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onLogout={logout} />
        <div className="min-w-0 flex-1">
          <AdminNavbar admin={admin} title={title} onMenuClick={() => setSidebarOpen(true)} onLogout={logout} />
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
