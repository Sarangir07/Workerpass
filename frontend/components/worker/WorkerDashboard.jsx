"use client";

import { useEffect, useMemo, useState } from "react";
import AppNavbar from "../dashboard/AppNavbar";
import Sidebar from "../dashboard/Sidebar";
import StatCard from "../dashboard/StatCard";
import AvailabilitySection from "../profile/AvailabilitySection";
import { getCurrentWorkerProfile, mapWorkerProfileFromApi, saveWorkerProfile } from "../profile/api";
import CategorySection from "../profile/CategorySection";
import ExperienceSection from "../profile/ExperienceSection";
import FileUploadSection from "../profile/FileUploadSection";
import LanguagesSection from "../profile/LanguagesSection";
import PersonalDetailsSection from "../profile/PersonalDetailsSection";
import ProfilePreview from "../profile/ProfilePreview";
import SectionCard from "../profile/SectionCard";
import EmptyState from "../profile/EmptyState";
import SkillsSection from "../profile/SkillsSection";
import Button from "../ui/Button";
import Skeleton from "../ui/Skeleton";
import Toast from "../ui/Toast";
import WorkerJobSummary from "./WorkerJobSummary";
import useProfileCompletion from "../../hooks/useProfileCompletion";
import { availabilityOptions, initialProfile, workerCategories } from "../../lib/profileData";
import { getWorkerVerifications } from "../verification/api";

export default function WorkerDashboard() {
  const [profile, setProfile] = useState(initialProfile);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [verificationItems, setVerificationItems] = useState([]);
  const completion = useProfileCompletion(profile);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      try {
        const existingProfile = await getCurrentWorkerProfile();

        if (mounted && existingProfile) {
          setProfile(existingProfile);
        }
      } catch (error) {
        if (mounted) {
          setToastType("error");
          setToast(error.message || "Could not load your worker profile.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadVerifications() {
      try {
        const data = await getWorkerVerifications();

        if (mounted) {
          setVerificationItems(data);
        }
      } catch (error) {
        if (mounted) {
          setVerificationItems([]);
        }
      }
    }

    loadVerifications();
    return () => {
      mounted = false;
    };
  }, []);

  const category = useMemo(
    () => workerCategories.find((item) => item.id === profile.category),
    [profile.category]
  );
  const availability = useMemo(
    () => availabilityOptions.find((item) => item.id === profile.availability),
    [profile.availability]
  );
  const verificationStats = useMemo(
    () => ({
      approved: verificationItems.filter((item) => item.verificationStatus === "Approved").length,
      pending: verificationItems.filter((item) => item.verificationStatus === "Pending").length,
      rejected: verificationItems.filter((item) => item.verificationStatus === "Rejected").length
    }),
    [verificationItems]
  );

  function updateProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function selectSection(sectionId) {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function validate() {
    const nextErrors = {};

    if (!profile.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!/^[0-9]{10,15}$/.test(profile.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!/^\S+@\S+\.\S+$/.test(profile.email)) nextErrors.email = "Enter a valid email address.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveProfile() {
    if (!validate()) {
      setToastType("error");
      setToast("Please fix the highlighted fields.");
      return;
    }

    try {
      setSaving(true);
      setToast("");
      const savedProfile = await saveWorkerProfile(profile);
      setProfile(mapWorkerProfileFromApi(savedProfile));
      setToastType("success");
      setToast("Worker dashboard saved successfully.");
    } catch (error) {
      setToastType("error");
      setToast(error.message || "Worker dashboard save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#b6f0e7_0,#eef7fb_28%,#f8fafc_62%,#eef2ff_100%)]">
      <AppNavbar subtitle="Worker Dashboard" />
      <Toast message={toast} type={toastType} />

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <Sidebar activeSection={activeSection} onSelect={selectSection} />

        <div className="space-y-5">
          <section
            className="overflow-hidden rounded-2xl border border-white/70 bg-white/75 shadow-2xl shadow-slate-900/10 backdrop-blur-xl"
            id="overview"
          >
            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_300px]">
              <div>
                <p className="text-sm font-black uppercase text-cyan-700">Worker Dashboard</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Welcome back, {profile.fullName.split(" ")[0] || "Worker"}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Manage your WorkCred dashboard, show verified skills, and help employers understand your fit before
                  they contact you.
                </p>
                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
                    <span>Profile completion</span>
                    <span>{completion}%</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500" style={{ width: `${completion}%` }} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-sm font-black text-cyan-200">Current status</p>
                <h2 className="mt-5 text-2xl font-black">{category?.label || "Not selected"}</h2>
                <p className="mt-2 text-sm text-slate-300">{availability?.label || "Set your availability"}</p>
                <Button className="mt-6 w-full" type="button" variant="secondary" onClick={() => selectSection("preview")}>
                  View preview
                </Button>
              </div>
            </div>
          </section>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Skills added" value={profile.skills.length} />
            <StatCard label="Experience roles" value={profile.experiences.length} tone="emerald" />
            <StatCard label="Languages" value={profile.languages.length} tone="amber" />
            <StatCard label="Verification" value="Ready" tone="slate" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <SectionCard title="Recent Activity" subtitle="Latest profile changes and verification events.">
              <EmptyState title="No recent activity" text="Activity will appear after you update your worker profile." />
            </SectionCard>
            <SectionCard title="Notifications" subtitle="Worker dashboard alerts and reminders.">
              <EmptyState title="No notifications" text="New worker dashboard alerts will appear here." />
            </SectionCard>
          </div>

          <WorkerJobSummary />

          <SectionCard
            id="verification"
            title="Experience Verification"
            subtitle="Request digital proof of previous work from employers and track approval status."
            action={<Button href="/worker-dashboard/experience" type="button" variant="soft">Open verification</Button>}
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Verified experiences" value={verificationStats.approved} tone="emerald" />
              <StatCard label="Pending requests" value={verificationStats.pending} tone="amber" />
              <StatCard label="Rejected requests" value={verificationStats.rejected} tone="slate" />
            </div>
          </SectionCard>

          <PersonalDetailsSection
            errors={errors}
            profile={profile}
            saving={saving}
            onSave={saveProfile}
            onUpdate={updateProfile}
          />
          <CategorySection profile={profile} onUpdate={updateProfile} />
          <SkillsSection profile={profile} onUpdate={updateProfile} />
          <ExperienceSection profile={profile} onUpdate={updateProfile} />
          <LanguagesSection profile={profile} onUpdate={updateProfile} />
          <FileUploadSection profile={profile} onUpdate={updateProfile} />
          <AvailabilitySection profile={profile} onUpdate={updateProfile} />
          <ProfilePreview completion={completion} profile={profile} />

          <div className="flex flex-col gap-3 rounded-2xl border border-white/70 bg-white/75 p-5 shadow-xl shadow-slate-900/5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Ready to publish?</h2>
              <p className="mt-1 text-sm text-slate-600">Save your latest worker dashboard details to the API.</p>
            </div>
            <Button loading={saving} type="button" onClick={saveProfile}>
              Save worker dashboard
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
