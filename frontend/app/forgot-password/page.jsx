"use client";

import Link from "next/link";
import { useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import TextField from "../../components/ui/TextField";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    if (!identifier.trim()) {
      setError("Email or phone is required.");
      return;
    }

    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      setSuccess("OTP sent. Continue to verification when ready.");
    }, 700);
  }

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-md px-4 py-8 sm:px-6">
        <AuthCard
          eyebrow="Account recovery"
          title="Forgot password"
          subtitle="Enter your email or phone and WorkCred will send an OTP."
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <TextField
              error={error}
              label="Email or phone"
              name="identifier"
              placeholder="you@company.com or 9876543210"
              value={identifier}
              onChange={(event) => {
                setIdentifier(event.target.value);
                setError("");
              }}
            />
            <Alert type="success">{success}</Alert>
            <Button className="w-full" loading={loading} type="submit">
              Send OTP
            </Button>
            <div className="flex justify-between text-sm font-bold">
              <Link className="text-slate-600 hover:text-slate-950" href="/login">
                Back to login
              </Link>
              <Link className="text-cyan-800 hover:text-cyan-950" href="/verify-otp">
                Verify OTP
              </Link>
            </div>
          </form>
        </AuthCard>
      </div>
    </AuthShell>
  );
}
