"use server";

import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";
import { preferencesSchema, type Preferences } from "@/types/trip";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { assertCanGenerateTrip } from "@/lib/billing";
import { generateItinerary, regenerateDayItinerary } from "@/lib/openai";
import { searchPlaces, resolvePlace, getPlaceDetails, findAlternatives } from "@/lib/places";
import type { Trip, TripHotel, TripDay, TripItem } from "@/types/trip";
import {
  getClientIpKey,
  rateLimitAllow,
  SUGGESTIONS_LIMIT,
  SUGGESTIONS_WINDOW_MS,
  GENERATE_TRIP_LIMIT,
  GENERATE_TRIP_WINDOW_MS,
} from "@/lib/rate-limit";

function buildPrompt(prefs: Preferences): string {
  const interestsStr = prefs.interests.length ? prefs.interests.join(", ") : "general sightseeing";
  const dietaryStr = prefs.dietary?.length ? ` Dietary: ${prefs.dietary.join(", ")}.` : "";
  const dest = prefs.destination.trim();
  return `Create a complete ${prefs.days}-day trip itinerary.

CRITICAL: The destination is "${dest}". You MUST plan the entire trip in ${dest} only. trip_title and destination_summary must be about ${dest}. The recommended_hotel and every activity and restaurant must be real places located in ${dest}. Do not suggest or use any other city.

Budget: ${prefs.budget === "custom" && prefs.customBudget != null ? `Custom $${prefs.customBudget} USD` : prefs.budget}. Travel group: ${prefs.travelGroup}. Pace: ${prefs.pace}.
Interests: ${interestsStr}.${dietaryStr}

Return a single JSON object with:
- trip_title: string (must reference ${dest} only)
- destination_summary: 2-3 sentences about ${dest}
- recommended_hotel: { name, neighborhood, price_range, rationale } — must be a hotel in ${dest}
- days: array of { day: number, theme: optional string, activities: array }
  Each activity: { name: string, type: "activity" or "restaurant", slot: "morning"|"lunch"|"afternoon"|"dinner"|"evening", duration_minutes: number, rationale: optional string }. All venues must be in ${dest}.
  Each day must have: morning, lunch, afternoon, dinner, and optionally evening.
- cost_estimate: { hotel_total, food_total, activities_total, transportation_total, total } (numbers in USD)

Use real, well-known places and venues in ${dest} only.`;
}

function parseFormJsonField(
  formData: FormData,
  key: string
): { ok: true; value: unknown } | { ok: false; error: string } {
  const raw = formData.get(key);
  const s = typeof raw === "string" ? raw.trim() : "";
  if (!s) return { ok: true, value: [] };
  try {
    return { ok: true, value: JSON.parse(s) };
  } catch {
    return {
      ok: false,
      error: `Invalid "${key}" format. Please refresh the page and try again.`,
    };
  }
}

function highResPhotoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (!url.startsWith("/api/place-photo") || url.includes("maxWidthPx")) return url;
  return url + (url.includes("?") ? "&" : "?") + "maxWidthPx=2400";
}

/** Returns city/place suggestions for the destination input. Used so the form keeps a single source of truth (the input) and we never depend on a third-party widget. */
export async function getDestinationSuggestions(query: string): Promise<{ name: string; place_id: string }[]> {
  const q = query?.trim();
  if (!q || q.length < 2) return [];

  const ip = await getClientIpKey();
  if (!rateLimitAllow(`suggest:${ip}`, SUGGESTIONS_LIMIT, SUGGESTIONS_WINDOW_MS)) {
    return [];
  }

  try {
    const places = await searchPlaces(q, undefined);
    return places.slice(0, 5).map((p) => ({
      name: p.formatted_address ?? p.name,
      place_id: p.place_id?.replace("places/", "") ?? "",
    })).filter((p) => p.place_id);
  } catch {
    return [];
  }
}

export type GenerateTripResult =
  | { tripId: string; error?: undefined; requiresSubscription?: undefined }
  | { error: string; requiresSubscription?: boolean; tripId?: undefined };

export async function generateTrip(formData: FormData): Promise<GenerateTripResult> {
  const interestsField = parseFormJsonField(formData, "interests");
  if (!interestsField.ok) return { error: interestsField.error };
  const dietaryField = parseFormJsonField(formData, "dietary");
  if (!dietaryField.ok) return { error: dietaryField.error };

  const raw = {
    destination: formData.get("destination") as string,
    destinationPlaceId: formData.get("destinationPlaceId") || null,
    days: Number(formData.get("days")),
    budget: formData.get("budget") as string,
    customBudget: formData.get("customBudget") ? Number(formData.get("customBudget")) : undefined,
    travelGroup: formData.get("travelGroup") as string,
    interests: interestsField.value,
    dietary: dietaryField.value,
    pace: formData.get("pace") as string,
  };
  const parsed = preferencesSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((e) => e.message).join("; ");
    return { error: msg || "Invalid preferences." };
  }
  const prefs = parsed.data;
  if (prefs.budget === "custom" && (prefs.customBudget == null || prefs.customBudget <= 0)) {
    return { error: "Please enter a valid custom budget amount (USD)." };
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirect=/planner");
  }

  if (!rateLimitAllow(`generate:${user.id}`, GENERATE_TRIP_LIMIT, GENERATE_TRIP_WINDOW_MS)) {
    return {
      error: "Too many trip generations right now. Please try again in about an hour.",
    };
  }

  const gate = await assertCanGenerateTrip(user.id);
  if (!gate.ok) {
    return { error: gate.message, requiresSubscription: true };
  }

  try {
    const itinerary = await generateItinerary(buildPrompt(prefs));

    const { data: tripRow, error: tripErr } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        destination: prefs.destination,
        destination_place_id: prefs.destinationPlaceId,
        days_count: prefs.days,
        budget: prefs.budget === "custom" ? "medium" : prefs.budget,
        travel_group: prefs.travelGroup,
        interests: prefs.interests,
        dietary: prefs.dietary ?? [],
        pace: prefs.pace,
        title: itinerary.trip_title,
        summary: itinerary.destination_summary,
        cost_estimate: itinerary.cost_estimate,
      })
      .select("id")
      .single();

    if (tripErr || !tripRow) {
      console.error(tripErr);
      return { error: "Failed to save trip." };
    }
    const tripId = tripRow.id;

    if (prefs.destinationPlaceId) {
      try {
        const destinationPlace = await getPlaceDetails(prefs.destinationPlaceId);
        if (destinationPlace?.photo_url) {
          const highResUrl = destinationPlace.photo_url + (destinationPlace.photo_url.includes("?") ? "&" : "?") + "maxWidthPx=2400";
          await supabase.from("trips").update({ destination_image_url: highResUrl }).eq("id", tripId);
        }
      } catch {
        /* non-fatal */
      }
    }

    const hotelQuery = `${itinerary.recommended_hotel.name} ${itinerary.recommended_hotel.neighborhood} ${prefs.destination}`;
    const hotelPlace = await resolvePlace(hotelQuery);
    await supabase.from("trip_hotels").insert({
      trip_id: tripId,
      place_id: hotelPlace?.place_id ?? null,
      name: itinerary.recommended_hotel.name,
      address: hotelPlace?.address ?? null,
      rating: hotelPlace?.rating ?? null,
      price_range: itinerary.recommended_hotel.price_range,
      lat: hotelPlace?.lat ?? null,
      lng: hotelPlace?.lng ?? null,
      photo_url: highResPhotoUrl(hotelPlace?.photo_url) ?? null,
      rationale: itinerary.recommended_hotel.rationale ?? null,
      google_maps_url: hotelPlace?.google_maps_uri ?? null,
    });

    for (const d of itinerary.days) {
      const { data: dayRow, error: dayErr } = await supabase
        .from("trip_days")
        .insert({ trip_id: tripId, day_number: d.day, theme: d.theme ?? null })
        .select("id")
        .single();
      if (dayErr || !dayRow) continue;
      const dayId = dayRow.id;

      for (const a of d.activities) {
        const query = `${a.name} ${prefs.destination}`;
        const place = await resolvePlace(query);
        await supabase.from("trip_items").insert({
          trip_day_id: dayId,
          slot: a.slot,
          place_id: place?.place_id ?? null,
          name: a.name,
          category: a.type,
          address: place?.address ?? null,
          lat: place?.lat ?? null,
          lng: place?.lng ?? null,
          rating: place?.rating ?? null,
          photo_url: highResPhotoUrl(place?.photo_url) ?? null,
          duration_minutes: a.duration_minutes,
          description: a.rationale ?? null,
          rationale: a.rationale ?? null,
          google_maps_url: place?.google_maps_uri ?? null,
        });
      }
    }

    return { tripId };
  } catch (e) {
    console.error(e);
    return { error: e instanceof Error ? e.message : "Failed to generate trip." };
  }
}

export async function deleteTrip(tripId: string): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };
  const { error } = await supabase.from("trips").delete().eq("id", tripId).eq("user_id", user.id);
  if (error) return { error: error.message };
  return {};
}

export type TripListItem = Pick<Trip, "id" | "destination" | "days_count" | "title" | "created_at" | "cost_estimate"> & {
  destination_image: string | null;
};

export async function getTrips(): Promise<TripListItem[]> {
  unstable_noStore();
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: trips, error } = await supabase
    .from("trips")
    .select("id, destination, days_count, title, created_at, cost_estimate, destination_image_url")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[getTrips]", error);
    return [];
  }
  if (!trips?.length) return [];

  const ids = trips.map((t) => t.id);
  const { data: hotels } = await supabase
    .from("trip_hotels")
    .select("trip_id, photo_url")
    .in("trip_id", ids);

  const photoByTripId = new Map<string, string | null>();
  for (const h of hotels ?? []) {
    if (h.trip_id && h.photo_url) photoByTripId.set(h.trip_id, h.photo_url);
  }

  type Row = (typeof trips)[number] & { destination_image_url?: string | null };
  return trips.map((t) => {
    const row = t as Row;
    let destination_image: string | null = row.destination_image_url ?? photoByTripId.get(row.id) ?? null;
    if (destination_image?.startsWith("/api/place-photo") && !destination_image.includes("maxWidthPx")) {
      destination_image += (destination_image.includes("?") ? "&" : "?") + "maxWidthPx=2400";
    }
    return {
      id: row.id,
      destination: row.destination,
      days_count: row.days_count,
      title: row.title,
      created_at: row.created_at,
      cost_estimate: row.cost_estimate as Trip["cost_estimate"],
      destination_image,
    };
  }) as TripListItem[];
}

export async function getTrip(id: string): Promise<Trip | null> {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: trip, error: tripErr } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();
  if (tripErr || !trip) return null;
  if (trip.user_id !== user.id) return null;

  const { data: hotel } = await supabase
    .from("trip_hotels")
    .select("*")
    .eq("trip_id", id)
    .single();

  const { data: daysRows } = await supabase
    .from("trip_days")
    .select("*")
    .eq("trip_id", id)
    .order("day_number");

  const days: TripDay[] = [];
  for (const row of daysRows ?? []) {
    const { data: items } = await supabase
      .from("trip_items")
      .select("*")
      .eq("trip_day_id", row.id)
      .order("slot");
    days.push({
      ...row,
      items: (items ?? []) as TripItem[],
    });
  }

  return {
    ...trip,
    hotel: hotel as TripHotel | null,
    days,
  } as Trip;
}

export async function getAlternativeHotels(tripId: string, limit = 5): Promise<{ place_id: string; name: string; address: string | null; rating: number | null; photo_url: string | null }[]> {
  const supabase = await createServerSupabaseClient();
  const { data: trip } = await supabase.from("trips").select("destination, budget").eq("id", tripId).single();
  if (!trip) return [];
  const query = `hotel ${trip.destination} ${trip.budget}`;
  const places = await findAlternatives(query, limit);
  return places.map((p) => ({
    place_id: p.place_id,
    name: p.name,
    address: p.address,
    rating: p.rating,
    photo_url: p.photo_url,
  }));
}

export async function swapHotel(tripId: string, newPlaceId: string): Promise<{ error?: string }> {
  const details = await getPlaceDetails(newPlaceId);
  if (!details) return { error: "Place not found." };
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("trip_hotels")
    .update({
      place_id: details.place_id,
      name: details.name,
      address: details.address,
      rating: details.rating,
      lat: details.lat,
      lng: details.lng,
      photo_url: details.photo_url,
      google_maps_url: details.google_maps_uri ?? null,
    })
    .eq("trip_id", tripId);
  return {};
}

export async function getAlternativeActivities(
  tripId: string,
  category: string,
  destination: string,
  limit = 5
): Promise<{ place_id: string; name: string; address: string | null; rating: number | null; photo_url: string | null }[]> {
  const query = `${category} ${destination}`;
  const places = await findAlternatives(query, limit);
  return places.map((p) => ({
    place_id: p.place_id,
    name: p.name,
    address: p.address,
    rating: p.rating,
    photo_url: p.photo_url,
  }));
}

export async function swapActivity(tripItemId: string, newPlaceId: string): Promise<{ error?: string }> {
  const details = await getPlaceDetails(newPlaceId);
  if (!details) return { error: "Place not found." };
  const supabase = await createServerSupabaseClient();
  await supabase
    .from("trip_items")
    .update({
      place_id: details.place_id,
      name: details.name,
      address: details.address,
      rating: details.rating,
      lat: details.lat,
      lng: details.lng,
      photo_url: details.photo_url,
      google_maps_url: details.google_maps_uri ?? null,
    })
    .eq("id", tripItemId);
  return {};
}

export async function regenerateDay(tripId: string, dayNumber: number): Promise<{ error?: string }> {
  const supabase = await createServerSupabaseClient();
  const { data: trip } = await supabase.from("trips").select("*").eq("id", tripId).single();
  if (!trip) return { error: "Trip not found." };

  const prompt = `Regenerate only day ${dayNumber} for a trip to ${trip.destination}.
Budget: ${trip.budget}. Travel group: ${trip.travel_group}. Pace: ${trip.pace}.
Interests: ${(trip.interests as string[])?.join(", ") ?? "sightseeing"}.
Return JSON: { day: ${dayNumber}, theme: optional string, activities: array of { name, type: "activity"|"restaurant", slot: "morning"|"lunch"|"afternoon"|"dinner"|"evening", duration_minutes, rationale } }.
Include morning, lunch, afternoon, dinner, and optional evening. Use real places.`;

  const newDay = await regenerateDayItinerary(prompt);

  const { data: dayRow } = await supabase
    .from("trip_days")
    .select("id")
    .eq("trip_id", tripId)
    .eq("day_number", dayNumber)
    .single();
  if (!dayRow) return { error: "Day not found." };

  await supabase.from("trip_items").delete().eq("trip_day_id", dayRow.id);

  for (const a of newDay.activities) {
    const query = `${a.name} ${trip.destination}`;
    const place = await resolvePlace(query);
    await supabase.from("trip_items").insert({
      trip_day_id: dayRow.id,
      slot: a.slot,
      place_id: place?.place_id ?? null,
      name: a.name,
      category: a.type,
      address: place?.address ?? null,
      lat: place?.lat ?? null,
      lng: place?.lng ?? null,
      rating: place?.rating ?? null,
      photo_url: highResPhotoUrl(place?.photo_url) ?? null,
      duration_minutes: a.duration_minutes,
      description: a.rationale ?? null,
      rationale: a.rationale ?? null,
      google_maps_url: place?.google_maps_uri ?? null,
    });
  }
  return {};
}
