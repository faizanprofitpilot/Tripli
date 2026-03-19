"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { deleteTrip } from "@/app/actions/trips";
import type { TripListItem } from "@/app/actions/trips";

interface DashboardTripCardProps {
  trip: TripListItem;
  onDeleted?: () => void;
}

export function DashboardTripCard({ trip, onDeleted }: DashboardTripCardProps) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    const result = await deleteTrip(trip.id);
    if (result?.error) {
      alert(result.error);
      return;
    }
    onDeleted?.();
  };

  return (
    <li className="relative">
      <Link href={`/trip/${trip.id}`} className="block cursor-pointer group">
        <Card className="h-full rounded-[var(--radius-card-lg)] border border-slate-200/60 bg-white overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 ease-out group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] group-hover:-translate-y-1 pt-0">
          {trip.destination_image ? (
            <div className="relative w-full aspect-[2/1] bg-slate-100 overflow-hidden rounded-t-[var(--radius-card-lg)]">
              <Image
                src={trip.destination_image}
                alt=""
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px"
                unoptimized
                loading="eager"
              />
            </div>
          ) : (
            <div className="w-full aspect-[2/1] rounded-t-[var(--radius-card-lg)] bg-gradient-to-br from-primary/15 via-primary/10 to-slate-100" />
          )}
          <CardContent className="p-6 bg-white">
            <h2 className="font-bold text-slate-900 text-xl leading-tight tracking-tight">
              {trip.title ?? `${trip.destination} Trip`}
            </h2>
            <p className="text-sm text-slate-500 mt-2 leading-snug">
              {trip.destination} · {trip.days_count}{" "}
              {trip.days_count === 1 ? "day" : "days"}
              {trip.cost_estimate?.total != null && (
                <> · ~${trip.cost_estimate.total.toLocaleString()}</>
              )}
            </p>
            <p className="text-xs text-slate-400 mt-2.5">
              {new Date(trip.created_at).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        aria-label="Delete trip"
        className="absolute top-3 right-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-600 hover:bg-white shadow-sm border border-slate-200/60 transition-all duration-200 hover:scale-105 cursor-pointer"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
