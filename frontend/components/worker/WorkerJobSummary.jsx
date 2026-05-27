"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getWorkerJobDashboard } from "../jobs/api";
import SectionCard from "../profile/SectionCard";
import EmptyState from "../profile/EmptyState";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";

const emptyDashboard = {
  totalAppliedJobs: 0,
  savedJobsCount: 0,
  recentApplications: [],
  applicationStatistics: {
    Pending: 0,
    Reviewed: 0,
    Accepted: 0,
    Rejected: 0
  }
};

export default function WorkerJobSummary() {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const data = await getWorkerJobDashboard();
        if (mounted) {
          setDashboard(data);
        }
      } catch (error) {
        if (mounted) {
          setDashboard(emptyDashboard);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <Skeleton className="h-80 w-full" />;
  }

  const stats = dashboard.applicationStatistics || {};

  return (
    <SectionCard
      id="jobs"
      title="Job Applications"
      subtitle="Track applied jobs, saved opportunities, and recent employer responses."
      action={
        <div className="flex flex-wrap gap-2">
          <Button href="/jobs" type="button" variant="soft">Find jobs</Button>
          <Button href="/jobs/applied" type="button" variant="secondary">Applied jobs</Button>
        </div>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile label="Applied jobs" value={dashboard.totalAppliedJobs} />
        <SummaryTile label="Saved jobs" value={dashboard.savedJobsCount} tone="cyan" />
        <SummaryTile label="Reviewed" value={stats.Reviewed || 0} tone="amber" />
        <SummaryTile label="Accepted" value={stats.Accepted || 0} tone="emerald" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
          <h3 className="text-base font-black text-slate-950">Recent applications</h3>
          <div className="mt-4 grid gap-3">
            {(dashboard.recentApplications || []).length === 0 ? (
              <EmptyState title="No applications yet" text="Applied jobs will appear here after you submit applications." />
            ) : (
              dashboard.recentApplications.map((application) => (
                <Link
                  className="rounded-xl border border-slate-200 bg-white/80 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                  href={`/jobs/applied/${application._id}`}
                  key={application._id}
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-black text-slate-950">{application.jobId?.title || "Applied job"}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{application.jobId?.companyName || "Company"}</p>
                    </div>
                    <StatusBadge status={application.applicationStatus} />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-sm font-black text-cyan-200">Application statistics</p>
          <div className="mt-5 grid gap-3">
            {["Pending", "Reviewed", "Accepted", "Rejected"].map((status) => (
              <div className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-sm font-bold" key={status}>
                <span>{status}</span>
                <span>{stats[status] || 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function SummaryTile({ label, value, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-950 text-white",
    cyan: "bg-cyan-50 text-cyan-900",
    amber: "bg-amber-50 text-amber-900",
    emerald: "bg-emerald-50 text-emerald-900"
  };

  return (
    <article className={`rounded-2xl p-5 shadow-lg shadow-slate-900/5 ${tones[tone]}`}>
      <p className="text-sm font-bold opacity-75">{label}</p>
      <p className="mt-3 text-3xl font-black">{value || 0}</p>
    </article>
  );
}

function StatusBadge({ status }) {
  const styles = {
    Pending: "bg-amber-50 text-amber-700",
    Reviewed: "bg-cyan-50 text-cyan-700",
    Accepted: "bg-emerald-50 text-emerald-700",
    Rejected: "bg-rose-50 text-rose-700"
  };

  return (
    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${styles[status] || styles.Pending}`}>
      {status || "Pending"}
    </span>
  );
}
