"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { generateTrip } from "@/app/actions/trips";
import { loadWizardDraft, clearWizardDraft } from "@/lib/trip-wizard-storage";
import { TripGeneratingOverlay } from "@/components/planner/TripGeneratingOverlay";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { PRO_PLAN_LABEL } from "@/lib/billing-constants";
/** Prevents duplicate generateTrip in React Strict Mode (dev double mount). */
let wizardCompleteInFlight = false;

export function TripPlanCompleteClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    if (wizardCompleteInFlight) return;
    wizardCompleteInFlight = true;

    async function run() {
      const draft = loadWizardDraft();
      if (!draft?.destination?.trim()) {
        wizardCompleteInFlight = false;
        setBusy(false);
        router.replace("/plan");
        return;
      }

      const fd = new FormData();
      fd.set("destination", draft.destination.trim());
      if (draft.destinationPlaceId) fd.set("destinationPlaceId", draft.destinationPlaceId);
      fd.set("days", String(draft.days));
      fd.set("budget", draft.budget);
      if (draft.budget === "custom") fd.set("customBudget", String(Number(draft.customBudget)));
      fd.set("travelGroup", draft.travelGroup);
      fd.set("interests", JSON.stringify(draft.interests ?? []));
      fd.set("dietary", JSON.stringify(draft.dietary ?? []));
      fd.set("pace", draft.pace);

      try {
        const result = await generateTrip(fd);
        if (result?.tripId) {
          clearWizardDraft();
          router.replace(`/trip/${result.tripId}`);
          return;
        }
        if (result?.requiresSubscription) {
          setNeedsSubscription(true);
          return;
        }
        if (result?.error) setError(result.error);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        wizardCompleteInFlight = false;
        setBusy(false);
      }
    }

    void run();
  }, [router]);

  if (needsSubscription) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">Upgrade to continue</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You&apos;ve used your free trip. Subscribe to Tripli Pro at{" "}
            <span className="font-semibold text-foreground">{PRO_PLAN_LABEL}</span> for unlimited
            generations.
          </p>
        </div>
        <CheckoutButton className="w-full max-w-sm rounded-full font-semibold shadow-primary">
          Continue to Stripe checkout
        </CheckoutButton>
        <Link
          href="/pricing"
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View full pricing
        </Link>
        <Link
          href="/plan"
          className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-background px-6 text-sm font-medium hover:bg-muted"
        >
          Back to plan
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-destructive text-sm font-medium">{error}</p>
        <Link
          href="/plan"
          className="inline-flex h-10 items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-medium text-foreground hover:bg-slate-50"
        >
          Back to plan
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh]">
      {busy && <TripGeneratingOverlay />}
    </div>
  );
}
