"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AppNavbar from "../../components/dashboard/AppNavbar";
import StatCard from "../../components/dashboard/StatCard";
import {
  addCompanyWorker,
  addWorkerRating,
  createCompanyProfile,
  createJob,
  deleteJob,
  getCompanyProfile,
  getCompanyWorkers,
  getEmployerJobs,
  getJobApplications,
  updateApplicationStatus,
  updateCompanyProfile,
  updateJob,
  verifyWorkerExperience
} from "../../components/employer/api";
import EmptyState from "../../components/profile/EmptyState";
import ProfileTextArea from "../../components/profile/ProfileTextArea";
import SectionCard from "../../components/profile/SectionCard";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";
import TextField from "../../components/ui/TextField";
import Toast from "../../components/ui/Toast";
import { createChatRoom } from "../../services/chat/api";

const emptyCompany = {
  companyName: "",
  businessType: "",
  ownerName: "",
  email: "",
  phone: "",
  address: "",
  description: ""
};

const emptyWorker = {
  workerId: "",
  workerName: "",
  role: "",
  joiningDate: "",
  status: "active"
};

const emptyJob = {
  title: "",
  salary: "",
  location: "",
  jobType: "full-time",
  skillsRequired: "",
  experienceRequired: "",
  description: ""
};

const navItems = [
  ["overview", "Overview"],
  ["company", "Company"],
  ["workers", "Workers"],
  ["verification", "Verification"],
  ["jobs", "Jobs"],
  ["chat", "Chat"],
  ["ratings", "Ratings"]
];

export default function EmployerDashboardPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [company, setCompany] = useState(emptyCompany);
  const [companyExists, setCompanyExists] = useState(false);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [companyErrors, setCompanyErrors] = useState({});
  const [workers, setWorkers] = useState([]);
  const [workerSearch, setWorkerSearch] = useState("");
  const [workerFilter, setWorkerFilter] = useState("all");
  const [workerModalOpen, setWorkerModalOpen] = useState(false);
  const [workerForm, setWorkerForm] = useState(emptyWorker);
  const [workerErrors, setWorkerErrors] = useState({});
  const [verifications, setVerifications] = useState([]);
  const [commentTarget, setCommentTarget] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [jobs, setJobs] = useState([]);
  const [jobApplications, setJobApplications] = useState({});
  const [jobSearch, setJobSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [jobForm, setJobForm] = useState(emptyJob);
  const [jobErrors, setJobErrors] = useState({});
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingForm, setRatingForm] = useState({ workerId: "", workerName: "", rating: 5, review: "" });
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function loadDashboard() {
      try {
        const [companyData, workerData, jobData] = await Promise.allSettled([
          getCompanyProfile(),
          getCompanyWorkers(),
          getEmployerJobs()
        ]);

        if (!mounted) return;

        if (companyData.status === "fulfilled") {
          setCompany({
            companyName: companyData.value.companyName || "",
            businessType: companyData.value.businessType || "",
            ownerName: companyData.value.ownerName || "",
            email: companyData.value.email || "",
            phone: companyData.value.phone || "",
            address: companyData.value.address || "",
            description: companyData.value.description || ""
          });
          setLogoPreview(companyData.value.companyLogo?.url || "");
          setCompanyExists(true);
        }

        if (workerData.status === "fulfilled") {
          setWorkers(workerData.value.map(normalizeWorker));
        }

        if (jobData.status === "fulfilled") {
          setJobs(jobData.value);
          const applicationEntries = await Promise.all(
            jobData.value.map(async (job) => {
              try {
                return [job._id, await getJobApplications(job._id)];
              } catch (error) {
                return [job._id, []];
              }
            })
          );
          setJobApplications(Object.fromEntries(applicationEntries));
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

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const matchesSearch = `${worker.workerName} ${worker.role}`.toLowerCase().includes(workerSearch.toLowerCase());
      const matchesFilter = workerFilter === "all" || worker.status === workerFilter;
      return matchesSearch && matchesFilter;
    });
  }, [workers, workerFilter, workerSearch]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch = `${job.title} ${job.location}`.toLowerCase().includes(jobSearch.toLowerCase());
      const matchesFilter = jobFilter === "all" || job.jobType === jobFilter;
      return matchesSearch && matchesFilter;
    });
  }, [jobs, jobFilter, jobSearch]);

  const averageRating = useMemo(() => {
    if (!ratings.length) return 0;
    return Math.round((ratings.reduce((total, item) => total + Number(item.rating), 0) / ratings.length) * 10) / 10;
  }, [ratings]);

  const totalApplicants = useMemo(() => {
    return Object.values(jobApplications).reduce((total, applications) => total + applications.length, 0);
  }, [jobApplications]);

  const pendingApplicants = useMemo(() => {
    return Object.values(jobApplications)
      .flat()
      .filter((application) => application.applicationStatus === "Pending").length;
  }, [jobApplications]);

  function showToast(message, type = "success") {
    setToastType(type);
    setToast(message);
  }

  function selectSection(sectionId) {
    setActiveSection(sectionId);
    setMobileNavOpen(false);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validateCompany() {
    const nextErrors = {};
    if (!company.companyName.trim()) nextErrors.companyName = "Company name is required.";
    if (!company.businessType.trim()) nextErrors.businessType = "Business type is required.";
    if (!company.ownerName.trim()) nextErrors.ownerName = "Owner name is required.";
    if (!/^\S+@\S+\.\S+$/.test(company.email)) nextErrors.email = "Enter a valid email address.";
    if (!/^[0-9]{10,15}$/.test(company.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!company.address.trim()) nextErrors.address = "Address is required.";
    setCompanyErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveCompany(event) {
    event.preventDefault();
    if (!validateCompany()) {
      showToast("Please fix the highlighted company fields.", "error");
      return;
    }

    try {
      setSaving(true);
      const savedCompany = companyExists
        ? await updateCompanyProfile(company, companyLogo)
        : await createCompanyProfile(company, companyLogo);
      setCompanyExists(true);
      setLogoPreview(savedCompany.companyLogo?.url || logoPreview);
      showToast(companyExists ? "Company profile updated." : "Company profile created.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  function validateWorker() {
    const nextErrors = {};
    if (!workerForm.workerName.trim()) nextErrors.workerName = "Worker name is required.";
    if (!workerForm.role.trim()) nextErrors.role = "Worker role is required.";
    if (!workerForm.joiningDate) nextErrors.joiningDate = "Joining date is required.";
    setWorkerErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveWorker(event) {
    event.preventDefault();
    if (!validateWorker()) return;

    try {
      setSaving(true);
      let createdWorker = null;

      if (workerForm.workerId.trim()) {
        createdWorker = await addCompanyWorker({
          workerId: workerForm.workerId,
          role: workerForm.role,
          joiningDate: workerForm.joiningDate,
          status: workerForm.status
        });
      }

      const nextWorker = createdWorker ? normalizeWorker(createdWorker) : { ...workerForm, id: crypto.randomUUID() };
      setWorkers((current) => [nextWorker, ...current]);
      setWorkerForm(emptyWorker);
      setWorkerModalOpen(false);
      showToast(workerForm.workerId ? "Worker added to company." : "Worker added locally. Add workerId to sync with API.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function updateVerification(status, item, comments = "") {
    try {
      setSaving(true);

      if (item.workerId) {
        await verifyWorkerExperience({
          workerId: item.workerId,
          experienceId: item.id,
          status,
          employerComments: comments
        });
      }

      setVerifications((current) =>
        current.map((verification) =>
          verification.id === item.id ? { ...verification, status, employerComments: comments } : verification
        )
      );
      setCommentTarget(null);
      setCommentText("");
      showToast(`Experience ${status.toLowerCase()}.`);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  function openJobModal(job = null) {
    setSelectedJob(job);
    setJobForm(
      job
        ? {
            title: job.title || "",
            salary: job.salary || "",
            location: job.location || "",
            jobType: job.jobType || "full-time",
            skillsRequired: Array.isArray(job.skillsRequired) ? job.skillsRequired.join(", ") : job.skillsRequired || "",
            experienceRequired: job.experienceRequired || "",
            description: job.description || ""
          }
        : emptyJob
    );
    setJobErrors({});
    setJobModalOpen(true);
  }

  function validateJob() {
    const nextErrors = {};
    if (!jobForm.title.trim()) nextErrors.title = "Job title is required.";
    if (!jobForm.salary.trim()) nextErrors.salary = "Salary is required.";
    if (!jobForm.location.trim()) nextErrors.location = "Location is required.";
    if (!jobForm.experienceRequired.trim()) nextErrors.experienceRequired = "Experience is required.";
    if (!jobForm.description.trim()) nextErrors.description = "Description is required.";
    setJobErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveJob(event) {
    event.preventDefault();
    if (!validateJob()) return;

    const payload = {
      ...jobForm,
      skillsRequired: jobForm.skillsRequired
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    };

    try {
      setSaving(true);
      const savedJob = selectedJob?._id
        ? await updateJob(selectedJob._id, payload)
        : await createJob(payload);
      setJobs((current) =>
        selectedJob?._id
          ? current.map((job) => (job._id === selectedJob._id ? savedJob : job))
          : [savedJob, ...current]
      );
      setJobApplications((current) => ({
        ...current,
        [savedJob._id]: current[savedJob._id] || []
      }));
      setJobModalOpen(false);
      showToast(selectedJob ? "Job updated." : "Job posted.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteJob() {
    if (!deleteTarget) return;

    try {
      setSaving(true);
      if (deleteTarget._id) {
        await deleteJob(deleteTarget._id);
      }
      setJobs((current) => current.filter((job) => job._id !== deleteTarget._id));
      setJobApplications((current) => {
        const next = { ...current };
        delete next[deleteTarget._id];
        return next;
      });
      setDeleteTarget(null);
      showToast("Job deleted.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function changeApplicationStatus(jobId, applicationId, applicationStatus) {
    try {
      setSaving(true);
      const updatedApplication = await updateApplicationStatus(applicationId, applicationStatus);
      setJobApplications((current) => ({
        ...current,
        [jobId]: (current[jobId] || []).map((application) =>
          application._id === applicationId
            ? {
                ...updatedApplication,
                workerId: application.workerId || updatedApplication.workerId,
                jobId: application.jobId || updatedApplication.jobId
              }
            : application
        )
      }));
      showToast(`Application marked ${applicationStatus}.`);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveRating(event) {
    event.preventDefault();
    if (!ratingForm.workerName.trim()) {
      showToast("Choose a worker before rating.", "error");
      return;
    }

    try {
      setSaving(true);

      if (ratingForm.workerId) {
        await addWorkerRating({
          workerId: ratingForm.workerId,
          rating: ratingForm.rating,
          review: ratingForm.review
        });
      }

      setRatings((current) => [{ ...ratingForm }, ...current]);
      setRatingModalOpen(false);
      showToast(ratingForm.workerId ? "Worker rating submitted." : "Rating added locally. Add workerId to sync with API.");
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function openApplicantChat(application) {
    try {
      setSaving(true);
      const room = await createChatRoom({ applicationId: application._id });
      router.push(`/chat/${room._id}`);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
            <Skeleton className="h-96 w-full" />
            <div className="space-y-4">
              <Skeleton className="h-52 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#eef7fb_0%,#f8fafc_48%,#eef2ff_100%)]">
      <AppNavbar subtitle="Employer Dashboard" />
      <Toast message={toast} type={toastType} />

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8">
        <EmployerSidebar
          activeSection={activeSection}
          mobileOpen={mobileNavOpen}
          onSelect={selectSection}
          onToggle={() => setMobileNavOpen((current) => !current)}
        />

        <div className="space-y-5">
          <section
            className="overflow-hidden rounded-2xl border border-white/70 bg-white/75 shadow-2xl shadow-slate-900/10 backdrop-blur-xl"
            id="overview"
          >
            <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1fr_340px]">
              <div>
                <p className="text-sm font-black uppercase text-cyan-700">Employer command center</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Manage hiring, workers, and trust signals.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Built for bakery owners, hotel managers, and restaurant teams who need clean worker operations in one place.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-sm font-black text-cyan-200">Company profile</p>
                <h2 className="mt-4 text-2xl font-black">{company.companyName || "Not created yet"}</h2>
                <p className="mt-2 text-sm text-slate-300">{company.businessType || "Add business type"}</p>
                <Button className="mt-6 w-full" type="button" variant="secondary" onClick={() => selectSection("company")}>
                  Edit company
                </Button>
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Workers" value={workers.length} />
            <StatCard label="Open jobs" value={jobs.length} tone="emerald" />
            <StatCard label="Applicants" value={totalApplicants} tone="amber" />
            <StatCard label="Avg rating" value={averageRating || "0.0"} tone="slate" />
          </div>

          <CompanySection
            company={company}
            companyErrors={companyErrors}
            companyExists={companyExists}
            logoPreview={logoPreview}
            saving={saving}
            onChange={(field, value) => {
              setCompany((current) => ({ ...current, [field]: value }));
              setCompanyErrors((current) => ({ ...current, [field]: "" }));
            }}
            onLogo={(file) => {
              setCompanyLogo(file);
              setLogoPreview(file ? URL.createObjectURL(file) : "");
            }}
            onSubmit={saveCompany}
          />

          <WorkersSection
            filteredWorkers={filteredWorkers}
            search={workerSearch}
            filter={workerFilter}
            onFilter={setWorkerFilter}
            onOpenModal={() => setWorkerModalOpen(true)}
            onRate={(worker) => {
              setRatingForm({
                workerId: worker.workerId || "",
                workerName: worker.workerName,
                rating: 5,
                review: ""
              });
              setRatingModalOpen(true);
            }}
            onSearch={setWorkerSearch}
          />

          <VerificationSection
            onApprove={(item) => updateVerification("Approved", item, item.employerComments)}
            onComment={(item, status) => {
              setCommentTarget({ ...item, nextStatus: status });
              setCommentText(item.employerComments || "");
            }}
            onReject={(item) => updateVerification("Rejected", item, item.employerComments)}
            verifications={verifications}
          />

          <JobsSection
            applicationsByJob={jobApplications}
            filteredJobs={filteredJobs}
            filter={jobFilter}
            pendingApplicants={pendingApplicants}
            saving={saving}
            search={jobSearch}
            onDelete={setDeleteTarget}
            onEdit={openJobModal}
            onFilter={setJobFilter}
            onChat={openApplicantChat}
            onOpenCreate={() => openJobModal()}
            onSearch={setJobSearch}
            onStatus={changeApplicationStatus}
            onView={setSelectedJob}
            onViewProfile={setSelectedApplicant}
          />

          <RatingsSection averageRating={averageRating} ratings={ratings} onOpen={() => setRatingModalOpen(true)} />
        </div>
      </div>

      <WorkerModal
        errors={workerErrors}
        form={workerForm}
        open={workerModalOpen}
        saving={saving}
        onChange={(field, value) => {
          setWorkerForm((current) => ({ ...current, [field]: value }));
          setWorkerErrors((current) => ({ ...current, [field]: "" }));
        }}
        onClose={() => setWorkerModalOpen(false)}
        onSubmit={saveWorker}
      />
      <JobModal
        errors={jobErrors}
        form={jobForm}
        open={jobModalOpen}
        saving={saving}
        title={selectedJob ? "Edit job" : "Create job"}
        onChange={(field, value) => {
          setJobForm((current) => ({ ...current, [field]: value }));
          setJobErrors((current) => ({ ...current, [field]: "" }));
        }}
        onClose={() => setJobModalOpen(false)}
        onSubmit={saveJob}
      />
      <JobDetailsModal job={selectedJob} open={Boolean(selectedJob && !jobModalOpen)} onClose={() => setSelectedJob(null)} />
      <WorkerProfileModal application={selectedApplicant} onClose={() => setSelectedApplicant(null)} />
      <DeleteJobModal job={deleteTarget} saving={saving} onClose={() => setDeleteTarget(null)} onConfirm={confirmDeleteJob} />
      <CommentModal
        comment={commentText}
        target={commentTarget}
        saving={saving}
        onChange={setCommentText}
        onClose={() => setCommentTarget(null)}
        onSubmit={() => updateVerification(commentTarget.nextStatus, commentTarget, commentText)}
      />
      <RatingModal
        form={ratingForm}
        open={ratingModalOpen}
        saving={saving}
        workers={workers}
        onChange={(field, value) => setRatingForm((current) => ({ ...current, [field]: value }))}
        onClose={() => setRatingModalOpen(false)}
        onSubmit={saveRating}
      />
    </main>
  );
}

function EmployerSidebar({ activeSection, mobileOpen, onSelect, onToggle }) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <button
        className="mb-3 w-full rounded-lg border border-white/70 bg-white/80 px-4 py-3 text-left text-sm font-black text-slate-800 shadow-lg lg:hidden"
        type="button"
        onClick={onToggle}
      >
        Employer menu
      </button>
      <div className={`${mobileOpen ? "block" : "hidden"} rounded-2xl border border-white/70 bg-white/75 p-3 shadow-xl shadow-slate-900/5 backdrop-blur-xl lg:block`}>
        <div className="grid gap-2">
          {navItems.map(([id, label]) => (
            id === "chat" ? (
              <a
                className="rounded-lg px-4 py-3 text-left text-sm font-black text-slate-600 transition hover:bg-white hover:text-slate-950"
                href="/chat"
                key={id}
              >
                {label}
              </a>
            ) : (
              <button
                className={`rounded-lg px-4 py-3 text-left text-sm font-black transition ${
                  activeSection === id
                    ? "bg-slate-950 text-white shadow-lg shadow-slate-950/20"
                    : "text-slate-600 hover:bg-white hover:text-slate-950"
                }`}
                key={id}
                type="button"
                onClick={() => onSelect(id)}
              >
                {label}
              </button>
            )
          ))}
        </div>
      </div>
    </aside>
  );
}

function CompanySection({ company, companyErrors, companyExists, logoPreview, saving, onChange, onLogo, onSubmit }) {
  return (
    <SectionCard
      id="company"
      title="Company Profile"
      subtitle="Create, update, and preview your public employer identity."
      action={<StatusBadge status={companyExists ? "Active" : "Pending"} />}
    >
      <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <TextField error={companyErrors.companyName} label="Company name" value={company.companyName} onChange={(event) => onChange("companyName", event.target.value)} />
            <TextField error={companyErrors.businessType} label="Business type" placeholder="Bakery, hotel, restaurant" value={company.businessType} onChange={(event) => onChange("businessType", event.target.value)} />
            <TextField error={companyErrors.ownerName} label="Owner name" value={company.ownerName} onChange={(event) => onChange("ownerName", event.target.value)} />
            <TextField error={companyErrors.email} label="Email" type="email" value={company.email} onChange={(event) => onChange("email", event.target.value)} />
            <TextField error={companyErrors.phone} label="Phone" value={company.phone} onChange={(event) => onChange("phone", event.target.value)} />
            <TextField error={companyErrors.address} label="Address" value={company.address} onChange={(event) => onChange("address", event.target.value)} />
          </div>
          <ProfileTextArea label="Description" value={company.description} onChange={(event) => onChange("description", event.target.value)} />
          <Button loading={saving} type="submit">
            {companyExists ? "Update company profile" : "Save company profile"}
          </Button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-5">
          <label className="block cursor-pointer">
            <span className="mb-3 block text-sm font-bold text-slate-700">Company logo</span>
            <input accept="image/*" className="hidden" type="file" onChange={(event) => onLogo(event.target.files?.[0] || null)} />
            <div className="grid aspect-square place-items-center overflow-hidden rounded-2xl bg-slate-950 text-white shadow-inner">
              {logoPreview ? (
                <img alt="Company logo preview" className="h-full w-full object-cover" src={logoPreview} />
              ) : (
                <span className="text-sm font-black text-slate-300">Upload logo</span>
              )}
            </div>
          </label>
          <div className="mt-5 rounded-xl bg-cyan-50 p-4">
            <p className="text-sm font-black text-cyan-900">{company.companyName || "Company preview"}</p>
            <p className="mt-1 text-sm text-cyan-800">{company.businessType || "Business type"}</p>
            <p className="mt-3 text-sm leading-6 text-slate-600">{company.description || "Add a short description to help workers trust your workplace."}</p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function WorkersSection({ filteredWorkers, filter, onFilter, onOpenModal, onRate, onSearch, search }) {
  return (
    <SectionCard
      id="workers"
      title="Workers"
      subtitle="Add workers under your company, then search and filter them by status."
      action={<Button type="button" onClick={onOpenModal}>Add worker</Button>}
    >
      <Toolbar
        filter={filter}
        filterOptions={["all", "active", "inactive", "pending"]}
        placeholder="Search worker or role"
        search={search}
        onFilter={onFilter}
        onSearch={onSearch}
      />
      {filteredWorkers.length === 0 ? (
        <EmptyState title="No workers found" text="Add your first worker or adjust the search filters." />
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white/70">
          <div className="hidden grid-cols-[1fr_1fr_150px_120px_120px] gap-3 border-b border-slate-200 px-4 py-3 text-xs font-black uppercase text-slate-500 md:grid">
            <span>Worker</span>
            <span>Role</span>
            <span>Joining</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {filteredWorkers.map((worker) => (
            <div className="grid gap-3 border-b border-slate-100 px-4 py-4 last:border-b-0 md:grid-cols-[1fr_1fr_150px_120px_120px] md:items-center" key={worker.id || worker.workerId || worker.workerName}>
              <div>
                <p className="font-black text-slate-950">{worker.workerName}</p>
                <p className="text-xs font-semibold text-slate-500">{worker.workerId || "No API worker id"}</p>
              </div>
              <p className="text-sm font-bold text-slate-700">{worker.role}</p>
              <p className="text-sm text-slate-600">{worker.joiningDate}</p>
              <StatusBadge status={worker.status} />
              <button className="text-left text-sm font-black text-cyan-800" type="button" onClick={() => onRate(worker)}>
                Rate
              </button>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function VerificationSection({ onApprove, onComment, onReject, verifications }) {
  return (
    <SectionCard
      id="verification"
      title="Experience Verification"
      subtitle="Approve or reject worker experience claims with employer comments."
      action={<Button href="/employer/verification-requests" type="button" variant="soft">Open requests</Button>}
    >
      {verifications.length === 0 ? (
        <EmptyState title="No verification requests" text="Worker experience verification requests will appear here." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {verifications.map((item) => (
            <article className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-lg shadow-slate-900/5" key={item.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-slate-950">{item.workerName}</h3>
                  <p className="mt-1 text-sm font-bold text-slate-600">{item.role} at {item.company}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{item.period}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              {item.employerComments && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{item.employerComments}</p>}
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Button type="button" variant="soft" onClick={() => onApprove(item)}>Approve</Button>
                <Button type="button" variant="secondary" onClick={() => onReject(item)}>Reject</Button>
                <Button type="button" variant="secondary" onClick={() => onComment(item, item.status)}>Comment</Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function JobsSection({
  applicationsByJob,
  filteredJobs,
  filter,
  onDelete,
  onEdit,
  onFilter,
  onChat,
  onOpenCreate,
  onSearch,
  onStatus,
  onView,
  onViewProfile,
  pendingApplicants,
  saving,
  search
}) {
  return (
    <SectionCard
      id="jobs"
      title="Job Posting System"
      subtitle={`${pendingApplicants} pending applicant${pendingApplicants === 1 ? "" : "s"} across your posted jobs.`}
      action={<Button type="button" onClick={onOpenCreate}>Create job</Button>}
    >
      <Toolbar
        filter={filter}
        filterOptions={["all", "full-time", "part-time", "contract", "temporary", "internship"]}
        placeholder="Search jobs or location"
        search={search}
        onFilter={onFilter}
        onSearch={onSearch}
      />
      {filteredJobs.length === 0 ? (
        <div className="mt-5">
          <EmptyState title="No jobs posted yet" text="Create a job post to start attracting verified workers." />
        </div>
      ) : (
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {filteredJobs.map((job) => (
            <article className="rounded-2xl border border-white/70 bg-white/75 p-5 shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 hover:shadow-xl" key={job._id || job.title}>
              <JobCard
                applications={applicationsByJob[job._id] || []}
                job={job}
                saving={saving}
                onChat={onChat}
                onDelete={onDelete}
                onEdit={onEdit}
                onStatus={onStatus}
                onView={onView}
                onViewProfile={onViewProfile}
              />
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

function JobCard({ applications, job, onChat, onDelete, onEdit, onStatus, onView, onViewProfile, saving }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">{job.title}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-500">{job.location} - {job.salary}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={job.jobType} />
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
            {applications.length} applicant{applications.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>
      <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {(job.skillsRequired || []).map((skill) => (
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-800" key={skill}>{skill}</span>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Button type="button" variant="secondary" onClick={() => onView(job)}>View</Button>
        <Button type="button" variant="soft" onClick={() => onEdit(job)}>Edit</Button>
        <Button type="button" variant="secondary" onClick={() => onDelete(job)}>Delete</Button>
      </div>
      <ApplicantsList applications={applications} jobId={job._id} saving={saving} onChat={onChat} onStatus={onStatus} onViewProfile={onViewProfile} />
    </>
  );
}

function ApplicantsList({ applications, jobId, onChat, onStatus, onViewProfile, saving }) {
  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-white/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-black text-slate-950">Applicants</h4>
        <span className="text-xs font-bold text-slate-500">{applications.length} total</span>
      </div>
      {applications.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No applicants yet" text="Worker applications for this job will appear here." />
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {applications.map((application) => (
            <article className="rounded-xl border border-slate-200 bg-white p-4" key={application._id}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h5 className="font-black text-slate-950">{application.workerId?.name || "Worker"}</h5>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{application.workerId?.email || "Email not available"}</p>
                  <p className="mt-2 text-xs font-bold text-slate-400">Applied {formatDate(application.appliedAt || application.applicationDate)}</p>
                  <ApplicantProfile profile={application.workerProfile} />
                  {application.coverLetter && <p className="mt-3 text-sm leading-6 text-slate-600">{application.coverLetter}</p>}
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:min-w-72">
                  <StatusBadge status={application.applicationStatus} />
                  {application.resume?.url ? (
                    <Button href={application.resume.url} type="button" variant="secondary">Resume file</Button>
                  ) : (
                    <span className="inline-flex min-h-12 items-center justify-center rounded-lg bg-slate-100 px-4 text-sm font-black text-slate-500">
                      No file
                    </span>
                  )}
                  <Button disabled={saving} type="button" variant="soft" onClick={() => onStatus(jobId, application._id, "Reviewed")}>Reviewed</Button>
                  <Button type="button" variant="soft" onClick={() => onViewProfile(application)}>View Profile</Button>
                  <Button disabled={saving} type="button" onClick={() => onChat(application)}>Chat</Button>
                  <Button disabled={saving} type="button" onClick={() => onStatus(jobId, application._id, "Accepted")}>Accept</Button>
                  <Button disabled={saving} type="button" variant="secondary" onClick={() => onStatus(jobId, application._id, "Rejected")}>Reject</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicantProfile({ profile }) {
  if (!profile) {
    return (
      <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-900">
        No WorkCred profile attached.
      </div>
    );
  }

  const title = profile.customJobTitle || labelize(profile.jobCategory || "worker");

  return (
    <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50/70 p-3">
      <p className="text-xs font-black uppercase text-cyan-800">WorkCred digital resume</p>
      <div className="mt-2 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
        <span><strong className="text-slate-950">Role:</strong> {title}</span>
        <span><strong className="text-slate-950">Location:</strong> {profile.location || "Not provided"}</span>
        <span><strong className="text-slate-950">Phone:</strong> {profile.phone || "Not provided"}</span>
        <span><strong className="text-slate-950">Availability:</strong> {labelize(profile.availabilityStatus)}</span>
      </div>
      {profile.bio && <p className="mt-2 text-sm leading-6 text-slate-600">{profile.bio}</p>}
      {(profile.skills || []).length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {profile.skills.slice(0, 8).map((skill) => (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-cyan-800" key={skill}>{skill}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkerProfileModal({ application, onClose }) {
  const profile = application?.workerProfile;
  const worker = application?.workerId || {};

  if (!application) {
    return null;
  }

  if (!profile) {
    return (
      <Dialog open={Boolean(application)} title="Worker profile" onClose={onClose}>
        <EmptyState title="Profile not available" text="This application does not have a saved WorkCred profile attached yet." />
      </Dialog>
    );
  }

  const title = profile.customJobTitle || labelize(profile.jobCategory || "worker");
  const resume = profile.resume || application.resume;

  return (
    <Dialog open={Boolean(application)} title={profile.fullName || worker.name || "Worker profile"} onClose={onClose}>
      <div className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[140px_1fr]">
          <div className="grid h-32 w-32 place-items-center overflow-hidden rounded-2xl bg-slate-950 text-3xl font-black text-white">
            {profile.profilePhoto?.url ? (
              <img alt={profile.fullName || "Worker"} className="h-full w-full object-cover" src={profile.profilePhoto.url} />
            ) : (
              <span>{getInitials(profile.fullName || worker.name)}</span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-2xl font-black text-slate-950">{profile.fullName || worker.name || "Worker"}</h3>
              <StatusBadge status={profile.availabilityStatus || "available"} />
            </div>
            <p className="mt-1 text-sm font-bold text-slate-500">{title}</p>
            {profile.bio && <p className="mt-4 text-sm leading-6 text-slate-600">{profile.bio}</p>}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoTile label="Email" value={profile.email || worker.email} />
          <InfoTile label="Phone" value={profile.phone} />
          <InfoTile label="Location" value={profile.location} />
          <InfoTile label="Gender" value={profile.gender} />
        </div>

        <ProfileBlock title="Skills">
          {(profile.skills || []).length ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-800" key={skill}>{skill}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-slate-500">No skills added.</p>
          )}
        </ProfileBlock>

        <div className="grid gap-4 lg:grid-cols-2">
          <ProfileBlock title="Languages">
            {(profile.languages || []).length ? (
              <div className="flex flex-wrap gap-2">
                {profile.languages.map((language) => (
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-700" key={language}>{language}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm font-semibold text-slate-500">No languages added.</p>
            )}
          </ProfileBlock>

          <ProfileBlock title="Optional Resume File">
            {resume?.url ? (
              <Button href={resume.url} type="button" variant="secondary">{resume.originalName || resume.fileName || "Open resume file"}</Button>
            ) : (
              <p className="text-sm font-semibold text-slate-500">No resume file uploaded. WorkCred profile is being used as the digital resume.</p>
            )}
          </ProfileBlock>
        </div>

        <ProfileBlock title="Experience">
          {(profile.experience || []).length ? (
            <div className="grid gap-3">
              {profile.experience.map((item, index) => (
                <article className="rounded-xl border border-slate-200 bg-white p-4" key={`${item.jobTitle}-${item.company}-${index}`}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="font-black text-slate-950">{item.jobTitle || "Role"}</h4>
                      <p className="text-sm font-bold text-slate-500">{item.company || "Company not provided"}</p>
                    </div>
                    <span className="text-xs font-black text-slate-400">
                      {item.startDate || "Start"} - {item.current ? "Present" : item.endDate || "End"}
                    </span>
                  </div>
                  {item.description && <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>}
                  {item.years ? <p className="mt-2 text-xs font-bold text-cyan-700">{item.years} year{item.years === 1 ? "" : "s"} experience</p> : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold text-slate-500">No experience added.</p>
          )}
        </ProfileBlock>

        {application.coverLetter && (
          <ProfileBlock title="Application Note">
            <p className="text-sm leading-6 text-slate-600">{application.coverLetter}</p>
          </ProfileBlock>
        )}
      </div>
    </Dialog>
  );
}

function ProfileBlock({ children, title }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <h4 className="mb-3 text-sm font-black uppercase text-slate-500">{title}</h4>
      {children}
    </section>
  );
}

function RatingsSection({ averageRating, onOpen, ratings }) {
  return (
    <SectionCard
      id="ratings"
      title="Worker Rating System"
      subtitle="Add reviews and track average worker ratings."
      action={<Button type="button" onClick={onOpen}>Add rating</Button>}
    >
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-2xl bg-slate-950 p-5 text-white">
          <p className="text-sm font-black text-cyan-200">Average rating</p>
          <div className="mt-4 flex items-end gap-3">
            <span className="text-5xl font-black">{averageRating || "0.0"}</span>
            <span className="pb-2 text-sm text-slate-300">/ 5</span>
          </div>
          <div className="mt-4"><Stars value={Math.round(averageRating)} /></div>
        </div>
        <div className="grid gap-3">
          {ratings.length === 0 ? (
            <EmptyState title="No ratings yet" text="Submitted worker ratings will appear here." />
          ) : (
            ratings.map((item, index) => (
              <article className="rounded-2xl border border-slate-200 bg-white/70 p-4" key={`${item.workerName}-${index}`}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-black text-slate-950">{item.workerName}</h3>
                  <Stars value={item.rating} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.review || "No written review added."}</p>
              </article>
            ))
          )}
        </div>
      </div>
    </SectionCard>
  );
}

function Toolbar({ filter, filterOptions, onFilter, onSearch, placeholder, search }) {
  return (
    <div className="mb-5 grid gap-3 md:grid-cols-[1fr_220px]">
      <input
        className="min-h-12 rounded-lg border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/70"
        placeholder={placeholder}
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />
      <select
        className="min-h-12 rounded-lg border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/70"
        value={filter}
        onChange={(event) => onFilter(event.target.value)}
      >
        {filterOptions.map((option) => (
          <option key={option} value={option}>{labelize(option)}</option>
        ))}
      </select>
    </div>
  );
}

function WorkerModal({ errors, form, onChange, onClose, onSubmit, open, saving }) {
  return (
    <Dialog open={open} title="Add worker" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <TextField helper="Optional. Required only when syncing to backend." label="Worker API id" value={form.workerId} onChange={(event) => onChange("workerId", event.target.value)} />
        <TextField error={errors.workerName} label="Worker name" value={form.workerName} onChange={(event) => onChange("workerName", event.target.value)} />
        <TextField error={errors.role} label="Worker role" value={form.role} onChange={(event) => onChange("role", event.target.value)} />
        <TextField error={errors.joiningDate} label="Joining date" type="date" value={form.joiningDate} onChange={(event) => onChange("joiningDate", event.target.value)} />
        <SelectField label="Worker status" value={form.status} options={["active", "inactive", "pending"]} onChange={(value) => onChange("status", value)} />
        <Button className="w-full" loading={saving} type="submit">Save worker</Button>
      </form>
    </Dialog>
  );
}

function JobModal({ errors, form, onChange, onClose, onSubmit, open, saving, title }) {
  return (
    <Dialog open={open} title={title} onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField error={errors.title} label="Title" value={form.title} onChange={(event) => onChange("title", event.target.value)} />
          <TextField error={errors.salary} label="Salary" value={form.salary} onChange={(event) => onChange("salary", event.target.value)} />
          <TextField error={errors.location} label="Location" value={form.location} onChange={(event) => onChange("location", event.target.value)} />
          <SelectField label="Job type" value={form.jobType} options={["full-time", "part-time", "contract", "temporary", "internship"]} onChange={(value) => onChange("jobType", value)} />
        </div>
        <TextField label="Skills required" helper="Separate skills with commas." value={form.skillsRequired} onChange={(event) => onChange("skillsRequired", event.target.value)} />
        <TextField error={errors.experienceRequired} label="Experience required" value={form.experienceRequired} onChange={(event) => onChange("experienceRequired", event.target.value)} />
        <ProfileTextArea error={errors.description} label="Description" value={form.description} onChange={(event) => onChange("description", event.target.value)} />
        <Button className="w-full" loading={saving} type="submit">Save job</Button>
      </form>
    </Dialog>
  );
}

function JobDetailsModal({ job, onClose, open }) {
  if (!job) return null;
  return (
    <Dialog open={open} title={job.title} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile label="Salary" value={job.salary} />
          <InfoTile label="Location" value={job.location} />
          <InfoTile label="Job type" value={labelize(job.jobType)} />
          <InfoTile label="Experience" value={job.experienceRequired} />
        </div>
        <p className="text-sm leading-6 text-slate-600">{job.description}</p>
      </div>
    </Dialog>
  );
}

function DeleteJobModal({ job, onClose, onConfirm, saving }) {
  return (
    <Dialog open={Boolean(job)} title="Delete job" onClose={onClose}>
      <p className="text-sm leading-6 text-slate-600">This will remove {job?.title || "this job"} from your employer jobs dashboard.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button loading={saving} type="button" onClick={onConfirm}>Delete job</Button>
      </div>
    </Dialog>
  );
}

function CommentModal({ comment, onChange, onClose, onSubmit, saving, target }) {
  return (
    <Dialog open={Boolean(target)} title="Employer comments" onClose={onClose}>
      <div className="space-y-4">
        <ProfileTextArea label="Comments" value={comment} onChange={(event) => onChange(event.target.value)} />
        <Button className="w-full" loading={saving} type="button" onClick={onSubmit}>Save comments</Button>
      </div>
    </Dialog>
  );
}

function RatingModal({ form, onChange, onClose, onSubmit, open, saving, workers }) {
  return (
    <Dialog open={open} title="Add worker rating" onClose={onClose}>
      <form className="space-y-4" onSubmit={onSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Worker</span>
          <select
            className="min-h-12 w-full rounded-lg border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/70"
            value={form.workerName}
            onChange={(event) => {
              const worker = workers.find((item) => item.workerName === event.target.value);
              onChange("workerName", event.target.value);
              onChange("workerId", worker?.workerId || "");
            }}
          >
            <option value="">Select worker</option>
            {workers.map((worker) => (
              <option key={worker.id || worker.workerName} value={worker.workerName}>{worker.workerName}</option>
            ))}
          </select>
        </label>
        <div>
          <span className="mb-2 block text-sm font-bold text-slate-700">Rating</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                className={`h-11 w-11 rounded-lg text-lg font-black transition ${star <= form.rating ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-400"}`}
                key={star}
                type="button"
                onClick={() => onChange("rating", star)}
              >
                *
              </button>
            ))}
          </div>
        </div>
        <ProfileTextArea label="Review" value={form.review} onChange={(event) => onChange("review", event.target.value)} />
        <Button className="w-full" loading={saving} type="submit">Submit rating</Button>
      </form>
    </Dialog>
  );
}

function Dialog({ children, onClose, open, title }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/70 bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-black text-slate-950">{title}</h2>
          <button className="rounded-lg px-2 py-1 text-sm font-black text-slate-500 hover:bg-slate-100" type="button" onClick={onClose}>
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SelectField({ label, onChange, options, value }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">{label}</span>
      <select
        className="min-h-12 w-full rounded-lg border border-slate-200 bg-white/85 px-4 text-sm font-semibold text-slate-950 shadow-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-200/70"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>{labelize(option)}</option>
        ))}
      </select>
    </label>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "").toLowerCase();
  const styles = normalized.includes("approved") || normalized.includes("accepted") || normalized.includes("active") || normalized.includes("open")
    ? "bg-emerald-50 text-emerald-700"
    : normalized.includes("reject") || normalized.includes("inactive")
      ? "bg-rose-50 text-rose-700"
      : normalized.includes("review")
        ? "bg-cyan-50 text-cyan-700"
        : "bg-amber-50 text-amber-700";

  return <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${styles}`}>{labelize(status)}</span>;
}

function Stars({ value }) {
  return (
    <div className="flex gap-1 text-lg leading-none text-amber-500" aria-label={`${value} star rating`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span className={star <= value ? "text-amber-500" : "text-slate-300"} key={star}>*</span>
      ))}
    </div>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-black text-slate-900">{value || "Not provided"}</p>
    </div>
  );
}

function normalizeWorker(item) {
  return {
    id: item._id,
    workerId: item.worker?._id || item.worker || "",
    workerName: item.worker?.name || item.workerName || "Worker",
    role: item.role || "",
    joiningDate: item.joiningDate ? String(item.joiningDate).slice(0, 10) : "",
    status: item.status || "active"
  };
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

function getInitials(value) {
  return String(value || "W")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
