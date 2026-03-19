"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Refreshes the dashboard when it mounts so the trip list is always up-to-date
 * after navigating back from a trip (avoids stale Router Cache).
 */
export function DashboardRefresher() {
  const router = useRouter();
  useEffect(() => {
    router.refresh();
  }, [router]);
  return null;
}
