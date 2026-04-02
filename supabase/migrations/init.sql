-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (mirrors NextAuth session data)
create table if not exists users (
  id text primary key default uuid_generate_v4()::text,
  email text unique not null,
  name text,
  image text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Pets table
create table if not exists pets (
  id uuid primary key default uuid_generate_v4(),
  user_id text references users(id) on delete cascade,
  name text not null,
  stage text not null default 'egg' check (stage in ('egg','baby','teen','adult','ultimate')),
  evolution_type text check (evolution_type in ('warrior','sage','dark','balance')),
  hunger integer not null default 100,
  happiness integer not null default 100,
  energy integer not null default 100,
  strength integer not null default 10,
  wisdom integer not null default 10,
  dark integer not null default 10,
  harmony integer not null default 10,
  age_days integer not null default 0,
  partner_id uuid references pets(id) on delete set null,
  is_alive boolean not null default true,
  born_at timestamptz default now(),
  stage_entered_at timestamptz default now(),
  last_fed_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Relationships table
create table if not exists relationships (
  id uuid primary key default uuid_generate_v4(),
  pet_a_id uuid references pets(id) on delete cascade,
  pet_b_id uuid references pets(id) on delete cascade,
  type text not null check (type in ('love','friend','rival','enemy')),
  intensity integer not null default 0 check (intensity between 0 and 100),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(pet_a_id, pet_b_id)
);

-- Tombstones table
create table if not exists tombstones (
  id uuid primary key default uuid_generate_v4(),
  pet_id uuid not null,
  user_id text references users(id) on delete cascade,
  name text not null,
  stage text not null,
  evolution_type text,
  age_days integer not null default 0,
  epitaph text,
  died_at timestamptz default now(),
  created_at timestamptz default now()
);

-- Row Level Security
alter table users enable row level security;
alter table pets enable row level security;
alter table relationships enable row level security;
alter table tombstones enable row level security;

-- Users policies
create policy "Users can read own data" on users
  for select using (auth.uid()::text = id);

create policy "Service role can manage users" on users
  for all using (true);

-- Pets policies
create policy "Users can read own pets" on pets
  for select using (auth.uid()::text = user_id);

create policy "Users can read friends pets" on pets
  for select using (
    exists (
      select 1 from relationships r
      join pets p on p.id = r.pet_a_id or p.id = r.pet_b_id
      where p.user_id = auth.uid()::text
      and (r.pet_a_id = pets.id or r.pet_b_id = pets.id)
    )
  );

create policy "Users can manage own pets" on pets
  for all using (auth.uid()::text = user_id);

-- Relationships policies
create policy "Users can read relationships involving their pets" on relationships
  for select using (
    exists (select 1 from pets where id = pet_a_id and user_id = auth.uid()::text)
    or
    exists (select 1 from pets where id = pet_b_id and user_id = auth.uid()::text)
  );

create policy "Users can manage relationships involving their pets" on relationships
  for all using (
    exists (select 1 from pets where id = pet_a_id and user_id = auth.uid()::text)
    or
    exists (select 1 from pets where id = pet_b_id and user_id = auth.uid()::text)
  );

-- Tombstones policies
create policy "Users can read own tombstones" on tombstones
  for select using (auth.uid()::text = user_id);

create policy "Users can manage own tombstones" on tombstones
  for all using (auth.uid()::text = user_id);

-- Updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger users_updated_at before update on users
  for each row execute function update_updated_at();

create trigger pets_updated_at before update on pets
  for each row execute function update_updated_at();

create trigger relationships_updated_at before update on relationships
  for each row execute function update_updated_at();
