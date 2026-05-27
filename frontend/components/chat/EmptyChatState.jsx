export default function EmptyChatState({ userType }) {
  return (
    <section className="grid h-full place-items-center p-6 text-center">
      <div className="max-w-sm rounded-2xl border border-white/70 bg-white/70 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-950 text-lg font-black text-white">WC</div>
        <h2 className="mt-5 text-2xl font-black text-slate-950">Select a conversation</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {userType === "worker"
            ? "No job applications yet. Apply for jobs to start chatting with employers."
            : userType === "employer"
              ? "No workers have applied yet."
              : "Open a worker-employer chat to view history, send messages, and keep hiring communication in one place."}
        </p>
      </div>
    </section>
  );
}
