"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const details = {
  worker: {
    title: "Worker Dashboard",
    subtitle: "Credential status, profile strength, and job readiness overview.",
    items: ["Profile verified", "Work history ready", "Applications synced"]
  },
  employer: {
    title: "Employer Dashboard",
    subtitle: "Hiring pipeline, worker verification, and shortlist controls.",
    items: ["Verified candidates", "Open roles", "Interview queue"]
  },
  admin: {
    title: "Admin Dashboard",
    subtitle: "Platform users, verification governance, and access oversight.",
    items: ["User controls", "Verification reviews", "Security monitoring"]
  }
};

export default function DashboardPlaceholder({ role }) {
  const router = useRouter();
  const content = details[role];

  function logoutAdmin() {
    window.localStorage.removeItem("workcred_token");
    window.localStorage.removeItem("workcred_user");
    window.localStorage.removeItem("workcred_demo_role");
    router.push("/admin-login");
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-5xl">
        <nav className="flex items-center justify-between">
          <Link className="text-lg font-black" href="/">
            WorkCred
          </Link>
          <div className="flex items-center gap-3">
            {role === "worker" && (
              <Link className="rounded-lg bg-white px-4 py-2 text-sm font-black text-slate-950" href="/worker-profile">
                Profile
              </Link>
            )}
            {role === "admin" && (
              <button
                className="rounded-lg bg-white px-4 py-2 text-sm font-black text-slate-950 transition hover:-translate-y-0.5 hover:bg-cyan-100"
                type="button"
                onClick={logoutAdmin}
              >
                Admin Logout
              </button>
            )}
          </div>
        </nav>
        <div className="mt-16 max-w-2xl">
          <p className="text-sm font-black uppercase text-cyan-200">{role} access</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{content.title}</h1>
          <p className="mt-4 text-lg leading-8 text-slate-300">{content.subtitle}</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {content.items.map((item) => (
            <article className="rounded-2xl border border-white/10 bg-white/10 p-5 shadow-xl" key={item}>
              <div className="mb-8 h-10 w-10 rounded-lg bg-cyan-300" />
              <h2 className="text-lg font-black">{item}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Frontend placeholder ready for authenticated dashboard data.
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
