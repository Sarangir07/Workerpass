"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, BriefcaseBusiness, Building2, ShieldCheck, Users } from "lucide-react";
import AdminCharts from "./AdminCharts";
import AdminDataTable from "./AdminDataTable";
import adminApi from "./adminApi";
import AdminShell from "./AdminShell";
import { ActionButtons, AdminStatCard, AdminToolbar, ErrorPanel, LoadingPanel, StatusBadge, statIcons } from "./AdminWidgets";

const titles = {
  dashboard: "Dashboard",
  users: "User Management",
  workers: "Workers",
  employers: "Employers",
  jobs: "Job Posts",
  verifications: "Verification Requests",
  reports: "Reports",
  analytics: "Analytics",
  settings: "Settings"
};

const gradients = ["from-cyan-300 to-emerald-300", "from-indigo-300 to-cyan-300", "from-emerald-300 to-lime-200", "from-amber-200 to-orange-300", "from-rose-300 to-amber-200"];

export default function AdminPage({ section = "dashboard" }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const response = await adminApi.get(`/admin/${section}`);
        if (active) setData(response.data);
      } catch (requestError) {
        if (active) setError(requestError.response?.data?.message || requestError.message || "Unable to load admin data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    const refreshInterval = section === "dashboard" ? window.setInterval(loadData, 30000) : null;
    setSearch("");
    setFilter("all");

    return () => {
      active = false;
      if (refreshInterval) {
        window.clearInterval(refreshInterval);
      }
    };
  }, [section]);

  return (
    <AdminShell title={titles[section]}>
      <div className="space-y-6">
        {loading && <LoadingPanel />}
        {!loading && error && <ErrorPanel message={error} />}
        {!loading && !error && renderSection(section, data, search, setSearch, filter, setFilter)}
      </div>
    </AdminShell>
  );
}

function renderSection(section, data, search, setSearch, filter, setFilter) {
  if (section === "dashboard") return <DashboardContent data={data} />;
  if (section === "analytics") return <AnalyticsContent data={data} />;
  if (section === "settings") return <SettingsContent data={data} />;
  if (section === "reports") return <ReportsContent data={data} />;
  if (section === "users") return <UsersContent data={data} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} />;
  if (section === "workers") return <WorkersContent data={data} search={search} setSearch={setSearch} />;
  if (section === "employers") return <EmployersContent data={data} search={search} setSearch={setSearch} />;
  if (section === "jobs") return <JobsContent data={data} search={search} setSearch={setSearch} />;
  if (section === "verifications") return <VerificationsContent data={data} search={search} setSearch={setSearch} />;
  return null;
}

function DashboardContent({ data }) {
  const cards = [
    ["totalUsers", "Total Users"],
    ["totalWorkers", "Total Workers"],
    ["totalEmployers", "Total Employers"],
    ["totalJobs", "Total Jobs"],
    ["pendingVerifications", "Pending Verifications"]
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map(([key, label], index) => {
        const Icon = statIcons[key];
        return <AdminStatCard gradient={gradients[index]} icon={Icon} key={key} label={label} value={data?.[key]} />;
      })}
    </div>
  );
}

function AnalyticsContent({ data }) {
  return (
    <>
      <DashboardContent data={data} />
      <section className="grid gap-5 md:grid-cols-3">
        <InsightCard icon={Users} label="AI insights readiness" value="Prepared" />
        <InsightCard icon={ShieldCheck} label="Monitoring coverage" value="Live hooks ready" />
        <InsightCard icon={BriefcaseBusiness} label="Report pipeline" value="Scalable" />
      </section>
    </>
  );
}

function UsersContent({ data, search, setSearch, filter, setFilter }) {
  const rows = filterRows(data?.users || [], search, filter);
  const columns = [
    { key: "name", label: "Name", render: (row) => <UserCell user={row} /> },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (row) => <span className="font-black capitalize">{row.role || row.userType}</span> },
    { key: "status", label: "Status", render: (row) => <StatusBadge value={row.isBlocked ? "Blocked" : row.isOtpVerified === false ? "Pending" : "Active"} /> },
    { key: "actions", label: "Actions", render: () => <ActionButtons /> }
  ];

  return (
    <>
      <AdminToolbar
        filter={filter}
        filters={[
          { label: "All roles", value: "all" },
          { label: "Workers", value: "worker" },
          { label: "Employers", value: "employer" },
          { label: "Admins", value: "admin" }
        ]}
        search={search}
        onFilter={setFilter}
        onSearch={setSearch}
      />
      <AdminDataTable columns={columns} rows={rows} />
    </>
  );
}

function WorkersContent({ data, search, setSearch }) {
  const rows = searchRows(data?.workers || [], search);
  const columns = [
    { key: "profile", label: "Worker", render: (row) => <UserCell user={row} /> },
    { key: "skills", label: "Skills", render: (row) => <TagList values={row.skills || ["Electrical", "Safety"]} /> },
    { key: "experience", label: "Experience", render: (row) => row.experience || "2+ years" },
    { key: "verification", label: "Verification", render: (row) => <StatusBadge value={row.verificationStatus || (row.isOtpVerified ? "Approved" : "Pending")} /> },
    { key: "actions", label: "Actions", render: () => <ActionButtons /> }
  ];

  return (
    <>
      <AdminToolbar search={search} onSearch={setSearch} />
      <AdminDataTable columns={columns} rows={rows} />
    </>
  );
}

function EmployersContent({ data, search, setSearch }) {
  const rows = searchRows(data?.employers || [], search);
  const columns = [
    { key: "companyName", label: "Company", render: (row) => row.companyName || `${row.name || "Employer"} Company` },
    { key: "owner", label: "Owner", render: (row) => <UserCell user={row} /> },
    { key: "approval", label: "Approval Status", render: (row) => <StatusBadge value={row.approvalStatus || "Pending"} /> },
    { key: "activeJobs", label: "Active Jobs", render: (row) => row.activeJobs || 0 },
    { key: "actions", label: "Actions", render: () => <ActionButtons approve /> }
  ];

  return (
    <>
      <AdminToolbar search={search} onSearch={setSearch} />
      <AdminDataTable columns={columns} rows={rows} />
    </>
  );
}

function JobsContent({ data, search, setSearch }) {
  const rows = searchRows(data?.jobs || [], search);
  const columns = [
    { key: "title", label: "Job Title", render: (row) => <span className="font-black text-white">{row.title}</span> },
    { key: "employer", label: "Employer", render: (row) => row.employer?.name || row.companyName || "Employer" },
    { key: "salary", label: "Salary" },
    { key: "location", label: "Location" },
    { key: "applicants", label: "Applicants", render: (row) => row.applicantsCount || row.applicationsCount || 0 },
    { key: "actions", label: "Actions", render: () => <ActionButtons /> }
  ];

  return (
    <>
      <AdminToolbar search={search} onSearch={setSearch} />
      <AdminDataTable columns={columns} rows={rows} />
    </>
  );
}

function VerificationsContent({ data, search, setSearch }) {
  const rows = searchRows(data?.verifications || [], search);
  const columns = [
    { key: "worker", label: "Worker", render: (row) => row.workerId?.name || "Worker" },
    { key: "employer", label: "Employer", render: (row) => row.employerId?.name || row.companyName || "Employer" },
    { key: "experience", label: "Experience", render: (row) => `${row.workRole || "Role"} at ${row.companyName || "Company"}` },
    { key: "status", label: "Status", render: (row) => <StatusBadge value={row.verificationStatus || "Pending"} /> },
    { key: "actions", label: "Actions", render: () => <ActionButtons approve /> }
  ];

  return (
    <>
      <AdminToolbar search={search} onSearch={setSearch} />
      <AdminDataTable columns={columns} rows={rows} />
    </>
  );
}

function ReportsContent({ data }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      <InsightCard icon={ShieldCheck} label="Open reports" value={data?.summary?.openReports ?? 0} />
      <InsightCard icon={BadgeCheck} label="Resolved reports" value={data?.summary?.resolvedReports ?? 0} />
      <InsightCard icon={Building2} label="Monitoring" value={data?.summary?.monitoringStatus || "Ready"} />
    </div>
  );
}

function SettingsContent({ data }) {
  const settings = data?.settings || {};

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-black text-white">Admin profile</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Display name" value="Platform Admin" />
          <Field label="Email" value="admin@workcred.com" />
          <Field label="Current password" type="password" value="password" />
          <Field label="New password" type="password" value="" placeholder="Enter new password" />
        </div>
        <button className="mt-5 rounded-lg bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950 transition hover:-translate-y-0.5" type="button">
          Save changes
        </button>
      </section>
      <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
        <h2 className="text-lg font-black text-white">Notification settings</h2>
        <div className="mt-5 space-y-4">
          {Object.entries(settings).map(([key, value]) => (
            <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.04] p-4" key={key}>
              <span className="text-sm font-bold text-slate-200">{labelize(key)}</span>
              <input className="h-5 w-5 accent-cyan-300" defaultChecked={Boolean(value)} type="checkbox" />
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}

function filterRows(rows, search, filter) {
  return searchRows(rows, search).filter((row) => filter === "all" || (row.role || row.userType) === filter);
}

function searchRows(rows, search) {
  const query = search.trim().toLowerCase();
  if (!query) return rows;
  return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query));
}

function UserCell({ user }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-cyan-300 to-emerald-300 text-sm font-black text-slate-950">
        {user.profileImage ? "" : user.name?.charAt(0)?.toUpperCase() || "U"}
      </div>
      <div className="min-w-0">
        <p className="truncate font-black text-white">{user.name || "Unnamed user"}</p>
        <p className="truncate text-xs font-semibold text-slate-400">{user.email || "No email"}</p>
      </div>
    </div>
  );
}

function TagList({ values }) {
  return (
    <div className="flex max-w-sm flex-wrap gap-2">
      {values.slice(0, 3).map((value) => (
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-cyan-100" key={value}>
          {value}
        </span>
      ))}
    </div>
  );
}

function InsightCard({ icon: Icon, label, value }) {
  return (
    <article className="rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <Icon className="text-cyan-300" size={24} />
      <p className="mt-4 text-sm font-bold text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </article>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <input
        className="mt-2 h-11 w-full rounded-lg border border-white/10 bg-slate-950/70 px-4 text-sm font-semibold text-white outline-none transition focus:border-cyan-300"
        {...props}
      />
    </label>
  );
}

function labelize(value) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
