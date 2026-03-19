import Link from "next/link";
import { Navbar } from "@/components/navbar";

export default function TripNotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Trip not found</h1>
          <p className="mt-2 text-muted-foreground">
            This trip may have been removed or the link is invalid.
          </p>
          <Link
            href="/planner"
            className="mt-6 inline-flex h-9 items-center justify-center rounded-xl bg-teal-600 px-6 text-sm font-medium text-white hover:bg-teal-700"
          >
            Plan a new trip
          </Link>
        </div>
      </main>
    </div>
  );
}
