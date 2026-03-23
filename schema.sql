-- =============================================================
-- DisciplineMode - Supabase Schema
-- =============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- -------------------------------------------------------
-- TABLE: members
-- -------------------------------------------------------
create table if not exists public.members (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  height_cm        numeric(5,1) not null check (height_cm > 50 and height_cm < 300),
  initial_weight_kg numeric(5,2) not null check (initial_weight_kg > 0),
  goal_weight_kg   numeric(5,2) not null check (goal_weight_kg > 0),
  created_at       timestamptz default now()
);

-- -------------------------------------------------------
-- TABLE: weigh_ins
-- -------------------------------------------------------
create table if not exists public.weigh_ins (
  id             uuid primary key default uuid_generate_v4(),
  member_id      uuid not null references public.members(id) on delete cascade,
  weight_kg      numeric(5,2) not null check (weight_kg > 0),
  weigh_in_date  date not null,
  week_number    integer not null default 0,
  notes          text,
  created_at     timestamptz default now()
);

-- Index for fast lookups by member
create index if not exists idx_weigh_ins_member_id on public.weigh_ins(member_id);
create index if not exists idx_weigh_ins_date on public.weigh_ins(weigh_in_date);

-- -------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- -------------------------------------------------------

-- Enable RLS on both tables
alter table public.members enable row level security;
alter table public.weigh_ins enable row level security;

-- POLICY: authenticated users can read all members
create policy "Authenticated users can read members"
  on public.members for select
  to authenticated
  using (true);

-- POLICY: authenticated users can insert members
create policy "Authenticated users can insert members"
  on public.members for insert
  to authenticated
  with check (true);

-- POLICY: authenticated users can update members
create policy "Authenticated users can update members"
  on public.members for update
  to authenticated
  using (true);

-- POLICY: authenticated users can read all weigh_ins
create policy "Authenticated users can read weigh_ins"
  on public.weigh_ins for select
  to authenticated
  using (true);

-- POLICY: authenticated users can insert weigh_ins
create policy "Authenticated users can insert weigh_ins"
  on public.weigh_ins for insert
  to authenticated
  with check (true);

-- POLICY: authenticated users can update weigh_ins
create policy "Authenticated users can update weigh_ins"
  on public.weigh_ins for update
  to authenticated
  using (true);
