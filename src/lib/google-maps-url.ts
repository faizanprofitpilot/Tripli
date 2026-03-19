/**
 * Builds a Google Maps URL that opens the place listing (search or place).
 * Prefers place_id, then lat/lng, then name+address query.
 */
export function getGoogleMapsPlaceUrl(params: {
  place_id?: string | null;
  lat?: number | null;
  lng?: number | null;
  name?: string;
  address?: string | null;
}): string | null {
  const { place_id, lat, lng, name, address } = params;
  if (place_id) {
    const rawId = place_id.replace(/^places\//i, "");
    return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(rawId)}`;
  }
  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  const query = [name, address].filter(Boolean).join(" ");
  if (query.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query.trim())}`;
  }
  return null;
}
