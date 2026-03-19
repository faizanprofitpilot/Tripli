"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RefreshCw, MapPin } from "lucide-react";
import { ActivityCard } from "@/components/trip/ActivityCard";
import type { TripDay } from "@/types/trip";

interface DayCardProps {
  day: TripDay;
  selectedItemId: string | null;
  onRegenerateDay: () => void;
  onSwapActivity: (itemId: string) => void;
  onFocusActivity?: (itemId: string | null) => void;
  isRegenerating?: boolean;
}

function buildGoogleMapsDirUrl(day: TripDay): string | null {
  const items = day.items ?? [];
  const waypoints = items
    .filter((i) => i.lat != null && i.lng != null)
    .map((i) => `${i.lat},${i.lng}`);
  if (waypoints.length === 0) return null;
  return `https://www.google.com/maps/dir/${waypoints.join("/")}`;
}

export function DayCard({
  day,
  selectedItemId,
  onRegenerateDay,
  onSwapActivity,
  onFocusActivity,
  isRegenerating,
}: DayCardProps) {
  const sortedItems = [...(day.items ?? [])].sort((a, b) => {
    const order = ["morning", "lunch", "afternoon", "dinner", "evening"];
    return order.indexOf(a.slot) - order.indexOf(b.slot);
  });
  const mapsUrl = buildGoogleMapsDirUrl(day);

  return (
    <Card className="rounded-[var(--radius-card-lg)] border border-slate-200/40 bg-transparent shadow-none overflow-visible">
      <CardHeader className="pb-4 pt-5 px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Day {day.day_number}</h2>
            {day.theme && (
              <p className="text-sm text-slate-500 mt-1">{day.theme}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerateDay}
              disabled={isRegenerating}
              className="rounded-full border border-slate-300 bg-white font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors duration-200"
            >
              <RefreshCw className={`size-4 mr-1.5 ${isRegenerating ? "animate-spin" : ""}`} />
              {isRegenerating ? "Regenerating…" : "Regenerate Day"}
            </Button>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-8 items-center justify-center rounded-full border border-slate-300 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors duration-200 cursor-pointer"
              >
                <MapPin className="size-4 mr-1.5" />
                Directions
              </a>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 px-6 pb-6 pt-0">
        {sortedItems.map((item) => (
          <ActivityCard
            key={item.id}
            item={item}
            onSwap={() => onSwapActivity(item.id)}
            onCardClick={onFocusActivity ? () => onFocusActivity(selectedItemId === item.id ? null : item.id) : undefined}
            isSelected={selectedItemId === item.id}
          />
        ))}
      </CardContent>
    </Card>
  );
}
