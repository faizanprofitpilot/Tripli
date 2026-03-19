import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { DashboardTripList } from "@/components/dashboard/DashboardTripList";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const params = await searchParams;
  const showWelcome = params.welcome === "1";

  return (
    <div className="min-h-screen flex flex-col page-bg">
      <Navbar />
      <main className="flex-1 px-4 py-16 sm:px-6 lg:px-8 sm:py-24 bg-gradient-to-b from-transparent via-background/50 to-background">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="section-title">
                Your trips
              </h1>
              <p className="section-subtitle">
                Your saved itineraries in one place
              </p>
            </div>
            <Link
              href="/planner"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-primary hover:shadow-primary-hover transition-all duration-200 hover:-translate-y-0.5 shrink-0"
            >
              New trip
            </Link>
          </div>

          <DashboardTripList showWelcome={showWelcome} />
        </div>
      </main>
    </div>
  );
}
