import Image from "next/image";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getGoogleMapsPlaceUrl } from "@/lib/google-maps-url";
import type { TripItem } from "@/types/trip";
import { cn } from "@/lib/utils";

interface ActivityCardProps {
  item: TripItem;
  onSwap: () => void;
  onCardClick?: () => void;
  isSelected?: boolean;
}

const SLOT_LABELS: Record<string, string> = {
  morning: "Morning",
  lunch: "Lunch",
  afternoon: "Afternoon",
  dinner: "Dinner",
  evening: "Evening",
};

export function ActivityCard({ item, onSwap, onCardClick, isSelected }: ActivityCardProps) {
  const slotLabel = SLOT_LABELS[item.slot] ?? item.slot;
  const mapsUrl =
    item.google_maps_url ??
    getGoogleMapsPlaceUrl({
      place_id: item.place_id,
      lat: item.lat,
      lng: item.lng,
      name: item.name,
      address: item.address,
    });

  return (
    <Card
      className={cn(
        "rounded-[var(--radius-card)] border border-slate-200/60 bg-white overflow-hidden transition-all duration-200 shadow-[0_6px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)]",
        isSelected
          ? "border-primary ring-2 ring-primary/30 shadow-[0_8px_28px_rgba(0,0,0,0.06)]"
          : "",
        onCardClick && "cursor-pointer"
      )}
      onClick={onCardClick}
      role={onCardClick ? "button" : undefined}
      tabIndex={onCardClick ? 0 : undefined}
      onKeyDown={onCardClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onCardClick(); } } : undefined}
    >
      <div className="flex gap-4 p-4">
        <div className="w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 shadow-sm ring-1 ring-slate-200/50">
          {item.photo_url ? (
            <Image
              src={item.photo_url}
              alt={item.name}
              width={96}
              height={96}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              No image
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            {slotLabel} · {item.category ?? "Activity"}
          </p>
          <h3 className="font-bold text-slate-900 mt-0.5 tracking-tight text-[15px]">{item.name}</h3>
          {(item.description ?? item.rationale) && (
            <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-snug">
              {item.description ?? item.rationale}
            </p>
          )}
          <div className="mt-3 pt-3 flex flex-wrap items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <div className="flex items-center gap-3 text-sm text-slate-500">
              {item.rating != null && (
                <span className="font-semibold text-slate-700">★ {item.rating}</span>
              )}
              {item.duration_minutes != null && (
                <span>~{item.duration_minutes} min</span>
              )}
              {item.rating == null && item.duration_minutes == null && <span>&nbsp;</span>}
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200"
                >
                  <Image src="/mapsicon.png" alt="" width={14} height={14} className="shrink-0" />
                  Maps
                </a>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onSwap}
                className="h-8 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors duration-200 text-xs"
              >
                <RefreshCw className="size-3.5 mr-1" />
                Swap
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
