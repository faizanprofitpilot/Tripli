import type { ResolvedPlace } from "@/types/trip";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function getKey() {
  if (!API_KEY) throw new Error("Missing Google Places API key: GOOGLE_PLACES_API_KEY or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");
  return API_KEY;
}

// Google Places API (New) - Text Search
// https://developers.google.com/maps/documentation/places/web-service/text-search
export async function searchPlaces(query: string, type?: string): Promise<{ place_id: string; name: string; formatted_address?: string; rating?: number; geometry?: { location: { lat: number; lng: number } }; photos?: { name: string }[] }[]> {
  const key = getKey();
  const url = new URL("https://places.googleapis.com/v1/places:searchText");
  const body: { textQuery: string; maxResultCount?: number } = { textQuery: query, maxResultCount: 5 };
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.location,places.photos",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Places search failed: ${res.status}`);
  }
  const data = (await res.json()) as { places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    rating?: number;
    location?: { latitude: number; longitude: number };
    photos?: { name: string }[];
  }> };
  const places = data.places ?? [];
  return places.map((p) => ({
    place_id: p.id ?? "",
    name: p.displayName?.text ?? "",
    formatted_address: p.formattedAddress,
    rating: p.rating,
    geometry: p.location ? { location: { lat: p.location.latitude, lng: p.location.longitude } } : undefined,
    photos: p.photos,
  } as { place_id: string; name: string; formatted_address?: string; rating?: number; geometry?: { location: { lat: number; lng: number } }; photos?: { name: string }[] }));
}

// Place Details - fetch by place id (Places API New uses "places/PLACE_ID" format)
export async function getPlaceDetails(placeId: string): Promise<ResolvedPlace | null> {
  const key = getKey();
  // Places API (New) - Place Details: places/PLACE_ID
  const id = placeId.startsWith("places/") ? placeId : `places/${placeId}`;
  const url = `https://places.googleapis.com/v1/${id}?fields=id,displayName,formattedAddress,rating,location,photos,googleMapsLinks`;
  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "id,displayName,formattedAddress,rating,location,photos,googleMapsLinks",
    },
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Place details failed: ${res.status}`);
  }
  const p = (await res.json()) as {
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    rating?: number;
    location?: { latitude: number; longitude: number };
    photos?: { name: string }[];
    googleMapsLinks?: { placeUri?: string };
  };
  const lat = p.location?.latitude ?? 0;
  const lng = p.location?.longitude ?? 0;
  let photo_url: string | null = null;
  if (p.photos?.[0]?.name) {
    // Use app proxy so the API key is never sent to the client
    photo_url = `/api/place-photo?name=${encodeURIComponent(p.photos[0].name)}`;
  }
  return {
    place_id: (p.id ?? placeId).replace("places/", ""),
    name: p.displayName?.text ?? "",
    address: p.formattedAddress ?? null,
    rating: p.rating ?? null,
    lat,
    lng,
    photo_url,
    google_maps_uri: p.googleMapsLinks?.placeUri ?? null,
  };
}

// Resolve a place by text query (search then take first result and get details)
export async function resolvePlace(query: string): Promise<ResolvedPlace | null> {
  const results = await searchPlaces(query, undefined);
  const first = results[0];
  if (!first?.place_id) return null;
  return getPlaceDetails(first.place_id);
}

// Search for alternatives (e.g. hotels in destination, or activities by type)
export async function findAlternatives(query: string, limit = 5): Promise<ResolvedPlace[]> {
  const results = await searchPlaces(query);
  const out: ResolvedPlace[] = [];
  for (let i = 0; i < Math.min(limit, results.length); i++) {
    const r = results[i];
    if (!r.place_id) continue;
    const details = await getPlaceDetails(r.place_id);
    if (details) out.push(details);
  }
  return out;
}
