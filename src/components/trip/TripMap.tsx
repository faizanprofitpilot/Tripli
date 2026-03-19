"use client";

import { useRef, useEffect, useCallback } from "react";
import type { Trip } from "@/types/trip";

interface TripMapProps {
  trip: Trip;
  selectedDayNumber: number | null;
  selectedItemId: string | null;
  onLoad?: () => void;
}

export function TripMap({
  trip,
  selectedDayNumber,
  selectedItemId,
  onLoad,
}: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const getCenter = useCallback(() => {
    const points: { lat: number; lng: number }[] = [];
    if (trip.hotel?.lat != null && trip.hotel?.lng != null) {
      points.push({ lat: trip.hotel.lat, lng: trip.hotel.lng });
    }
    for (const day of trip.days ?? []) {
      for (const item of day.items ?? []) {
        if (item.lat != null && item.lng != null) {
          points.push({ lat: item.lat, lng: item.lng });
        }
      }
    }
    if (points.length === 0) return { lat: 40.7, lng: -74 };
    const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
    const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
    return { lat, lng };
  }, [trip]);

  useEffect(() => {
    function init() {
      if (!mapRef.current) return;
      const g = typeof window !== "undefined" ? window.google : undefined;
      if (!g?.maps?.Map) return;
      const center = getCenter();
      const map = new g.maps.Map(mapRef.current, {
        zoom: 12,
        center,
        mapTypeId: "hybrid",
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      });
      mapInstanceRef.current = map;

      const bounds = new g.maps.LatLngBounds();
      const markers: google.maps.Marker[] = [];

      if (trip.hotel?.lat != null && trip.hotel?.lng != null) {
        const m = new g.maps.Marker({
          position: { lat: trip.hotel.lat, lng: trip.hotel.lng },
          map,
          title: trip.hotel.name,
        });
        markers.push(m);
        bounds.extend({ lat: trip.hotel.lat, lng: trip.hotel.lng });
      }

      for (const day of trip.days ?? []) {
        for (const item of day.items ?? []) {
          if (item.lat != null && item.lng != null) {
            const m = new g.maps.Marker({
              position: { lat: item.lat, lng: item.lng },
              map,
              title: item.name,
            });
            (m as unknown as { __itemId?: string }).__itemId = item.id;
            (m as unknown as { __dayNumber?: number }).__dayNumber = day.day_number;
            markers.push(m);
            bounds.extend({ lat: item.lat, lng: item.lng });
          }
        }
      }
      markersRef.current = markers;
      if (markers.length > 1) map.fitBounds(bounds, 40);
      onLoad?.();
    }

    if (typeof window !== "undefined" && window.google?.maps?.Map) {
      init();
      return;
    }
    const handler = () => init();
    window.addEventListener("google-maps-script-loaded", handler);
    const t = setInterval(() => {
      if (window.google?.maps?.Map && mapRef.current) {
        clearInterval(t);
        init();
      }
    }, 100);
    return () => {
      window.removeEventListener("google-maps-script-loaded", handler);
      clearInterval(t);
    };
  }, [trip.id, getCenter, onLoad, trip.hotel, trip.days]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedItemId) return;
    const m = markersRef.current.find(
      (x) => (x as unknown as { __itemId?: string }).__itemId === selectedItemId
    );
    if (m?.getPosition()) {
      map.panTo(m.getPosition()!);
      map.setZoom(15);
    }
  }, [selectedItemId]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full min-h-[400px] lg:min-h-[100vh] rounded-2xl border border-slate-200 bg-slate-100"
      aria-label="Trip map"
    />
  );
}
