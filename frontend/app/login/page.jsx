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
import TextField from "../../components/ui/TextField";
import Toast from "../../components/ui/Toast";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ identifier: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("success");

  function updateField(event) {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (!form.identifier.trim()) nextErrors.identifier = "Email or phone is required.";
    if (!form.password) nextErrors.password = "Password is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setToastType("error");
      setToast("Login form needs a little attention.");
      return;
    }

    try {
      setLoading(true);
      setToast("");
      const data = await postAuth("/auth/login", {
        email: form.identifier,
        password: form.password
      });

      saveAuthSession(data);
      setToastType("success");
      setToast(data.message || "Login successful. Redirecting...");
      setTimeout(() => router.push("/dashboard-redirect"), 500);
    } catch (error) {
      setToastType("error");
      setToast(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Toast message={toast} type={toastType} />
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
        <div className="hidden self-center lg:block">
          <p className="text-sm font-black uppercase text-cyan-700">Secure sign in</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950">Return to trusted work.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
            Clean role-based authentication UI for worker profiles, employer hiring, and admin oversight.
          </p>
        </div>

        <AuthCard
          eyebrow="Login"
          title="Welcome back"
          subtitle="Use email or phone to continue into WorkCred."
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <TextField
              error={errors.identifier}
              label="Email or phone"
              name="identifier"
              placeholder="you@company.com or 9876543210"
              value={form.identifier}
              onChange={updateField}
            />
            <PasswordField
              error={errors.password}
              label="Password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={updateField}
            />

            <div className="flex items-center justify-between gap-3 text-sm">
              <label className="flex items-center gap-2 font-semibold text-slate-600">
                <input
                  checked={form.remember}
                  className="h-4 w-4 rounded border-slate-300 text-slate-950"
                  name="remember"
                  type="checkbox"
                  onChange={updateField}
                />
                Remember me
              </label>
              <Link className="font-black text-slate-950 hover:text-cyan-700" href="/forgot-password">
                Forgot password?
              </Link>
            </div>

            <Button className="w-full" loading={loading} type="submit">
              Login
            </Button>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="min-h-12 rounded-lg border border-slate-200 bg-white/80 px-4 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                type="button"
              >
                Continue with Google
              </button>
              <button
                className="min-h-12 rounded-lg border border-slate-200 bg-white/80 px-4 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                type="button"
              >
                SSO Access
              </button>
            </div>

            <Alert type="info">API payload is ready for POST /api/auth/login.</Alert>
            <p className="text-center text-sm text-slate-600">
              New to WorkCred?{" "}
              <Link className="font-black text-slate-950 hover:text-cyan-700" href="/signup">
                Create account
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </AuthShell>
  );
}
