import AuthShell from "../components/auth/AuthShell";
import Button from "../components/ui/Button";

export default function Home() {
  return (
    <AuthShell>
      <section className="mx-auto grid w-full max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-full border border-white/60 bg-white/60 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur">
            Worker verification and hiring access
          </p>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            WorkCred
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-700">
            A polished authentication experience for workers, employers, and platform admins.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/signup">Create account</Button>
            <Button href="/login" variant="secondary">
              Login
            </Button>
          </div>
        </div>

        <div className="float-card rounded-2xl border border-white/70 bg-white/70 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
          <div className="rounded-xl bg-slate-950 p-5 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-cyan-200">Verified profile</span>
              <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200">
                Active
              </span>
            </div>
            <div className="mt-8 h-16 w-16 rounded-2xl bg-gradient-to-br from-cyan-300 to-emerald-300" />
            <h2 className="mt-5 text-2xl font-black">Aarav Sharma</h2>
            <p className="mt-1 text-sm text-slate-300">Certified electrical worker</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-slate-400">Role</p>
                <p className="mt-1 font-bold">Worker</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-slate-400">Score</p>
                <p className="mt-1 font-bold">98%</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </AuthShell>
  );
}
