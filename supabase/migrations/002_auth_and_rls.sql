-- Auth and RLS: link trips to auth.users, enforce ownership

-- Drop old FK and public.users; clear any stale user_id so FK to auth.users is valid
do $$
begin
  if exists (
    select 1 from information_schema.table_constraints
    where table_schema = 'public' and table_name = 'trips' and constraint_name = 'trips_user_id_fkey'
  ) then
    alter table public.trips drop constraint trips_user_id_fkey;
  end if;
end $$;

-- Clear user_id that pointed to public.users (auth will use auth.users from now on)
update public.trips set user_id = null where user_id is not null;

drop table if exists public.users cascade;

-- Link trips.user_id to auth.users
alter table public.trips
  add constraint trips_user_id_fkey
  foreign key (user_id) references auth.users(id) on delete cascade;

-- Drop permissive policies
drop policy if exists "Allow all on trips" on public.trips;
drop policy if exists "Allow all on trip_hotels" on public.trip_hotels;
drop policy if exists "Allow all on trip_days" on public.trip_days;
drop policy if exists "Allow all on trip_items" on public.trip_items;

-- Trips: users can only access their own
create policy "Users can view own trips"
  on public.trips for select
  using (auth.uid() = user_id);

create policy "Users can insert own trips"
  on public.trips for insert
  with check (auth.uid() = user_id);

create policy "Users can update own trips"
  on public.trips for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own trips"
  on public.trips for delete
  using (auth.uid() = user_id);

-- Child tables: access only through owned trip
create policy "Users can view trip_hotels for own trips"
  on public.trip_hotels for select
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_hotels.trip_id and t.user_id = auth.uid()
    )
  );

create policy "Users can insert trip_hotels for own trips"
  on public.trip_hotels for insert
  with check (
    exists (
      select 1 from public.trips t
      where t.id = trip_hotels.trip_id and t.user_id = auth.uid()
    )
  );

create policy "Users can update trip_hotels for own trips"
  on public.trip_hotels for update
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_hotels.trip_id and t.user_id = auth.uid()
    )
  );

create policy "Users can delete trip_hotels for own trips"
  on public.trip_hotels for delete
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_hotels.trip_id and t.user_id = auth.uid()
    )
  );

create policy "Users can view trip_days for own trips"
  on public.trip_days for select
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_days.trip_id and t.user_id = auth.uid()
    )
  );

create policy "Users can insert trip_days for own trips"
  on public.trip_days for insert
  with check (
    exists (
      select 1 from public.trips t
      where t.id = trip_days.trip_id and t.user_id = auth.uid()
    )
  );

create policy "Users can update trip_days for own trips"
  on public.trip_days for update
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_days.trip_id and t.user_id = auth.uid()
    )
  );

create policy "Users can delete trip_days for own trips"
  on public.trip_days for delete
  using (
    exists (
      select 1 from public.trips t
      where t.id = trip_days.trip_id and t.user_id = auth.uid()
    )
  );

create policy "Users can view trip_items for own trips"
  on public.trip_items for select
  using (
    exists (
      select 1 from public.trip_days d
      join public.trips t on t.id = d.trip_id
      where d.id = trip_items.trip_day_id and t.user_id = auth.uid()
    )
  );

create policy "Users can insert trip_items for own trips"
  on public.trip_items for insert
  with check (
    exists (
      select 1 from public.trip_days d
      join public.trips t on t.id = d.trip_id
      where d.id = trip_items.trip_day_id and t.user_id = auth.uid()
    )
  );

create policy "Users can update trip_items for own trips"
  on public.trip_items for update
  using (
    exists (
      select 1 from public.trip_days d
      join public.trips t on t.id = d.trip_id
      where d.id = trip_items.trip_day_id and t.user_id = auth.uid()
    )
  );

create policy "Users can delete trip_items for own trips"
  on public.trip_items for delete
  using (
    exists (
      select 1 from public.trip_days d
      join public.trips t on t.id = d.trip_id
      where d.id = trip_items.trip_day_id and t.user_id = auth.uid()
    )
  );
