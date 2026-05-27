"use client";

import { useEffect, useMemo, useState } from "react";
import AppNavbar from "../dashboard/AppNavbar";
import StatCard from "../dashboard/StatCard";
import EmptyState from "../profile/EmptyState";
import ProfileTextArea from "../profile/ProfileTextArea";
import SectionCard from "../profile/SectionCard";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";
import TextField from "../ui/TextField";
import Toast from "../ui/Toast";
import {
  addWorkExperience,
  getEligibleWorkplaces,
  getEmployerVerificationRequests,
  getMockVerifications,
  getMockWorkplaces,
  getWorkerVerifications,
  updateVerificationStatus
} from "./api";

const emptyExperience = {
  companyName: "",
  workRole: "",
  startDate: "",
  endDate: "",
  description: "",
  employerId: ""
};

const statusStyles = {
  Pending: "border-amber-200 bg-amber-50 text-amber-800",
  Approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Rejected: "border-rose-200 bg-rose-50 text-rose-800"
};

const navItems = [
  ["overview", "Overview"],
  ["add", "Add Experience"],
  ["timeline", "Timeline"],
  ["verified", "Verified"],
  ["feedback", "Feedback"]
];

export default function ExperienceVerificationModule({ mode = "worker" }) {
  const isEmployer = mode === "employer";
  const [items, setItems] = useState([]);
  const [activeSection, setActiveSection] = useState(isEmployer ? "requests" : "overview");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [form, setForm] = useState(emptyExperience);
  const [errors, setErrors] = useState({});
  const [workplaces, setWorkplaces] = useState([]);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewForm, setReviewForm] = useState({ verificationStatus: "Approved", employerComments: "", rating: 5 });

  async function load({ quiet = false } = {}) {
    try {
      if (quiet) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = isEmployer ? await getEmployerVerificationRequests() : await getWorkerVerifications();
      setItems(data);

      if (!isEmployer) {
        const workplaceData = await getEligibleWorkplaces();
        setWorkplaces(workplaceData);
      }
    } catch (error) {
      setItems(getMockVerifications());
      if (!isEmployer) {
        setWorkplaces(getMockWorkplaces());
      }
      showToast(error.message || "Using sample verification data.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
    const timer = window.setInterval(() => load({ quiet: true }), 30000);
    return () => window.clearInterval(timer);
  }, [mode]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      approved: items.filter((item) => item.verificationStatus === "Approved").length,
      pending: items.filter((item) => item.verificationStatus === "Pending").length,
      rejected: items.filter((item) => item.verificationStatus === "Rejected").length
    };
  }, [items]);

  const verifiedItems = items.filter((item) => item.verificationStatus === "Approved");
  const recentItems = [...items].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 4);

  function showToast(message, type = "success") {
    setToastType(type);
    setToast(message);
  }

  function selectSection(sectionId) {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateForm(field, value) {
    if (field === "workplace") {
      const selected = workplaces.find((item) => workplaceValue(item) === value);
      setForm((current) => ({
        ...current,
        employerId: selected?.employerId || "",
        companyName: selected?.companyName || "",
        workRole: selected?.workRole || ""
      }));
      setErrors((current) => ({ ...current, employerId: "", companyName: "", workRole: "" }));
      return;
    }

    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function validateExperience() {
    const nextErrors = {};

    if (!form.employerId.trim() || !form.companyName.trim()) nextErrors.workplace = "Select a workplace from the list.";
    if (!form.workRole.trim()) nextErrors.workRole = "Work role is required.";
    if (!form.startDate) nextErrors.startDate = "Start date is required.";
    if (form.endDate && form.startDate && new Date(form.endDate) < new Date(form.startDate)) {
      nextErrors.endDate = "End date cannot be before start date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submitExperience(event) {
    event.preventDefault();

    if (!validateExperience()) {
      showToast("Please fix the highlighted fields.", "error");
      return;
    }

    try {
      setSaving(true);
      const created = await addWorkExperience(form);
      setItems((current) => [created, ...current]);
      setForm(emptyExperience);
      showToast("Verification request submitted.");
    } catch (error) {
      const fallback = {
        _id: `local-${Date.now()}`,
        ...form,
        workerId: { name: "Current Worker", email: "" },
        employerId: { name: form.companyName, email: "" },
        verificationStatus: "Pending",
        employerComments: "",
        rating: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setItems((current) => [fallback, ...current]);
      setForm(emptyExperience);
      showToast("Saved locally. Backend API was unavailable.", "error");
    } finally {
      setSaving(false);
    }
  }

  function openReview(item, status) {
    setReviewTarget(item);
    setReviewForm({
      verificationStatus: status,
      employerComments: item.employerComments || "",
      rating: item.rating || 5
    });
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!reviewTarget) return;

    try {
      setSaving(true);
      const updated = await updateVerificationStatus(reviewTarget._id, reviewForm);
      setItems((current) => current.map((item) => (item._id === reviewTarget._id ? updated : item)));
      setReviewTarget(null);
      showToast(`Experience ${reviewForm.verificationStatus.toLowerCase()}.`);
      await load({ quiet: true });
    } catch (error) {
      setItems((current) =>
        current.map((item) =>
          item._id === reviewTarget._id
            ? { ...item, ...reviewForm, updatedAt: new Date().toISOString() }
            : item
        )
      );
      setReviewTarget(null);
      showToast("Updated locally. Backend API was unavailable.", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <VerificationSkeleton subtitle={isEmployer ? "Employer Verification" : "Worker Verification"} />;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#eef7fb_0%,#f8fafc_48%,#eef2ff_100%)]">
      <AppNavbar subtitle={isEmployer ? "Employer Verification" : "Worker Verification"} />
      <Toast message={toast} type={toastType} />

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[250px_1fr] lg:px-8">
        <VerificationSidebar active={activeSection} employer={isEmployer} onSelect={selectSection} />

        <div className="space-y-5">
          <section className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur-xl sm:p-6" id={isEmployer ? "requests" : "overview"}>
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-sm font-black uppercase text-cyan-700">Experience Verification</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {isEmployer ? "Verify worker experience requests" : "Build verified proof of your work history"}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  {isEmployer
                    ? "Review requests, add comments, assign ratings, and approve digital work proof for local workers."
                    : "Submit past work experience to employers and track digital verification status in one place."}
                </p>
              </div>
              <Button loading={refreshing} type="button" variant="secondary" onClick={() => load({ quiet: true })}>
                Refresh
              </Button>
            </div>
          </section>

          <StatsGrid stats={stats} />

          {isEmployer ? (
            <EmployerRequestsSection items={items} saving={saving} onReview={openReview} />
          ) : (
            <>
              <ExperienceForm errors={errors} form={form} saving={saving} workplaces={workplaces} onChange={updateForm} onSubmit={submitExperience} />
              <RecentActivity items={recentItems} />
              <ExperienceTimeline items={items} />
              <VerifiedExperienceDisplay items={verifiedItems} />
              <FeedbackSection items={items.filter((item) => item.employerComments || item.rating)} />
            </>
          )}
        </div>
      </div>

      <ReviewModal
        form={reviewForm}
        open={Boolean(reviewTarget)}
        saving={saving}
        target={reviewTarget}
        onChange={(field, value) => setReviewForm((current) => ({ ...current, [field]: value }))}
        onClose={() => setReviewTarget(null)}
        onSubmit={submitReview}
      />
    </main>
  );
}

function VerificationSidebar({ active, employer, onSelect }) {
  const items = employer
    ? [["requests", "Requests"], ["feedback", "Reviews"]]
    : navItems;

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-white/70 bg-white/75 p-3 shadow-xl shadow-slate-900/5 backdrop-blur-xl">
        <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {items.map(([id, label]) => (
            <button
              className={`whitespace-nowrap rounded-lg px-4 py-3 text-left text-sm font-black transition ${
                active === id ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20" : "text-slate-600 hover:bg-white hover:text-slate-950"
              }`}
              key={id}
              type="button"
              onClick={() => onSelect(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function StatsGrid({ stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total requests" value={stats.total} />
      <StatCard label="Verified" value={stats.approved} tone="emerald" />
      <StatCard label="Pending" value={stats.pending} tone="amber" />
      <StatCard label="Rejected" value={stats.rejected} tone="slate" />
    </div>
  );
}

function ExperienceForm({ errors, form, onChange, onSubmit, saving, workplaces }) {
  return (
    <SectionCard id="add" title="Add Work Experience" subtitle="Select a previous workplace, add dates, and send a digital verification request.">
      <form className="space-y-4" onSubmit={onSubmit}>
        <WorkplaceSelect
          error={errors.workplace}
          value={form.employerId && form.companyName ? `${form.employerId}|${form.companyName}` : ""}
          workplaces={workplaces}
          onChange={(value) => onChange("workplace", value)}
        />
        {form.companyName && (
          <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
            <p className="text-sm font-black text-cyan-950">{form.companyName}</p>
            <p className="mt-1 text-sm font-semibold text-cyan-800">{form.workRole || "Role will appear after selection"}</p>
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <TextField error={errors.workRole} label="Previous work role" value={form.workRole} onChange={(event) => onChange("workRole", event.target.value)} />
          <TextField error={errors.startDate} label="Start date" type="date" value={form.startDate} onChange={(event) => onChange("startDate", event.target.value)} />
          <TextField error={errors.endDate} label="End date" type="date" value={form.endDate} onChange={(event) => onChange("endDate", event.target.value)} />
        </div>
        <ProfileTextArea label="Description" value={form.description} onChange={(event) => onChange("description", event.target.value)} />
        <Button loading={saving} type="submit">Submit verification request</Button>
      </form>
    </SectionCard>
  );
}

function WorkplaceSelect({ error, onChange, value, workplaces }) {
  const [query, setQuery] = useState("");
  const filtered = workplaces.filter((item) => {
    const text = `${item.companyName} ${item.workRole} ${item.source}`.toLowerCase();
    return text.includes(query.toLowerCase());
  });

  return (
    <div>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Select Previous Workplace</span>
        <input
          className={`min-h-12 w-full rounded-lg border bg-white/85 px-4 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
            error ? "border-rose-300 focus:border-rose-400 focus:ring-rose-200/70" : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-200/70"
          }`}
          placeholder="Search workplace, hotel, bakery, restaurant..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      {error && <span className="mt-2 block text-sm font-semibold text-rose-600">{error}</span>}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-4 text-sm font-semibold text-slate-500 md:col-span-2">
            No eligible workplaces found yet. Accepted jobs and connected employers will appear here automatically.
          </div>
        ) : (
          filtered.map((item) => {
            const itemValue = workplaceValue(item);
            const selected = itemValue === value;

            return (
              <button
                className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-lg ${
                  selected ? "border-slate-950 bg-slate-950 text-white" : "border-white/70 bg-white/80 text-slate-950"
                }`}
                key={itemValue}
                type="button"
                onClick={() => onChange(itemValue)}
              >
                <span className="block text-base font-black">{item.companyName}</span>
                <span className={`mt-1 block text-sm font-semibold ${selected ? "text-slate-300" : "text-slate-500"}`}>{item.workRole || "Role not provided"}</span>
                <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${selected ? "bg-white/10 text-white" : "bg-cyan-50 text-cyan-800"}`}>
                  {item.source || "Eligible workplace"}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function RecentActivity({ items }) {
  return (
    <SectionCard id="activity" title="Recent Verification Activity" subtitle="Latest updates from employers.">
      {items.length === 0 ? (
        <EmptyState title="No activity yet" text="Verification updates will appear here." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <VerificationCard compact item={item} key={item._id} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function ExperienceTimeline({ items }) {
  return (
    <SectionCard id="timeline" title="Experience Timeline" subtitle="Track requests, employer responses, ratings, and comments.">
      {items.length === 0 ? (
        <EmptyState title="No experience requests" text="Add your first work experience to start verification." />
      ) : (
        <div className="relative space-y-4 before:absolute before:left-4 before:top-2 before:h-[calc(100%-16px)] before:w-0.5 before:bg-slate-200">
          {items.map((item) => (
            <div className="relative pl-10" key={item._id}>
              <span className={`absolute left-0 top-5 h-8 w-8 rounded-full border-4 border-white shadow ${dotColor(item.verificationStatus)}`} />
              <VerificationCard item={item} />
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function VerifiedExperienceDisplay({ items }) {
  return (
    <SectionCard id="verified" title="Verified Experience" subtitle="Approved work history ready for worker profile and hiring workflows.">
      {items.length === 0 ? (
        <EmptyState title="No verified experience yet" text="Approved experiences will appear with verified badges here." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <VerificationCard verified item={item} key={item._id} />
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function EmployerRequestsSection({ items, onReview, saving }) {
  return (
    <SectionCard id="requests" title="Employer Verification Requests" subtitle="Approve, reject, comment, and rate worker experience claims.">
      {items.length === 0 ? (
        <EmptyState title="No requests found" text="Worker verification requests assigned to your company will appear here." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {items.map((item) => (
            <article className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-2xl" key={item._id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase text-cyan-700">Worker profile preview</p>
                  <h3 className="mt-2 text-lg font-black text-slate-950">{item.workerId?.name || "Worker"}</h3>
                  <p className="text-sm font-semibold text-slate-500">{item.workerId?.email || "Email not available"}</p>
                </div>
                <StatusBadge status={item.verificationStatus} />
              </div>
              <VerificationCard compact item={item} />
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Button disabled={saving} type="button" onClick={() => onReview(item, "Approved")}>Approve</Button>
                <Button disabled={saving} type="button" variant="secondary" onClick={() => onReview(item, "Rejected")}>Reject</Button>
                <Button disabled={saving} type="button" variant="soft" onClick={() => onReview(item, item.verificationStatus)}>Comment</Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function FeedbackSection({ items }) {
  return (
    <SectionCard id="feedback" title="Employer Feedback" subtitle="Comments, reviews, and star ratings from employers.">
      {items.length === 0 ? (
        <EmptyState title="No feedback yet" text="Employer comments and ratings will appear after review." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <article className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-lg shadow-slate-900/5" key={item._id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950">{item.companyName}</h3>
                  <p className="text-sm font-semibold text-slate-500">{item.workRole}</p>
                </div>
                <RatingStars value={item.rating || 0} />
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">{item.employerComments || "No written comment added."}</p>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function VerificationCard({ compact = false, item, verified = false }) {
  return (
    <article className={`rounded-2xl border p-5 shadow-lg shadow-slate-900/5 ${cardTone(item.verificationStatus)}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-slate-950">{item.companyName}</h3>
            {verified && <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white">Verified</span>}
          </div>
          <p className="mt-1 text-sm font-bold text-slate-600">{item.workRole}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : "Present"}</p>
        </div>
        <StatusBadge status={item.verificationStatus} />
      </div>
      {!compact && item.description && <p className="mt-4 text-sm leading-6 text-slate-600">{item.description}</p>}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <RatingStars value={item.rating || 0} />
        {item.employerComments && <span className="text-sm font-semibold text-slate-600">{item.employerComments}</span>}
      </div>
    </article>
  );
}

function ReviewModal({ form, onChange, onClose, onSubmit, open, saving, target }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <form className="w-full max-w-xl rounded-2xl border border-white/70 bg-white p-6 shadow-2xl" onSubmit={onSubmit}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">Review Experience</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{target?.companyName} - {target?.workRole}</p>
          </div>
          <button className="rounded-lg px-2 py-1 text-sm font-black text-slate-500 hover:bg-slate-100" type="button" onClick={onClose}>x</button>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Status</span>
          <select className="min-h-12 w-full rounded-lg border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none" value={form.verificationStatus} onChange={(event) => onChange("verificationStatus", event.target.value)}>
            {["Pending", "Approved", "Rejected"].map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <div className="mt-4">
          <span className="mb-2 block text-sm font-bold text-slate-700">Rating</span>
          <RatingInput value={form.rating} onChange={(value) => onChange("rating", value)} />
        </div>
        <div className="mt-4">
          <ProfileTextArea label="Employer comments" value={form.employerComments} onChange={(event) => onChange("employerComments", event.target.value)} />
        </div>
        <Button className="mt-5 w-full" loading={saving} type="submit">Save review</Button>
      </form>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-black ${statusStyles[status] || statusStyles.Pending}`}>
      {status || "Pending"}
    </span>
  );
}

function RatingInput({ onChange, value }) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          className={`grid h-11 w-11 place-items-center rounded-lg text-lg font-black transition ${star <= value ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"}`}
          key={star}
          type="button"
          onClick={() => onChange(star)}
        >
          *
        </button>
      ))}
    </div>
  );
}

function RatingStars({ value }) {
  return (
    <div className="flex gap-1 text-lg leading-none" aria-label={`${value} star rating`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span className={star <= value ? "text-amber-500" : "text-slate-300"} key={star}>*</span>
      ))}
    </div>
  );
}

function VerificationSkeleton({ subtitle }) {
  return (
    <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <AppNavbar subtitle={subtitle} />
      <div className="mx-auto mt-5 grid max-w-7xl gap-5 lg:grid-cols-[250px_1fr]">
        <Skeleton className="h-80 w-full" />
        <div className="space-y-5">
          <Skeleton className="h-52 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </main>
  );
}

function cardTone(status) {
  if (status === "Approved") return "border-emerald-100 bg-emerald-50/70";
  if (status === "Rejected") return "border-rose-100 bg-rose-50/70";
  return "border-white/70 bg-white/75";
}

function dotColor(status) {
  if (status === "Approved") return "bg-emerald-500";
  if (status === "Rejected") return "bg-rose-500";
  return "bg-amber-500";
}

function workplaceValue(item) {
  return `${item.employerId}|${item.companyName}`;
}

function formatDate(value) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}
