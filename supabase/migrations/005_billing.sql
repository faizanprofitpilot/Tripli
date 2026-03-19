-- Billing: trip generation limits + Stripe subscription mirror
-- Profiles track lifetime trip generations (not decremented on delete).

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  lifetime_trips_generated int not null default 0,
  updated_at timestamptz default now()
);

-- Stripe subscription state (written by webhook / checkout using service role)
create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'none',
  price_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz default now()
);

create index if not exists idx_user_subscriptions_stripe_customer
  on public.user_subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

alter table public.profiles enable row level security;
alter table public.user_subscriptions enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can read own subscription"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

-- New auth users get a profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Increment lifetime trip count when a trip is created (survives trip delete)
create or replace function public.bump_lifetime_trip_generations()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.user_id is null then
    return new;
  end if;
  insert into public.profiles (id, lifetime_trips_generated)
  values (new.user_id, 1)
  on conflict (id) do update
  set lifetime_trips_generated = public.profiles.lifetime_trips_generated + 1,
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists trips_after_insert_bump_generations on public.trips;
create trigger trips_after_insert_bump_generations
  after insert on public.trips
  for each row execute function public.bump_lifetime_trip_generations();

-- Backfill profiles for existing auth users
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- Backfill lifetime counts from existing trips
insert into public.profiles (id, lifetime_trips_generated)
select user_id, count(*)::int
from public.trips
where user_id is not null
group by user_id
on conflict (id) do update
set lifetime_trips_generated = greatest(
  public.profiles.lifetime_trips_generated,
  excluded.lifetime_trips_generated
),
updated_at = now();
