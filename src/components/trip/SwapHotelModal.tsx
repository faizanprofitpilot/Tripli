"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAlternativeHotels } from "@/app/actions/trips";

interface SwapHotelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  onSelect: (placeId: string) => void;
}

interface HotelOption {
  place_id: string;
  name: string;
  address: string | null;
  rating: number | null;
  photo_url: string | null;
}

export function SwapHotelModal({
  open,
  onOpenChange,
  tripId,
  onSelect,
}: SwapHotelModalProps) {
  const [options, setOptions] = useState<HotelOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !tripId) return;
    setLoading(true);
    getAlternativeHotels(tripId, 5)
      .then(setOptions)
      .finally(() => setLoading(false));
  }, [open, tripId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col gap-4 p-6">
        <DialogHeader>
          <DialogTitle>Swap hotel</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Choose an alternative hotel for your trip.
        </p>
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading options…</div>
        ) : (
          <ul className="space-y-3 mt-2 min-h-0 flex-1 overflow-y-auto max-h-[60vh] pr-1">
            {options.map((opt) => (
              <li key={opt.place_id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(opt.place_id);
                    onOpenChange(false);
                  }}
                  className="w-full text-left rounded-xl border border-slate-200 p-4 hover:bg-slate-50 hover:border-teal-200 transition-colors flex gap-4"
                >
                  <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-200">
                    {opt.photo_url ? (
                      <Image
                        src={opt.photo_url}
                        alt={opt.name}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{opt.name}</h3>
                    {opt.address && (
                      <p className="text-sm text-muted-foreground truncate">{opt.address}</p>
                    )}
                    {opt.rating != null && (
                      <p className="text-sm mt-1">★ {opt.rating}</p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
