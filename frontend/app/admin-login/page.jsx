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

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
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

    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid admin email.";
    if (!form.password) nextErrors.password = "Password is required.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setLoading(true);
      setMessage("");
      const data = await postAuth("/auth/admin/login", form);
      saveAuthSession(data);
      setMessage("Admin login successful. Redirecting...");
      setTimeout(() => router.push("/dashboard-redirect"), 500);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  const hasErrorMessage = message && !message.includes("successful");

  return (
    <AuthShell>
      <Toast message={message} type={hasErrorMessage ? "error" : "success"} />
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_440px] lg:px-8">
        <section className="hidden self-center lg:block">
          <p className="text-sm font-black uppercase text-cyan-700">Admin console</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-slate-950">Control WorkCred securely.</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700">
            Dedicated admin authentication for user governance, verification review, and platform oversight.
          </p>
        </section>

        <AuthCard eyebrow="Admin login" title="Admin access" subtitle="Only admin accounts can use this portal.">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <TextField
              error={errors.email}
              label="Admin email"
              name="email"
              placeholder="admin@workcred.com"
              type="email"
              value={form.email}
              onChange={updateField}
            />
            <PasswordField
              error={errors.password}
              label="Password"
              name="password"
              placeholder="Enter admin password"
              value={form.password}
              onChange={updateField}
            />
            {hasErrorMessage && <Alert type="error">{message}</Alert>}
            <Button className="w-full" loading={loading} type="submit">
              Login as admin
            </Button>
            <div className="flex justify-between text-sm font-bold">
              <Link className="text-slate-600 hover:text-slate-950" href="/login">
                User login
              </Link>
              <Link className="text-cyan-800 hover:text-cyan-950" href="/admin-signup">
                Create admin
              </Link>
            </div>
          </form>
        </AuthCard>
      </div>
    </AuthShell>
  );
}
