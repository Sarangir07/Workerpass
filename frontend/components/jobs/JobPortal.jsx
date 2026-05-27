"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppNavbar from "../dashboard/AppNavbar";
import EmptyState from "../profile/EmptyState";
import ProfileTextArea from "../profile/ProfileTextArea";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";
import TextField from "../ui/TextField";
import Toast from "../ui/Toast";
import { createChatRoom } from "../../services/chat/api";
import {
  applyForJob,
  deleteJob,
  getApplicationDetails,
  getApplicationHistory,
  getEmployerJobs,
  getJob,
  getJobApplications,
  getJobs,
  getMyApplications,
  getSavedJobs,
  saveJob,
  unsaveJob,
  updateApplicationStatus,
  updateJob
} from "./api";

const initialFilters = {
  search: "",
  salary: "",
  location: "",
  jobType: "",
  experience: ""
};

export function JobPortalPage({ mode = "listing", jobId }) {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applicationHistory, setApplicationHistory] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(initialFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [applyTarget, setApplyTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [applicantJob, setApplicantJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resume, setResume] = useState(null);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        if (mode === "saved") {
          const [savedData, applicationData] = await Promise.all([
            getSavedJobs(),
            getMyApplications()
          ]);
          if (mounted) {
            setSavedJobs(savedData.map((item) => item.jobId || item).filter(Boolean));
            setApplications(applicationData);
          }
        } else if (mode === "applications") {
          const data = await getMyApplications();
          if (mounted) setApplications(data);
        } else if (mode === "application-details" && jobId) {
          const [applicationData, historyData] = await Promise.allSettled([
            getApplicationDetails(jobId),
            getApplicationHistory(jobId)
          ]);

          if (mounted) {
            setSelectedApplication(
              applicationData.status === "fulfilled" ? applicationData.value : null
            );
            setApplicationHistory(historyData.status === "fulfilled" ? historyData.value : null);
          }
        } else if (mode === "employer") {
          const data = await getEmployerJobs();
          if (mounted) setJobs(data);
        } else if (mode === "details" && jobId) {
          const [jobData, relatedJobData, savedData, applicationData] = await Promise.all([
            getJob(jobId),
            getJobs(),
            getSavedJobs(),
            getMyApplications()
          ]);
          if (mounted) {
            setSelectedJob(jobData);
            setJobs(relatedJobData);
            setSavedJobs(savedData.map((item) => item.jobId || item).filter(Boolean));
            setApplications(applicationData);
          }
        } else {
          const [jobData, savedData, applicationData] = await Promise.all([
            getJobs(filters),
            getSavedJobs(),
            getMyApplications()
          ]);
          if (mounted) {
            setJobs(jobData);
            setSavedJobs(savedData.map((item) => item.jobId || item).filter(Boolean));
            setApplications(applicationData);
          }
        }
      } catch (error) {
        if (mounted) {
          setToastType("error");
          setToast(error.message);
          if (mode === "listing") setJobs([]);
          if (mode === "saved") setSavedJobs([]);
          if (mode === "applications") setApplications([]);
          if (mode === "application-details") setSelectedApplication(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [filters, jobId, mode]);

  const visibleJobs = useMemo(() => {
    const source = mode === "saved" ? savedJobs : jobs;
    return source.filter((job) => {
      const searchText = `${job.title} ${job.companyName} ${job.location} ${(job.skillsRequired || []).join(" ")}`.toLowerCase();
      const matchesSearch = !filters.search || searchText.includes(filters.search.toLowerCase());
      const matchesSalary = !filters.salary || String(job.salary).toLowerCase().includes(filters.salary.toLowerCase());
      const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesType = !filters.jobType || job.jobType === filters.jobType;
      const matchesExperience = !filters.experience || job.experienceRequired.toLowerCase().includes(filters.experience.toLowerCase());
      return matchesSearch && matchesSalary && matchesLocation && matchesType && matchesExperience;
    });
  }, [filters, jobs, mode, savedJobs]);

  const suggestions = useMemo(() => {
    if (!filters.search) return [];
    const values = jobs.flatMap((job) => [job.title, job.companyName, job.location, ...(job.skillsRequired || [])]);
    return [...new Set(values)].filter((item) => item.toLowerCase().includes(filters.search.toLowerCase())).slice(0, 5);
  }, [filters.search, jobs]);

  const pagedJobs = visibleJobs.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(visibleJobs.length / pageSize));
  const appliedIds = new Set(applications.map((item) => getJobId(item.jobId)));
  const savedIds = new Set(savedJobs.map((job) => getJobId(job)));

  function showToast(message, type = "success") {
    setToastType(type);
    setToast(message);
  }

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(initialFilters);
    setPage(1);
  }

  async function handleApply(event) {
    event.preventDefault();
    if (!applyTarget) return;

    try {
      setSaving(true);
      const application = await applyForJob(getJobId(applyTarget), { resume, coverLetter });
      setApplications((current) => [{ ...application, jobId: applyTarget }, ...current]);
      showToast("Application submitted successfully.");
    } catch (error) {
      showToast(error.message || "Application failed.", "error");
    } finally {
      setSaving(false);
      setApplyTarget(null);
      setResume(null);
      setCoverLetter("");
    }
  }

  async function toggleSave(job) {
    const id = getJobId(job);
    const isSaved = savedIds.has(id);

    try {
      if (isSaved) {
        await unsaveJob(id);
        setSavedJobs((current) => current.filter((item) => getJobId(item) !== id));
        showToast("Job removed from saved jobs.");
      } else {
        await saveJob(id);
        setSavedJobs((current) => [job, ...current]);
        showToast("Job saved.");
      }
    } catch (error) {
      if (!isSaved && error.message?.toLowerCase().includes("already saved")) {
        setSavedJobs((current) => [job, ...current]);
      } else if (isSaved && error.message?.toLowerCase().includes("not found")) {
        setSavedJobs((current) => current.filter((item) => getJobId(item) !== id));
      }
      showToast(error.message, "error");
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await deleteJob(getJobId(deleteTarget));
      setJobs((current) => current.filter((job) => getJobId(job) !== getJobId(deleteTarget)));
      showToast("Job deleted.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
      setDeleteTarget(null);
    }
  }

  async function loadApplicants(job) {
    setApplicantJob(job);
    try {
      const data = await getJobApplications(getJobId(job));
      setApplicants(data);
    } catch (error) {
      showToast(error.message, "error");
      setApplicants([]);
    }
  }

  async function setApplicantStatus(application, status) {
    try {
      const updated = await updateApplicationStatus(application._id, status);
      setApplicants((current) => current.map((item) => (item._id === application._id ? updated : item)));
      showToast(`Application marked ${status}.`);
    } catch (error) {
      setApplicants((current) => current.map((item) => (item._id === application._id ? { ...item, applicationStatus: status } : item)));
      showToast(error.message, "error");
    }
  }

  async function openApplicationChat(application) {
    try {
      setSaving(true);
      const room = await createChatRoom({
        applicationId: application._id,
        jobId: getJobId(application.jobId)
      });
      router.push(`/chat/${room._id}`);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function openApplicantChat(applicant) {
    try {
      setSaving(true);
      const room = await createChatRoom({ applicationId: applicant._id });
      router.push(`/chat/${room._id}`);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const detailJob = selectedJob || jobs.find((job) => getJobId(job) === jobId) || null;

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#eef7fb_0%,#f8fafc_52%,#eef2ff_100%)]">
      <AppNavbar subtitle="Job Portal" />
      <Toast message={toast} type={toastType} />

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <JobSidebar active={mode} />

        <div className="space-y-5">
          <PortalHero mode={mode} total={mode === "applications" ? applications.length : visibleJobs.length} />

          {loading ? (
            <JobSkeleton />
          ) : mode === "applications" ? (
            <ApplicationsView applications={applications} saving={saving} onChat={openApplicationChat} />
          ) : mode === "application-details" ? (
            <ApplicationDetails application={selectedApplication} history={applicationHistory} saving={saving} onChat={openApplicationChat} />
          ) : mode === "details" ? (
            detailJob ? (
              <JobDetails
                applied={appliedIds.has(getJobId(detailJob))}
                job={detailJob}
                relatedJobs={jobs.filter((job) => getJobId(job) !== getJobId(detailJob)).slice(0, 3)}
                saved={savedIds.has(getJobId(detailJob))}
                onApply={() => setApplyTarget(detailJob)}
                onSave={() => toggleSave(detailJob)}
              />
            ) : (
              <EmptyState title="Job not found" text="This job is unavailable or has not been posted yet." />
            )
          ) : mode === "employer" ? (
            <EmployerJobsView
              applicants={applicants}
              applicantJob={applicantJob}
              jobs={pagedJobs}
              onApplicants={loadApplicants}
              onDelete={setDeleteTarget}
              onChat={openApplicantChat}
              onStatus={setApplicantStatus}
            />
          ) : (
            <>
              <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                <FilterPanel
                  filters={filters}
                  mobileOpen={filterOpen}
                  suggestions={suggestions}
                  onClear={clearFilters}
                  onClose={() => setFilterOpen(false)}
                  onFilter={updateFilter}
                />
                <section className="space-y-5">
                  <SearchBar
                    filters={filters}
                    suggestions={suggestions}
                    onFilter={updateFilter}
                    onOpenFilters={() => setFilterOpen(true)}
                  />
                  <JobGrid
                    appliedIds={appliedIds}
                    emptyText={mode === "saved" ? "Saved jobs will appear here when you bookmark opportunities." : "Try changing your search terms or clearing filters."}
                    emptyTitle={mode === "saved" ? "No saved jobs yet" : "No jobs found"}
                    jobs={pagedJobs}
                    savedIds={savedIds}
                    onApply={setApplyTarget}
                    onSave={toggleSave}
                  />
                </section>
              </div>
              <Pagination page={page} pageSize={pageSize} total={visibleJobs.length} totalPages={totalPages} onPage={setPage} />
            </>
          )}
        </div>
      </div>

      <ApplyModal
        coverLetter={coverLetter}
        job={applyTarget}
        resume={resume}
        saving={saving}
        onClose={() => setApplyTarget(null)}
        onCoverLetter={setCoverLetter}
        onResume={setResume}
        onSubmit={handleApply}
      />
      <ConfirmModal
        open={Boolean(deleteTarget)}
        saving={saving}
        title="Delete job"
        text={`Remove ${deleteTarget?.title || "this job"} from posted jobs?`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </main>
  );
}

function PortalHero({ mode, total }) {
  const labels = {
    listing: ["Find verified work", "Search roles, save opportunities, and apply with a clean worker profile."],
    saved: ["Saved jobs", "Keep your best opportunities ready for quick follow-up."],
    applications: ["Application tracker", "Track pending, reviewed, accepted, and rejected applications."],
    "application-details": ["Application details", "Review job details, employer response, and status history."],
    details: ["Job details", "Review the full role before applying or saving."],
    employer: ["Employer jobs dashboard", "Manage posted jobs, applicants, status updates, and hiring signals."]
  };
  const [title, text] = labels[mode] || labels.listing;

  return (
    <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/75 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-6">
      <p className="text-sm font-black uppercase text-cyan-700">WorkCred Job Portal</p>
      <div className="mt-3 grid gap-5 lg:grid-cols-[1fr_220px] lg:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{text}</p>
        </div>
        <div className="rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-sm font-black text-cyan-200">Results</p>
          <p className="mt-3 text-4xl font-black">{total}</p>
        </div>
      </div>
    </section>
  );
}

function JobSidebar({ active }) {
  const items = [
    ["listing", "Browse jobs", "/jobs"],
    ["saved", "Saved jobs", "/jobs/saved"],
    ["applications", "Applications", "/jobs/applied"]
  ];

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white/70 bg-white/75 p-3 shadow-xl shadow-slate-900/5 backdrop-blur-xl lg:grid lg:overflow-visible">
        {items.map(([id, label, href]) => (
          <Link
            className={`whitespace-nowrap rounded-lg px-4 py-3 text-sm font-black transition ${
              active === id ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20" : "text-slate-600 hover:bg-white hover:text-slate-950"
            }`}
            href={href}
            key={id}
          >
            {label}
          </Link>
        ))}
      </div>
    </aside>
  );
}

function SearchBar({ filters, onFilter, onOpenFilters, suggestions }) {
  return (
    <div className="relative rounded-2xl border border-white/70 bg-white/75 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          className="min-h-12 rounded-lg border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/70"
          placeholder="Search by title, skill, company, or location"
          value={filters.search}
          onChange={(event) => onFilter("search", event.target.value)}
        />
        <Button type="button" variant="secondary" onClick={onOpenFilters}>Filters</Button>
      </div>
      {suggestions.length > 0 && (
        <div className="absolute left-4 right-4 top-[76px] z-20 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          {suggestions.map((item) => (
            <button className="block w-full rounded-lg px-3 py-2 text-left text-sm font-bold text-slate-600 hover:bg-cyan-50" key={item} type="button" onClick={() => onFilter("search", item)}>
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterPanel({ filters, mobileOpen, onClear, onClose, onFilter }) {
  const content = (
    <div className="space-y-4">
      <TextField label="Salary" placeholder="Example: 20000" value={filters.salary} onChange={(event) => onFilter("salary", event.target.value)} />
      <TextField label="Location" placeholder="Pune, Mumbai" value={filters.location} onChange={(event) => onFilter("location", event.target.value)} />
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Job type</span>
        <select className="min-h-12 w-full rounded-lg border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none" value={filters.jobType} onChange={(event) => onFilter("jobType", event.target.value)}>
          <option value="">All types</option>
          {["full-time", "part-time", "contract", "temporary", "internship"].map((item) => <option key={item} value={item}>{labelize(item)}</option>)}
        </select>
      </label>
      <TextField label="Experience" placeholder="Fresher, 1 year" value={filters.experience} onChange={(event) => onFilter("experience", event.target.value)} />
      <Button className="w-full" type="button" variant="secondary" onClick={onClear}>Clear filters</Button>
    </div>
  );

  return (
    <>
      <aside className="hidden rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl lg:block">
        <h2 className="mb-4 text-lg font-black text-slate-950">Filters</h2>
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 p-4 backdrop-blur-sm lg:hidden">
          <div className="ml-auto h-full max-w-sm overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-950">Filters</h2>
              <button className="rounded-lg px-2 py-1 text-sm font-black text-slate-500 hover:bg-slate-100" type="button" onClick={onClose}>x</button>
            </div>
            {content}
          </div>
        </div>
      )}
    </>
  );
}

function JobGrid({ appliedIds, emptyText, emptyTitle, jobs, onApply, onSave, savedIds }) {
  if (!jobs.length) {
    return <EmptyState title={emptyTitle} text={emptyText} />;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {jobs.map((job) => (
        <JobCard
          applied={appliedIds.has(getJobId(job))}
          job={job}
          key={getJobId(job)}
          saved={savedIds.has(getJobId(job))}
          onApply={() => onApply(job)}
          onSave={() => onSave(job)}
        />
      ))}
    </div>
  );
}

function JobCard({ applied, job, onApply, onSave, saved }) {
  return (
    <article className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950">{job.title}</h2>
          <p className="mt-1 text-sm font-bold text-slate-500">{job.companyName}</p>
        </div>
        <button className={`grid h-11 min-w-16 place-items-center rounded-lg px-3 text-xs font-black transition ${saved ? "bg-cyan-100 text-cyan-800" : "bg-slate-100 text-slate-500"}`} type="button" onClick={onSave}>
          {saved ? "Saved" : "Save"}
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoTile label="Salary" value={job.salary} />
        <InfoTile label="Location" value={job.location} />
        <InfoTile label="Type" value={labelize(job.jobType)} />
        <InfoTile label="Experience" value={job.experienceRequired} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {(job.skillsRequired || []).map((skill) => <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-800" key={skill}>{skill}</span>)}
      </div>
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button disabled={applied} type="button" onClick={onApply}>{applied ? "Applied" : "Apply now"}</Button>
        <Button href={`/jobs/${getJobId(job)}`} type="button" variant="secondary">View details</Button>
      </div>
    </article>
  );
}

function JobDetails({ applied, job, onApply, onSave, relatedJobs, saved }) {
  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <StatusBadge status={job.jobStatus} />
            <h2 className="mt-4 text-3xl font-black text-slate-950">{job.title}</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">{job.companyName} - {job.location}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button disabled={applied} type="button" onClick={onApply}>{applied ? "Applied" : "Apply"}</Button>
            <Button type="button" variant="secondary" onClick={onSave}>{saved ? "Unsave job" : "Save job"}</Button>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoTile label="Salary" value={job.salary} />
          <InfoTile label="Job type" value={labelize(job.jobType)} />
          <InfoTile label="Experience" value={job.experienceRequired} />
          <InfoTile label="Status" value={labelize(job.jobStatus)} />
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-black text-slate-950">Description</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{job.description}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {(job.skillsRequired || []).map((skill) => <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-black text-white" key={skill}>{skill}</span>)}
        </div>
      </section>
      <section className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        <h3 className="text-lg font-black text-slate-950">Related jobs</h3>
        {relatedJobs.length ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {relatedJobs.map((item) => <Link className="rounded-xl border border-slate-200 bg-white/70 p-4 text-sm font-black text-slate-800 transition hover:-translate-y-0.5" href={`/jobs/${getJobId(item)}`} key={getJobId(item)}>{item.title}</Link>)}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState title="No related jobs" text="Related jobs will appear when more jobs are posted." />
          </div>
        )}
      </section>
    </div>
  );
}

function ApplicationsView({ applications, onChat, saving }) {
  if (!applications.length) {
    return <EmptyState title="No applications yet" text="Jobs you apply for will appear here." />;
  }

  return (
    <section className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
      <h2 className="text-xl font-black text-slate-950">Applied jobs</h2>
      <div className="mt-5 grid gap-4">
        {applications.map((application) => (
          <article className="rounded-2xl border border-slate-200 bg-white/70 p-5" key={application._id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-black text-slate-950">{application.jobId?.title || "Job"}</h3>
                <p className="mt-1 text-sm font-bold text-slate-500">{application.jobId?.companyName}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400">
                  Last updated {formatDate(application.updatedAt || application.appliedAt || application.applicationDate)}
                </p>
              </div>
              <StatusBadge status={application.applicationStatus} />
            </div>
            <StatusTimeline status={application.applicationStatus} />
            <div className="mt-4 flex flex-wrap gap-3">
              <Button href={`/jobs/applied/${application._id}`} type="button" variant="secondary">View details</Button>
              <Button href={`/jobs/${getJobId(application.jobId)}`} type="button" variant="soft">Job preview</Button>
              <Button loading={saving} type="button" onClick={() => onChat(application)}>Chat</Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ApplicationDetails({ application, history, onChat, saving }) {
  if (!application) {
    return <EmptyState title="Application not found" text="This application is unavailable or has not been submitted yet." />;
  }

  const job = application.jobId || {};
  const statusHistory = history?.statusHistory || application.statusHistory || [
    { status: application.applicationStatus || "Pending", changedAt: application.updatedAt || application.applicationDate }
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <StatusBadge status={application.applicationStatus} />
            <h2 className="mt-4 text-3xl font-black text-slate-950">{job.title || "Applied job"}</h2>
            <p className="mt-2 text-sm font-bold text-slate-500">{job.companyName || "Company"} - {job.location || "Location"}</p>
            <p className="mt-2 text-xs font-semibold text-slate-400">
              Applied {formatDate(application.appliedAt || application.applicationDate)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/jobs/applied" type="button" variant="secondary">Back to applied jobs</Button>
            <Button loading={saving} type="button" onClick={() => onChat(application)}>Chat with employer</Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <InfoTile label="Salary" value={job.salary} />
          <InfoTile label="Job type" value={labelize(job.jobType)} />
          <InfoTile label="Experience" value={job.experienceRequired} />
          <InfoTile label="Status" value={application.applicationStatus} />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div>
            <h3 className="text-lg font-black text-slate-950">Job details preview</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {job.description || "Job details will appear here when the API returns job data."}
            </p>
            <WorkerProfileResume profile={application.workerProfile} />
            {application.coverLetter && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-950">Your cover letter</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{application.coverLetter}</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-sm font-black text-cyan-200">Employer response</p>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              {application.applicationStatus === "Accepted"
                ? "The employer accepted this application."
                : application.applicationStatus === "Rejected"
                  ? "The employer rejected this application."
                  : application.applicationStatus === "Reviewed"
                    ? "The employer reviewed this application."
                    : "Waiting for employer review."}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        <h3 className="text-lg font-black text-slate-950">Application history</h3>
        <div className="mt-5 grid gap-3">
          {statusHistory.map((item, index) => (
            <div className="flex gap-3 rounded-xl border border-slate-200 bg-white/70 p-4" key={`${item.status}-${index}`}>
              <div className="mt-1 h-3 w-3 rounded-full bg-cyan-500" />
              <div>
                <p className="font-black text-slate-950">{item.status}</p>
                <p className="mt-1 text-sm text-slate-500">{formatDate(item.changedAt)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function EmployerJobsView({ applicantJob, applicants, jobs, onApplicants, onChat, onDelete, onStatus }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Posted jobs" value={jobs.length} />
        <Metric label="Applicants" value={applicants.length} />
        <Metric label="Pending" value={applicants.filter((item) => item.applicationStatus === "Pending").length} />
      </div>
      <section className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        <h2 className="text-xl font-black text-slate-950">Posted jobs</h2>
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white/70">
          {jobs.length ? (
            jobs.map((job) => (
              <div className="grid gap-3 border-b border-slate-100 p-4 last:border-b-0 md:grid-cols-[1fr_120px_120px_160px] md:items-center" key={getJobId(job)}>
                <div>
                  <p className="font-black text-slate-950">{job.title}</p>
                  <p className="text-sm text-slate-500">{job.location} - {job.salary}</p>
                </div>
                <StatusBadge status={job.jobStatus} />
                <Button href={`/jobs/${getJobId(job)}`} type="button" variant="secondary">Edit</Button>
                <div className="flex gap-2">
                  <button className="text-sm font-black text-cyan-800" type="button" onClick={() => onApplicants(job)}>Applicants</button>
                  <button className="text-sm font-black text-rose-600" type="button" onClick={() => onDelete(job)}>Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4">
              <EmptyState title="No jobs posted" text="Posted jobs will appear here after they are created." />
            </div>
          )}
        </div>
      </section>
      <ApplicantsPanel applicants={applicants} job={applicantJob} onChat={onChat} onStatus={onStatus} />
    </div>
  );
}

function ApplicantsPanel({ applicants, job, onChat, onStatus }) {
  const [search, setSearch] = useState("");
  const filteredApplicants = applicants.filter((item) => `${item.workerId?.name} ${item.workerId?.email}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <section className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-950">Applicants</h2>
          <p className="mt-1 text-sm text-slate-500">{job ? job.title : "Select a job to load live applicants."}</p>
        </div>
        <input className="min-h-12 rounded-lg border border-slate-200 bg-white/85 px-4 text-sm font-semibold outline-none" placeholder="Search applicants" value={search} onChange={(event) => setSearch(event.target.value)} />
      </div>
      <div className="mt-5 grid gap-3">
        {filteredApplicants.length ? (
          filteredApplicants.map((applicant) => (
            <article className="rounded-2xl border border-slate-200 bg-white/70 p-4" key={applicant._id}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="font-black text-slate-950">{applicant.workerId?.name || "Applicant"}</h3>
                  <p className="text-sm text-slate-500">{applicant.workerId?.email}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{applicant.coverLetter}</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3 lg:min-w-80">
                  <StatusBadge status={applicant.applicationStatus} />
                  <Button href={applicant.resume?.url || "#"} type="button" variant="secondary">Resume</Button>
                  <Button type="button" onClick={() => onStatus(applicant, "Accepted")}>Accept</Button>
                  <Button type="button" variant="soft" onClick={() => onChat(applicant)}>Chat</Button>
                  <Button type="button" variant="secondary" onClick={() => onStatus(applicant, "Rejected")}>Reject</Button>
                  <Button type="button" variant="soft" onClick={() => onStatus(applicant, "Reviewed")}>Reviewed</Button>
                </div>
              </div>
            </article>
          ))
        ) : (
          <EmptyState title="No applicants" text="Applicants will appear after workers apply to this job." />
        )}
      </div>
    </section>
  );
}

function ApplyModal({ coverLetter, job, onClose, onCoverLetter, onResume, onSubmit, resume, saving }) {
  if (!job) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form className="w-full max-w-xl rounded-2xl border border-white/70 bg-white p-6 shadow-2xl" onSubmit={onSubmit}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">Apply for {job.title}</h2>
            <p className="mt-1 text-sm text-slate-500">{job.companyName}</p>
          </div>
          <button className="rounded-lg px-2 py-1 text-sm font-black text-slate-500 hover:bg-slate-100" type="button" onClick={onClose}>x</button>
        </div>
        <div className="mb-4 rounded-2xl bg-cyan-50 p-4">
          <p className="text-sm font-black text-cyan-950">Applying with WorkCred profile</p>
          <p className="mt-1 text-sm leading-6 text-cyan-900">
            Your saved worker profile will be sent as your digital resume. Uploading a separate resume is optional.
          </p>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Resume file optional</span>
          <input accept=".pdf,.doc,.docx" className="block w-full rounded-lg border border-dashed border-slate-300 bg-white/75 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white" type="file" onChange={(event) => onResume(event.target.files?.[0] || null)} />
          {resume && <span className="mt-2 block text-sm font-semibold text-cyan-700">{resume.name}</span>}
        </label>
        <div className="mt-4">
          <ProfileTextArea label="Cover letter" value={coverLetter} onChange={(event) => onCoverLetter(event.target.value)} />
        </div>
        <Button className="mt-5 w-full" loading={saving} type="submit">Submit application</Button>
      </form>
    </div>
  );
}

function WorkerProfileResume({ profile }) {
  if (!profile) {
    return (
      <div className="mt-4 rounded-2xl bg-amber-50 p-4">
        <p className="text-sm font-black text-amber-900">WorkCred profile not attached</p>
        <p className="mt-1 text-sm leading-6 text-amber-800">Complete and save your worker dashboard to use it as a digital resume.</p>
      </div>
    );
  }

  const title = profile.customJobTitle || labelize(profile.jobCategory || "worker");

  return (
    <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
      <p className="text-sm font-black text-cyan-950">WorkCred digital resume</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <InfoTile label="Worker" value={profile.fullName} />
        <InfoTile label="Category" value={title} />
        <InfoTile label="Location" value={profile.location} />
        <InfoTile label="Availability" value={labelize(profile.availabilityStatus)} />
      </div>
      {profile.bio && <p className="mt-3 text-sm leading-6 text-slate-600">{profile.bio}</p>}
      {(profile.skills || []).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.skills.slice(0, 8).map((skill) => (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-cyan-800" key={skill}>{skill}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ConfirmModal({ onClose, onConfirm, open, saving, text, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-black text-slate-950">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button loading={saving} type="button" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ onPage, page, pageSize, total, totalPages }) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/75 p-4 shadow-xl shadow-slate-900/5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-bold text-slate-600">Showing {start}-{Math.min(page * pageSize, total)} of {total}</p>
      <div className="flex flex-wrap gap-2">
        <Button disabled={page === 1} type="button" variant="secondary" onClick={() => onPage(page - 1)}>Previous</Button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
          <button className={`h-12 w-12 rounded-lg text-sm font-black ${item === page ? "bg-slate-950 text-white" : "bg-white text-slate-700"}`} key={item} type="button" onClick={() => onPage(item)}>{item}</button>
        ))}
        <Button disabled={page === totalPages} type="button" variant="secondary" onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  );
}

function StatusTimeline({ status }) {
  const steps = ["Pending", "Reviewed", "Accepted"];
  const current = status === "Rejected" ? 1 : Math.max(0, steps.indexOf(status));

  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-3">
      {steps.map((step, index) => (
        <div className={`rounded-xl p-3 text-sm font-black ${index <= current ? "bg-cyan-50 text-cyan-800" : "bg-slate-100 text-slate-400"}`} key={step}>
          {status === "Rejected" && step === "Accepted" ? "Rejected" : step}
        </div>
      ))}
    </div>
  );
}

function JobSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <Skeleton className="hidden h-96 lg:block" />
      <div className="grid gap-4 xl:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-900">{value || "Not provided"}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <article className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-lg shadow-slate-900/5">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black text-slate-950">{value}</p>
    </article>
  );
}

function StatusBadge({ status }) {
  const value = String(status || "open");
  const normalized = value.toLowerCase();
  const styles = normalized.includes("accepted") || normalized.includes("open")
    ? "bg-emerald-50 text-emerald-700"
    : normalized.includes("rejected") || normalized.includes("closed")
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";

  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${styles}`}>{labelize(value)}</span>;
}

function getJobId(job) {
  return String(job?._id || job?.id || job || "");
}

function labelize(value) {
  return String(value || "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}
