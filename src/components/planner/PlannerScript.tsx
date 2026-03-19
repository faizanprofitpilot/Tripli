"use client";

import Script from "next/script";

interface PlannerScriptProps {
  apiKey: string;
}

export function PlannerScript({ apiKey }: PlannerScriptProps) {
  if (!apiKey) return null;
  return (
    <Script
      src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`}
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("google-maps-script-loaded"));
        }
      }}
    />
  );
}
