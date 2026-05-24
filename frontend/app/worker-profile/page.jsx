"use client";

import { useEffect, useMemo, useState } from "react";
import AppNavbar from "../../components/dashboard/AppNavbar";
import Sidebar from "../../components/dashboard/Sidebar";
import StatCard from "../../components/dashboard/StatCard";
import AvailabilitySection from "../../components/profile/AvailabilitySection";
import CategorySection from "../../components/profile/CategorySection";
import ExperienceSection from "../../components/profile/ExperienceSection";
import FileUploadSection from "../../components/profile/FileUploadSection";
import LanguagesSection from "../../components/profile/LanguagesSection";
import PersonalDetailsSection from "../../components/profile/PersonalDetailsSection";
import ProfilePreview from "../../components/profile/ProfilePreview";
import SectionCard from "../../components/profile/SectionCard";
import SkillsSection from "../../components/profile/SkillsSection";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Skeleton from "../../components/ui/Skeleton";
import Toast from "../../components/ui/Toast";
import useProfileCompletion from "../../hooks/useProfileCompletion";
import { availabilityOptions, initialProfile, workerCategories } from "../../lib/profileData";

export default function WorkerProfilePage() {
  const [profile, setProfile] = useState(initialProfile);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const completion = useProfileCompletion(profile);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timeout);
  }, []);

  const category = useMemo(
    () => workerCategories.find((item) => item.id === profile.category),
    [profile.category]
  );
  const availability = useMemo(
    () => availabilityOptions.find((item) => item.id === profile.availability),
    [profile.availability]
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

  function saveProfile() {
    if (!validate()) {
      setToastType("error");
      setToast("Please fix the highlighted fields.");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setToastType("success");
      setToast("Profile saved locally. Form is ready for API integration.");
      setModalOpen(true);
    }, 700);
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
      <AppNavbar />
      <Toast message={toast} type={toastType} />
      <Modal open={modalOpen} title="Profile payload ready" onClose={() => setModalOpen(false)}>
        <p className="text-sm leading-6 text-slate-600">
          This frontend has collected personal details, skills, experience, languages, files, category, and availability.
          Connect this form to the worker profile API when backend integration is needed.
        </p>
      </Modal>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <Sidebar activeSection={activeSection} onSelect={selectSection} />

        <div className="space-y-5">
          <section
            className="overflow-hidden rounded-2xl border border-white/70 bg-white/75 shadow-2xl shadow-slate-900/10 backdrop-blur-xl"
            id="overview"
          >
            <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_300px]">
              <div>
                <p className="text-sm font-black uppercase text-cyan-700">Worker profile dashboard</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  Welcome back, {profile.fullName.split(" ")[0] || "Worker"}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Manage your WorkCred profile, show verified skills, and help employers understand your fit before
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
                <h2 className="mt-5 text-2xl font-black">{category?.label}</h2>
                <p className="mt-2 text-sm text-slate-300">{availability?.label}</p>
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
              <div className="space-y-3">
                {["Profile photo area is ready", "Skills summary updated", "Resume card prepared"].map((item) => (
                  <div className="rounded-xl border border-slate-200 bg-white/70 p-4 text-sm font-bold text-slate-700" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard title="Notifications" subtitle="Preview of worker profile alerts.">
              <div className="space-y-3">
                {["Complete resume upload for stronger visibility", "Add one more language to improve matching", "Verification badge preview is active"].map((item) => (
                  <div className="rounded-xl bg-cyan-50 p-4 text-sm font-bold text-cyan-900" key={item}>
                    {item}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

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
              <p className="mt-1 text-sm text-slate-600">This action is UI-only and prepared for a future API request.</p>
            </div>
            <Button loading={saving} type="button" onClick={saveProfile}>
              Save worker profile
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
