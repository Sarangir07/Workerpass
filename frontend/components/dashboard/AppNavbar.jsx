import Link from "next/link";

export default function AppNavbar({ subtitle = "Dashboard" }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white">
            WC
          </span>
          <span>
            <span className="block text-lg font-black leading-5 text-slate-950">WorkCred</span>
            <span className="hidden text-xs font-semibold text-slate-500 sm:block">{subtitle}</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            className="hidden rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:shadow-md sm:inline-flex"
            href="/dashboard-redirect"
          >
            Dashboard
          </Link>
          <Link
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5"
            href="/login"
          >
            Logout
          </Link>
        </div>
      </div>
    </header>
  );
}
