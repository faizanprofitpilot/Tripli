"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripHeader } from "@/components/trip/TripHeader";
import { HotelCard } from "@/components/trip/HotelCard";
import { DayCard } from "@/components/trip/DayCard";
import { CostBreakdown } from "@/components/trip/CostBreakdown";
import { TripMap } from "@/components/trip/TripMap";
import { SwapHotelModal } from "@/components/trip/SwapHotelModal";
import { SwapActivityModal } from "@/components/trip/SwapActivityModal";
import { DownloadItineraryPdf } from "@/components/trip/DownloadItineraryPdf";
import type { Trip } from "@/types/trip";
import { getAlternativeHotels, getAlternativeActivities, swapHotel, swapActivity, regenerateDay, deleteTrip } from "@/app/actions/trips";

interface TripViewProps {
  trip: Trip;
}

export function TripView({ trip }: TripViewProps) {
  const router = useRouter();
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [swapHotelOpen, setSwapHotelOpen] = useState(false);
  const [swapActivityItemId, setSwapActivityItemId] = useState<string | null>(null);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);

  const refreshTrip = () => router.refresh();

  const handleSwapHotel = () => setSwapHotelOpen(true);
  const handleSwapActivity = (itemId: string) => setSwapActivityItemId(itemId);
  const handleRegenerateDay = async (dayNumber: number) => {
    setRegeneratingDay(dayNumber);
    await regenerateDay(trip.id, dayNumber);
    setRegeneratingDay(null);
    refreshTrip();
  };

  const handleHotelSelected = async (placeId: string) => {
    await swapHotel(trip.id, placeId);
    setSwapHotelOpen(false);
    refreshTrip();
  };

  const handleActivitySelected = async (placeId: string) => {
    if (!swapActivityItemId) return;
    await swapActivity(swapActivityItemId, placeId);
    setSwapActivityItemId(null);
    refreshTrip();
  };

  const cost = trip.cost_estimate;
  const currentTrip = trip;

  const handleDeleteTrip = async () => {
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    const result = await deleteTrip(trip.id);
    if (result?.error) {
      alert(result.error);
      return;
    }
    window.location.href = "/dashboard";
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen page-bg">
      <div className="flex-1 overflow-auto px-4 py-8 sm:px-6 lg:max-w-[55%] lg:py-12">
        <div className="mx-auto max-w-2xl space-y-14">
          <TripHeader
            trip={currentTrip}
            actions={
              <div className="flex flex-wrap gap-2.5 shrink-0">
                <DownloadItineraryPdf trip={trip} className="cursor-pointer rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors duration-200" />
                <Link
                  href="/planner"
                  className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors duration-200"
                >
                  Plan another trip
                </Link>
                <button
                  type="button"
                  onClick={handleDeleteTrip}
                  aria-label="Delete trip"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 bg-white text-destructive hover:bg-red-50 cursor-pointer transition-colors duration-200"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            }
          />

          {currentTrip.hotel && (
            <HotelCard
              hotel={currentTrip.hotel}
              onSwap={handleSwapHotel}
              costEstimate={cost?.hotel_total ?? null}
            />
          )}

          <section className="space-y-6">
            <h2 className="section-title">Itinerary</h2>
            {currentTrip.days?.map((day) => (
              <DayCard
                key={day.id}
                day={day}
                selectedItemId={selectedItemId}
                onRegenerateDay={() => handleRegenerateDay(day.day_number)}
                onSwapActivity={handleSwapActivity}
                onFocusActivity={setSelectedItemId}
                isRegenerating={regeneratingDay === day.day_number}
              />
            ))}
          </section>

          {cost && <CostBreakdown cost={cost} />}
        </div>
      </div>

      <aside className="sticky top-0 w-full lg:w-[45%] lg:min-h-screen lg:max-h-screen p-4 lg:p-6">
        <div className="h-[400px] lg:h-full rounded-[var(--radius-card-lg)] overflow-hidden shadow-[0_6px_24px_rgba(0,0,0,0.04)] border border-slate-200/60 bg-white">
          <TripMap
            trip={currentTrip}
            selectedDayNumber={selectedDayNumber}
            selectedItemId={selectedItemId}
          />
        </div>
      </aside>

      <SwapHotelModal
        open={swapHotelOpen}
        onOpenChange={setSwapHotelOpen}
        tripId={trip.id}
        onSelect={handleHotelSelected}
      />
      <SwapActivityModal
        open={!!swapActivityItemId}
        onOpenChange={(open) => !open && setSwapActivityItemId(null)}
        tripId={trip.id}
        tripItemId={swapActivityItemId}
        destination={trip.destination}
        category={(() => {
          for (const day of trip.days ?? []) {
            const item = day.items?.find((i) => i.id === swapActivityItemId);
            if (item?.category) return item.category;
          }
          return "activity";
        })()}
        onSelect={handleActivitySelected}
      />
    </div>
  );
}
