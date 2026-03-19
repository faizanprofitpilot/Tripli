/**
 * Google Places API (New) photo media resource name:
 * places/{placeId}/photos/{photoReference}
 * Only URL-safe segments; blocks traversal and odd encodings.
 */
const PLACE_PHOTO_NAME_MAX_LEN = 512;

/** Allowed chars per segment (Place IDs + photo refs; base64url-style safe). */
const SEGMENT = "[A-Za-z0-9+/=_-]+";
const PLACE_PHOTO_RESOURCE_RE = new RegExp(
  `^places/${SEGMENT}/photos/${SEGMENT}$`
);

export function isValidPlacePhotoResourceName(name: string): boolean {
  if (!name || name.length > PLACE_PHOTO_NAME_MAX_LEN) return false;
  if (name.includes("..") || name.includes("\\") || name.includes("%")) return false;
  if (!name.startsWith("places/")) return false;
  return PLACE_PHOTO_RESOURCE_RE.test(name);
}
