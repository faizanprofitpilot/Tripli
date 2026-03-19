-- Tripli MVP schema
-- Run in Supabase SQL editor or via supabase db push

-- Optional: users table if you add auth later
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz default now()
);

-- Trips (guest-friendly: user_id nullable)
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  destination text not null,
  destination_place_id text,
  days_count int not null,
  budget text not null,
  travel_group text not null,
  interests jsonb default '[]',
  dietary jsonb default '[]',
  pace text not null,
  title text,
  summary text,
  cost_estimate jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_trips_user_id on public.trips(user_id);

-- Hotel for the trip (one per trip)
create table if not exists public.trip_hotels (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  place_id text,
  name text not null,
  address text,
  rating numeric(3,2),
  price_range text,
  lat numeric,
  lng numeric,
  photo_url text,
  rationale text,
  unique(trip_id)
);

create index if not exists idx_trip_hotels_trip_id on public.trip_hotels(trip_id);

-- Days
create table if not exists public.trip_days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  day_number int not null,
  theme text
);

create index if not exists idx_trip_days_trip_id on public.trip_days(trip_id);

-- Items (activities, meals) per day
create table if not exists public.trip_items (
  id uuid primary key default gen_random_uuid(),
  trip_day_id uuid not null references public.trip_days(id) on delete cascade,
  slot text not null,
  place_id text,
  name text not null,
  category text,
  address text,
  lat numeric,
  lng numeric,
  rating numeric(3,2),
  photo_url text,
  duration_minutes int,
  description text,
  rationale text
);

create index if not exists idx_trip_items_trip_day_id on public.trip_items(trip_day_id);

-- Allow anon access for MVP (no auth). Restrict with RLS later.
alter table public.trips enable row level security;
alter table public.trip_hotels enable row level security;
alter table public.trip_days enable row level security;
alter table public.trip_items enable row level security;

create policy "Allow all on trips" on public.trips for all using (true) with check (true);
create policy "Allow all on trip_hotels" on public.trip_hotels for all using (true) with check (true);
create policy "Allow all on trip_days" on public.trip_days for all using (true) with check (true);
create policy "Allow all on trip_items" on public.trip_items for all using (true) with check (true);
