"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_TOKEN_KEY, getStoredAdminUser } from "./adminApi";

export default function useAdminAuth() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = window.localStorage.getItem(ADMIN_TOKEN_KEY);
    const storedAdmin = getStoredAdminUser();

    // Route protection lives on the client because this app stores JWTs in localStorage.
    if (!token || !storedAdmin) {
      router.replace("/admin-login");
      return;
    }

    setAdmin(storedAdmin);
    setChecking(false);
  }, [router]);

  return { admin, checking };
}
