"use client";

import Script from "next/script";

interface GoogleMapsScriptProps {
  apiKey: string;
}

/** Loads Google Maps JS API once app-wide. Used in root layout to avoid loading it on multiple pages. */
export function GoogleMapsScript({ apiKey }: GoogleMapsScriptProps) {
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
