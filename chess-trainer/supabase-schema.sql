-- ChessMaster Supabase Schema
-- Run this in the Supabase SQL editor after creating your project.

-- User progress table
create table if not exists public.user_progress (
  user_id uuid references auth.users(id) on delete cascade primary key,
  xp integer default 0,
  level integer default 1,
  streak integer default 0,
  last_active_date date,
  completed_lessons text[] default '{}',
  completed_puzzles text[] default '{}',
  unlocked_units text[] default '{basics}',
  hearts integer default 5,
  gems integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Profiles table (for leaderboard display names)
create table if not exists public.profiles (
  user_id uuid references auth.users(id) on delete cascade primary key,
  username text not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- Puzzle results table (analytics)
create table if not exists public.puzzle_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  puzzle_id text not null,
  solved boolean default false,
  moves_used integer default 0,
  hints_used integer default 0,
  xp_earned integer default 0,
  time_seconds integer default 0,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.user_progress enable row level security;
alter table public.profiles enable row level security;
alter table public.puzzle_results enable row level security;

-- RLS Policies: users can only read/write their own data
create policy "Users can view own progress" on public.user_progress
  for select using (auth.uid() = user_id);

create policy "Users can upsert own progress" on public.user_progress
  for all using (auth.uid() = user_id);

create policy "Users can view all profiles" on public.profiles
  for select using (true);

create policy "Users can manage own profile" on public.profiles
  for all using (auth.uid() = user_id);

create policy "Users can insert own results" on public.puzzle_results
  for insert with check (auth.uid() = user_id);

create policy "Users can view own results" on public.puzzle_results
  for select using (auth.uid() = user_id);

-- Leaderboard view (public XP rankings)
create or replace view public.leaderboard as
  select
    up.user_id,
    p.username,
    p.avatar_url,
    up.xp,
    up.streak,
    up.level,
    rank() over (order by up.xp desc) as rank
  from public.user_progress up
  left join public.profiles p on p.user_id = up.user_id
  order by up.xp desc
  limit 100;

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_user_progress_updated_at
  before update on public.user_progress
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));

  insert into public.user_progress (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
