"use client";

import { useEffect, useMemo, useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import Button from "../../components/ui/Button";
import Skeleton from "../../components/ui/Skeleton";

const redirects = {
  worker: "/worker-dashboard",
  employer: "/employer-dashboard",
  admin: "/admin-dashboard"
};

export default function DashboardRedirectPage() {
  const [role, setRole] = useState("worker");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedUser = window.localStorage.getItem("workcred_user");
    const savedRole = savedUser
      ? JSON.parse(savedUser).userType
      : window.localStorage.getItem("workcred_demo_role") || "worker";
    setRole(savedRole);
    const timeout = setTimeout(() => setReady(true), 1300);
    return () => clearTimeout(timeout);
  }, []);

  const dashboard = useMemo(() => redirects[role] || redirects.worker, [role]);

  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-md px-4 py-8 sm:px-6">
        <AuthCard
          eyebrow="Redirecting"
          title={`${capitalize(role)} dashboard`}
          subtitle="WorkCred is preparing the correct dashboard based on the authenticated role."
        >
          <div className="space-y-5">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Button className="w-full" disabled={!ready} href={ready ? dashboard : undefined}>
              {ready ? `Continue to ${capitalize(role)} Dashboard` : "Checking permissions..."}
            </Button>
          </div>
        </AuthCard>
      </div>
    </AuthShell>
  );
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
