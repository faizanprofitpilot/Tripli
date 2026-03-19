-- Add direct Google Maps place URL for reliable "open in Maps" links
alter table public.trip_hotels add column if not exists google_maps_url text;
alter table public.trip_items add column if not exists google_maps_url text;
