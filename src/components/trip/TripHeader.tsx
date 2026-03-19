import type { Trip } from "@/types/trip";

interface TripHeaderProps {
  trip: Trip;
  actions?: React.ReactNode;
}

export function TripHeader({ trip, actions }: TripHeaderProps) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h1 className="section-title sm:text-3xl">
            {trip.destination} Trip
          </h1>
          <p className="section-subtitle mt-1.5 sm:text-base">
            {trip.destination} · {trip.days_count} {trip.days_count === 1 ? "day" : "days"}
            {trip.cost_estimate?.total != null && (
              <> · ~${trip.cost_estimate.total.toLocaleString()}</>
            )}
          </p>
        </div>
        {actions}
      </div>
      {trip.summary && (
        <p className="text-slate-500 max-w-2xl leading-relaxed text-sm">{trip.summary}</p>
      )}
    </header>
  );
}
