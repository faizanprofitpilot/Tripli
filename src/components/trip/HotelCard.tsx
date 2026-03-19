import Image from "next/image";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getGoogleMapsPlaceUrl } from "@/lib/google-maps-url";
import type { TripHotel } from "@/types/trip";

interface HotelCardProps {
  hotel: TripHotel;
  onSwap: () => void;
  costEstimate?: number | null;
}

export function HotelCard({ hotel, onSwap, costEstimate }: HotelCardProps) {
  const mapsUrl =
    hotel.google_maps_url ??
    getGoogleMapsPlaceUrl({
      place_id: hotel.place_id,
      lat: hotel.lat,
      lng: hotel.lng,
      name: hotel.name,
      address: hotel.address,
    });

  return (
    <Card className="overflow-hidden rounded-[var(--radius-card-lg)] border border-slate-200/60 bg-white shadow-[0_6px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.06)] transition-shadow duration-200 pt-0">
      <div className="aspect-[2/1] relative bg-slate-100 ring-1 ring-slate-200/30">
        {hotel.photo_url ? (
          <Image
            src={hotel.photo_url}
            alt={hotel.name}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            No image
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <div>
          <h2 className="font-bold text-lg text-slate-900 tracking-tight">{hotel.name}</h2>
          {hotel.address && (
            <p className="text-sm text-slate-500 mt-1">{hotel.address}</p>
          )}
          {hotel.rationale && (
            <p className="text-sm text-slate-500 mt-3 leading-relaxed">{hotel.rationale}</p>
          )}
        </div>
        <div className="mt-4 pt-4 flex flex-wrap items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            {hotel.rating != null && (
              <span className="font-semibold text-slate-700">★ {hotel.rating}</span>
            )}
            {hotel.price_range && (
              <span>{hotel.price_range}</span>
            )}
            {costEstimate != null && costEstimate > 0 && (
              <span>~${costEstimate.toLocaleString()} total</span>
            )}
            {hotel.rating == null && !hotel.price_range && (costEstimate == null || costEstimate <= 0) && <span>&nbsp;</span>}
          </div>
          <div className="flex items-center gap-2">
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors duration-200"
              >
                <Image src="/mapsicon.png" alt="" width={16} height={16} className="shrink-0" />
                Maps
              </a>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onSwap}
              className="h-9 rounded-lg border border-slate-300 bg-white font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-colors duration-200"
            >
              <RefreshCw className="size-4 mr-1.5" />
              Swap Hotel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
