"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CheckoutButtonProps = {
  children?: React.ReactNode;
  className?: string;
  size?: React.ComponentProps<typeof Button>["size"];
  variant?: React.ComponentProps<typeof Button>["variant"];
};

export function CheckoutButton({
  children,
  className,
  size = "lg",
  variant = "default",
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function startCheckout() {
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setErr(data.error || "Could not start checkout.");
    } catch {
      setErr("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2">
      <Button
        type="button"
        size={size}
        variant={variant}
        disabled={loading}
        className={cn(className)}
        onClick={() => void startCheckout()}
      >
        {loading ? "Redirecting to Stripe…" : (children ?? "Subscribe with Stripe")}
      </Button>
      {err && <p className="text-center text-xs text-destructive">{err}</p>}
    </div>
  );
}
