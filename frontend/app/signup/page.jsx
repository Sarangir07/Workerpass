"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postAuth, saveAuthSession } from "../../components/auth/api";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import PasswordField from "../../components/auth/PasswordField";
import RoleSelect from "../../components/auth/RoleSelect";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import PasswordStrength from "../../components/ui/PasswordStrength";
import TextField from "../../components/ui/TextField";
import Toast from "../../components/ui/Toast";

const initialForm = {
  fullName: "",
  phone: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "worker",
  photo: null
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");

  function updateField(event) {
    const { name, value, files } = event.target;
    setForm((current) => ({ ...current, [name]: files ? files[0] : value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function validate() {
    const nextErrors = {};

    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!/^[0-9]{10,15}$/.test(form.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email address.";
    if (form.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    if (!form.role) nextErrors.role = "Choose your account role.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      setToastType("error");
      setToast("Please fix the highlighted fields.");
      return;
    }

    try {
      setLoading(true);
      setToast("");
      const data = await postAuth("/auth/signup", {
        name: form.fullName,
        email: form.email,
        password: form.password,
        userType: form.role
      });

      saveAuthSession(data);
      setToastType("success");
      setToast(data.message || "Signup successful. Redirecting...");
      setTimeout(() => router.push("/dashboard-redirect"), 600);
    } catch (error) {
      setToastType("error");
      setToast(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Toast message={toast} type={toastType} />
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <aside className="hidden rounded-2xl border border-white/70 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20 lg:block">
          <p className="text-sm font-black uppercase text-cyan-200">WorkCred access</p>
          <h2 className="mt-4 text-4xl font-black tracking-tight">Start with verified identity.</h2>
          <p className="mt-4 leading-7 text-slate-300">
            Workers build portable credibility. Employers get cleaner hiring signals before the first call.
          </p>
          <div className="mt-8 grid gap-3">
            {["Secure role-based access", "OTP-ready onboarding", "Profile photo support"].map((item) => (
              <div className="rounded-xl bg-white/10 p-4 text-sm font-bold" key={item}>
                {item}
              </div>
            ))}
          </div>
        </aside>

        <AuthCard
          eyebrow="Create account"
          title="Join WorkCred"
          subtitle="This frontend form is validation-ready and prepared for the auth API."
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                error={errors.fullName}
                label="Full name"
                name="fullName"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={updateField}
              />
              <TextField
                error={errors.phone}
                label="Phone number"
                name="phone"
                placeholder="9876543210"
                value={form.phone}
                onChange={updateField}
              />
            </div>

            <TextField
              error={errors.email}
              label="Email"
              name="email"
              placeholder="you@company.com"
              type="email"
              value={form.email}
              onChange={updateField}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordField
                error={errors.password}
                label="Password"
                name="password"
                placeholder="Create password"
                value={form.password}
                onChange={updateField}
              />
              <PasswordField
                error={errors.confirmPassword}
                label="Confirm password"
                name="confirmPassword"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={updateField}
              />
            </div>

            <PasswordStrength password={form.password} />
            <RoleSelect
              error={errors.role}
              value={form.role}
              onChange={(role) => {
                setForm((current) => ({ ...current, role }));
                setErrors((current) => ({ ...current, role: "" }));
              }}
            />

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">Upload profile photo</span>
              <input
                accept="image/*"
                className="block w-full rounded-lg border border-dashed border-slate-300 bg-white/75 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:border-cyan-400"
                name="photo"
                type="file"
                onChange={updateField}
              />
            </label>

            <Alert type="info">API payload is ready for POST /api/auth/signup.</Alert>
            <Button className="w-full" loading={loading} type="submit">
              Create account
            </Button>
            <p className="text-center text-sm text-slate-600">
              Already have account?{" "}
              <Link className="font-black text-slate-950 hover:text-cyan-700" href="/login">
                Login
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </AuthShell>
  );
}
