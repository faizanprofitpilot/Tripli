"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PortalButtonProps = {
  children?: React.ReactNode;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
};

/** Opens Stripe Customer Portal (payment method, cancel, invoices). */
export function PortalButton({
  children,
  className,
  variant = "outline",
  size = "default",
}: PortalButtonProps) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function openPortal() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setErr(data.error || "Could not open billing portal.");
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={loading}
        className={cn(className)}
        onClick={() => void openPortal()}
      >
        {loading ? "Opening…" : (children ?? "Manage billing")}
      </Button>
      {err && <p className="text-xs text-destructive">{err}</p>}
    </div>
  );
}
