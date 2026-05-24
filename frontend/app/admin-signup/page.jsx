"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postAuth, saveAuthSession } from "../../components/auth/api";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import PasswordField from "../../components/auth/PasswordField";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import PasswordStrength from "../../components/ui/PasswordStrength";
import TextField from "../../components/ui/TextField";
import Toast from "../../components/ui/Toast";

export default function AdminSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", setupKey: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!form.name.trim()) nextErrors.name = "Admin name is required.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid email.";
    if (form.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";
    if (!form.setupKey.trim()) nextErrors.setupKey = "Admin setup key is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      setMessage("");
      const data = await postAuth("/auth/admin/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        setupKey: form.setupKey
      });
      saveAuthSession(data);
      setMessage("Admin account created. Redirecting...");
      setTimeout(() => router.push("/dashboard-redirect"), 500);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const hasErrorMessage = message && !message.includes("created");

  return (
    <AuthShell>
      <Toast message={message} type={hasErrorMessage ? "error" : "success"} />
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section className="hidden rounded-2xl border border-white/70 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-900/20 lg:block">
          <p className="text-sm font-black uppercase text-cyan-200">Protected setup</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">Create an admin account.</h1>
          <p className="mt-4 leading-7 text-slate-300">
            Admin signup requires the backend ADMIN_SETUP_KEY, so public worker and employer signup cannot create admins.
          </p>
          <div className="mt-8 rounded-xl bg-white/10 p-4 text-sm font-bold">
            Current local demo key: admin-setup-123
          </div>
        </section>

        <AuthCard eyebrow="Admin signup" title="Register admin" subtitle="Use this only for trusted WorkCred operators.">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                error={errors.name}
                label="Admin name"
                name="name"
                placeholder="Platform admin"
                value={form.name}
                onChange={updateField}
              />
              <TextField
                error={errors.email}
                label="Admin email"
                name="email"
                placeholder="admin@workcred.com"
                type="email"
                value={form.email}
                onChange={updateField}
              />
            </div>

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
            <TextField
              error={errors.setupKey}
              helper="Must match ADMIN_SETUP_KEY from backend .env."
              label="Admin setup key"
              name="setupKey"
              placeholder="Enter setup key"
              value={form.setupKey}
              onChange={updateField}
            />
            {hasErrorMessage && <Alert type="error">{message}</Alert>}
            <Button className="w-full" loading={loading} type="submit">
              Create admin account
            </Button>
            <p className="text-center text-sm text-slate-600">
              Already have admin account?{" "}
              <Link className="font-black text-slate-950 hover:text-cyan-700" href="/admin-login">
                Admin login
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </AuthShell>
  );
}
