"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { MapPin } from "lucide-react";

const MESSAGES = [
  "Finding the best spots…",
  "Building your itinerary…",
  "Picking hotels & activities…",
  "Almost there…",
];

export function TripGeneratingOverlay() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMessageIndex((i) => (i + 1) % MESSAGES.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  const overlay = (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-8 bg-background/95 backdrop-blur-md"
      aria-live="polite"
      aria-busy="true"
    >
      {/* Animated ring + icon */}
      <div className="relative flex items-center justify-center">
        <div className="h-20 w-20 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        <div
          className="absolute flex items-center justify-center h-20 w-20"
          style={{ animation: "tripli-pulse-soft 1.5s ease-in-out infinite" }}
        >
          <MapPin className="size-8 text-primary" strokeWidth={2} />
        </div>
      </div>

      {/* Bouncing dots */}
      <div className="flex items-center justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full bg-primary"
            style={{
              animation: "tripli-dot-bounce 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>

      {/* Rotating message */}
      <div className="text-center space-y-1 min-h-[2.5rem] flex flex-col justify-center">
        <p className="text-lg font-semibold text-foreground">
          {MESSAGES[messageIndex]}
        </p>
        <p className="text-sm text-muted-foreground">
          This usually takes 15–30 seconds
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full w-1/3 rounded-full bg-primary/70"
          style={{ animation: "tripli-shimmer 1.8s ease-in-out infinite" }}
        />
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(overlay, document.body);
  }
  return overlay;
}
