import { NextRequest, NextResponse } from "next/server";
import { isValidPlacePhotoResourceName } from "@/lib/place-photo";

/**
 * Proxies Google Place photo requests so the API key is never sent to the client.
 * Usage: /api/place-photo?name=places/PLACE_ID/photos/PHOTO_REFERENCE
 */
export async function GET(request: NextRequest) {
  const name = request.nextUrl.searchParams.get("name");
  if (!name || !isValidPlacePhotoResourceName(name)) {
    return NextResponse.json({ error: "Missing or invalid name" }, { status: 400 });
  }
  const key = process.env.GOOGLE_PLACES_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
  const maxWidth = Math.min(Number(request.nextUrl.searchParams.get("maxWidthPx")) || 800, 2400);
  const url = `https://places.googleapis.com/v1/${name}/media?key=${key}&maxWidthPx=${maxWidth}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      return new NextResponse(null, { status: res.status });
    }
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=86400" },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
