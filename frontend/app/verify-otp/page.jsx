"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import OtpInput from "../../components/auth/OtpInput";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(59);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (timer <= 0) return;
    const timeout = setTimeout(() => setTimer((current) => current - 1), 1000);
    return () => clearTimeout(timeout);
  }, [timer]);

  function handleVerify(event) {
    event.preventDefault();

    if (otp.length !== 6) {
      setError("Enter the 6 digit OTP.");
      return;
    }

    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      setMessage("OTP verified. You can continue to reset password or dashboard.");
    }, 700);
  }

  function resendOtp() {
    setTimer(59);
    setMessage("New OTP sent successfully.");
    setError("");
  }

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-md px-4 py-8 sm:px-6">
        <AuthCard
          eyebrow="OTP verification"
          title="Enter the code"
          subtitle="Use the 6 digit code sent to your registered contact."
        >
          <form className="space-y-5" onSubmit={handleVerify}>
            <OtpInput value={otp} onChange={setOtp} />
            {error && <Alert type="error">{error}</Alert>}
            <Alert type="success">{message}</Alert>
            <div className="flex items-center justify-between text-sm font-bold text-slate-600">
              <span>00:{String(timer).padStart(2, "0")}</span>
              <button
                className="text-cyan-800 disabled:text-slate-400"
                disabled={timer > 0}
                type="button"
                onClick={resendOtp}
              >
                Resend OTP
              </button>
            </div>
            <Button className="w-full" loading={loading} type="submit">
              Verify
            </Button>
            <div className="flex justify-between text-sm font-bold">
              <Link className="text-slate-600 hover:text-slate-950" href="/forgot-password">
                Change contact
              </Link>
              <Link className="text-cyan-800 hover:text-cyan-950" href="/reset-password">
                Reset password
              </Link>
            </div>
          </form>
        </AuthCard>
      </div>
    </AuthShell>
  );
}
