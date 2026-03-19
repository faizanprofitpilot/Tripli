import { Navbar } from "@/components/navbar";
import { TripPlanCompleteClient } from "@/components/plan/TripPlanCompleteClient";

export default function PlanCompletePage() {
  return (
    <div className="min-h-screen flex flex-col page-bg">
      <Navbar />
      <main className="flex-1 px-4 py-8">
        <TripPlanCompleteClient />
      </main>
    </div>
  );
}
