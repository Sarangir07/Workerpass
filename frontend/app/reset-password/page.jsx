"use client";

import Link from "next/link";
import { useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import PasswordField from "../../components/auth/PasswordField";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import PasswordStrength from "../../components/ui/PasswordStrength";

export default function ResetPasswordPage() {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};

    if (form.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess("Password reset UI completed. Ready for POST /api/auth/reset-password.");
    }, 700);
  }

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-md px-4 py-8 sm:px-6">
        <AuthCard
          eyebrow="New credentials"
          title="Reset password"
          subtitle="Choose a stronger password for your WorkCred account."
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <PasswordField
              error={errors.password}
              label="New password"
              name="password"
              placeholder="Create a new password"
              value={form.password}
              onChange={updateField}
            />
            <PasswordStrength password={form.password} />
            <PasswordField
              error={errors.confirmPassword}
              label="Confirm password"
              name="confirmPassword"
              placeholder="Repeat new password"
              value={form.confirmPassword}
              onChange={updateField}
            />
            <Alert type="success">{success}</Alert>
            <Button className="w-full" loading={loading} type="submit">
              Reset password
            </Button>
            <p className="text-center text-sm font-bold">
              <Link className="text-slate-600 hover:text-slate-950" href="/login">
                Return to login
              </Link>
            </p>
          </form>
        </AuthCard>
      </div>
    </AuthShell>
  );
}
