"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useAuthHydrated } from "@/lib/use-hydrated";
import { DashboardShell } from "@/components/brag/dashboard-shell";

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthHydrated();

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return <div className="flex h-screen w-full items-center justify-center bg-background" />;
  }

  return <DashboardShell />;
}
