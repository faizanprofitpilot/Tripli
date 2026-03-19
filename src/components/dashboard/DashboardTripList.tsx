"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getTrips, type TripListItem } from "@/app/actions/trips";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardTripCard } from "@/components/dashboard/DashboardTripCard";

interface DashboardTripListProps {
  showWelcome?: boolean;
}

export function DashboardTripList({ showWelcome }: DashboardTripListProps) {
  const [trips, setTrips] = useState<TripListItem[] | null>(null);

  const fetchTrips = useCallback(async () => {
    const list = await getTrips();
    setTrips(list);
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    const onFocus = () => fetchTrips();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [fetchTrips]);

  if (trips === null) {
    return (
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="h-56 rounded-[var(--radius-card-lg)] border border-border bg-card shadow-card animate-pulse overflow-hidden"
          >
            <div className="aspect-[2/1] bg-muted/40" />
            <CardContent className="p-5 space-y-3">
              <div className="h-5 bg-muted/50 rounded-md w-3/4" />
              <div className="h-4 bg-muted/30 rounded-md w-1/2" />
              <div className="h-3 bg-muted/30 rounded-md w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <>
      {showWelcome && (
        <p className="mb-8 rounded-[var(--radius-card)] bg-primary/8 text-primary border border-primary/20 px-6 py-4 text-sm font-medium">
          Welcome! Your account is ready. Create your first trip below.
        </p>
      )}
      {trips.length === 0 ? (
        <Card className="mt-12 rounded-[var(--radius-card-lg)] border border-border bg-card shadow-card overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-28 px-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12 text-primary mb-6 ring-2 ring-primary/10">
              <MapPin className="size-8" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              No trips yet
            </h2>
            <p className="mt-3 text-muted-foreground text-sm max-w-sm leading-relaxed">
              Plan your first itinerary in seconds. Pick a destination and we&apos;ll build your days.
            </p>
            <Link
              href="/planner"
              className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-primary px-10 text-sm font-semibold text-primary-foreground shadow-primary btn-primary-premium"
            >
              Plan your first trip
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {trips.map((trip) => (
            <DashboardTripCard
              key={trip.id}
              trip={trip}
              onDeleted={fetchTrips}
            />
          ))}
        </ul>
      )}
    </>
  );
}
