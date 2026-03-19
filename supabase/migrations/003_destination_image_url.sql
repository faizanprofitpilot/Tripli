-- Optional: store city/destination photo URL for dashboard cards and trip hero.
-- Run this migration if you want destination images; getTrips/getTrip work without it.
alter table public.trips add column if not exists destination_image_url text;
