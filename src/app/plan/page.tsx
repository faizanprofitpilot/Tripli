import { Suspense } from "react";
import { TripPlanWizard } from "@/components/plan/TripPlanWizard";

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white text-slate-500">
          Loading…
        </div>
      }
    >
      <TripPlanWizard />
    </Suspense>
  );
}
