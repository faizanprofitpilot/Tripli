import { Navbar } from "@/components/navbar";
import { PlannerForm } from "@/components/planner/PlannerForm";

export default async function PlannerPage({
  searchParams,
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  const params = await searchParams;
  return (
    <div className="relative min-h-screen flex flex-col page-bg overflow-hidden">
      {/* Subtle radial gradient — brand green, very low opacity, minimal */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          background: "radial-gradient(ellipse 75% 50% at 50% -10%, var(--primary) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <Navbar />
      <main className="relative flex-1 px-4 pt-10 pb-16 sm:px-6 lg:px-8 sm:pt-14 sm:pb-24">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 text-center">
            <h1 className="section-title sm:text-3xl">
              Plan your trip
            </h1>
            <p className="section-subtitle mt-2">
              Enter your destination and preferences. We&apos;ll generate a full itinerary in seconds.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)]">
            <PlannerForm className="mt-0" defaultDestination={params.destination} />
          </div>
        </div>
      </main>
    </div>
  );
}
