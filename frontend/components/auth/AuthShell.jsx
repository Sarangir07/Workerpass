import Link from "next/link";

export default function AuthShell({ children }) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,#b6f0e7_0,#eef7fb_32%,#f7fafc_64%,#eef2ff_100%)]">
      <div className="absolute left-[-120px] top-20 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div className="absolute bottom-10 right-[-100px] h-80 w-80 rounded-full bg-emerald-300/25 blur-3xl" />

      <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link className="flex items-center gap-3" href="/">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-950/20">
            WC
          </span>
          <span>
            <span className="block text-lg font-black leading-5 text-slate-950">WorkCred</span>
            <span className="block text-xs font-semibold text-slate-500">Verify. Hire. Work.</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/60 p-1 text-sm font-bold text-slate-700 shadow-sm backdrop-blur">
          <Link className="hidden rounded-full px-4 py-2 transition hover:bg-white sm:block" href="/admin-login">
            Admin
          </Link>
          <Link className="rounded-full px-4 py-2 transition hover:bg-white" href="/login">
            Login
          </Link>
          <Link className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800" href="/signup">
            Sign up
          </Link>
        </div>
      </nav>

      <div className="relative z-10 flex flex-1 items-center">{children}</div>

      <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>Copyright 2026 WorkCred. Professional worker identity access.</p>
        <div className="flex gap-4 font-semibold">
          <span>Privacy</span>
          <span>Security</span>
          <span>Support</span>
        </div>
      </footer>
    </main>
  );
}
