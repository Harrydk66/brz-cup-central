-- ENUMS
create type public.app_role as enum ('admin','moderator','user');
create type public.tournament_mode as enum ('solo','duo','squad');
create type public.tournament_kind as enum ('daily','cup','league');
create type public.tournament_status as enum ('scheduled','open','last_slots','full','closed','finished','cancelled');
create type public.payment_status as enum ('pending','confirmed','expired','failed','refunded');
create type public.slot_status as enum ('reserved','guaranteed','cancelled');

-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  brz_id text unique not null,
  nick text not null,
  free_fire_id text,
  whatsapp text,
  email text,
  avatar_url text,
  utm_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant select on public.profiles to anon;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles are public readable" on public.profiles for select using (true);
create policy "own profile insert" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update to authenticated using (auth.uid() = id);

-- ROLES
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

-- BRZ ID sequence
create sequence public.brz_id_seq start 1;
create or replace function public.next_brz_id()
returns text language sql volatile security definer set search_path = public as $$
  select 'BRZ#' || lpad(nextval('public.brz_id_seq')::text, 4, '0')
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, brz_id, nick, email, whatsapp, free_fire_id)
  values (
    new.id,
    public.next_brz_id(),
    coalesce(new.raw_user_meta_data->>'nick', split_part(coalesce(new.email,'jogador'),'@',1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'whatsapp', new.phone),
    new.raw_user_meta_data->>'free_fire_id'
  );
  insert into public.player_stats (player_id) values (new.id);
  return new;
end;
$$;

-- TOURNAMENTS
create table public.tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind tournament_kind not null default 'daily',
  mode tournament_mode not null default 'solo',
  tournament_date date not null default (now() at time zone 'America/Sao_Paulo')::date,
  start_time time not null,
  max_players int not null default 48,
  entry_fee numeric(10,2) not null default 5,
  kill_prize numeric(10,2) not null default 2,
  champion_prize numeric(10,2) not null default 40,
  runner_up_reward text default 'Vaga no próximo Daily',
  status tournament_status not null default 'open',
  room_id text,
  room_password text,
  room_released boolean not null default false,
  whatsapp_group_url text,
  created_at timestamptz not null default now()
);
grant select on public.tournaments to anon, authenticated;
grant insert, update, delete on public.tournaments to authenticated;
grant all on public.tournaments to service_role;
alter table public.tournaments enable row level security;
create policy "tournaments public read" on public.tournaments for select using (true);
create policy "admins manage tournaments" on public.tournaments for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- REGISTRATIONS
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  player_id uuid not null references public.profiles(id) on delete cascade,
  nick text not null,
  free_fire_id text not null,
  whatsapp text not null,
  slot_number int,
  slot_status slot_status not null default 'reserved',
  payment_status payment_status not null default 'pending',
  utm_source text,
  created_at timestamptz not null default now(),
  unique (tournament_id, player_id)
);
grant select, insert, update on public.registrations to authenticated;
grant all on public.registrations to service_role;
alter table public.registrations enable row level security;
create policy "own registrations read" on public.registrations for select to authenticated using (player_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own registrations insert" on public.registrations for insert to authenticated with check (player_id = auth.uid());
create policy "admin update registrations" on public.registrations for update to authenticated using (public.has_role(auth.uid(),'admin'));

-- PAYMENTS
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id) on delete cascade,
  amount numeric(10,2) not null,
  status payment_status not null default 'pending',
  provider text default 'pix',
  provider_reference text,
  pix_qr_code text,
  pix_copy_paste text,
  expires_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert on public.payments to authenticated;
grant all on public.payments to service_role;
alter table public.payments enable row level security;
create policy "own payments read" on public.payments for select to authenticated using (
  exists (select 1 from public.registrations r where r.id = registration_id and (r.player_id = auth.uid() or public.has_role(auth.uid(),'admin')))
);
create policy "own payments insert" on public.payments for insert to authenticated with check (
  exists (select 1 from public.registrations r where r.id = registration_id and r.player_id = auth.uid())
);

-- STATS
create table public.player_stats (
  player_id uuid primary key references public.profiles(id) on delete cascade,
  matches int not null default 0,
  kills int not null default 0,
  booyahs int not null default 0,
  top2 int not null default 0,
  mvps int not null default 0,
  earnings numeric(10,2) not null default 0,
  season_matches int not null default 0,
  season_kills int not null default 0,
  season_booyahs int not null default 0,
  season_top2 int not null default 0,
  season_mvps int not null default 0,
  season_earnings numeric(10,2) not null default 0,
  updated_at timestamptz not null default now()
);
grant select on public.player_stats to anon, authenticated;
grant all on public.player_stats to service_role;
alter table public.player_stats enable row level security;
create policy "stats public read" on public.player_stats for select using (true);

-- MATCH RESULTS
create table public.results (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  player_id uuid references public.profiles(id) on delete set null,
  nick text not null,
  position int not null,
  kills int not null default 0,
  prize numeric(10,2) not null default 0,
  is_mvp boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.results to anon, authenticated;
grant insert, update, delete on public.results to authenticated;
grant all on public.results to service_role;
alter table public.results enable row level security;
create policy "results public read" on public.results for select using (true);
create policy "admins manage results" on public.results for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ACHIEVEMENTS
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text not null,
  icon text not null default '🏅',
  created_at timestamptz not null default now()
);
grant select on public.achievements to anon, authenticated;
grant all on public.achievements to service_role;
alter table public.achievements enable row level security;
create policy "achievements public read" on public.achievements for select using (true);

create table public.player_achievements (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (player_id, achievement_id)
);
grant select on public.player_achievements to anon, authenticated;
grant all on public.player_achievements to service_role;
alter table public.player_achievements enable row level security;
create policy "player achievements public read" on public.player_achievements for select using (true);

-- WAITLIST
create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.tournaments(id) on delete cascade,
  player_id uuid references public.profiles(id) on delete cascade,
  nick text not null,
  whatsapp text not null,
  queue_position int not null default 1,
  notified boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, insert on public.waitlist to authenticated;
grant all on public.waitlist to service_role;
alter table public.waitlist enable row level security;
create policy "own waitlist read" on public.waitlist for select to authenticated using (player_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "own waitlist insert" on public.waitlist for insert to authenticated with check (player_id = auth.uid());

-- SETTINGS (prize config etc.)
create table public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
grant select on public.settings to anon, authenticated;
grant insert, update on public.settings to authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
create policy "settings public read" on public.settings for select using (true);
create policy "admins manage settings" on public.settings for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

-- ANALYTICS
create table public.acquisition_events (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'organic',
  event_type text not null,
  player_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
grant insert on public.acquisition_events to anon, authenticated;
grant select on public.acquisition_events to authenticated;
grant all on public.acquisition_events to service_role;
alter table public.acquisition_events enable row level security;
create policy "anyone can track" on public.acquisition_events for insert with check (true);
create policy "admins read acquisition" on public.acquisition_events for select to authenticated using (public.has_role(auth.uid(),'admin'));

-- trigger for new users (created after player_stats exists)
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- SEED
insert into public.settings (key, value) values
  ('ranking_prizes', '{"weekly_mvp":50,"weekly_booyah_king":50,"monthly_mvp":100,"monthly_booyah_king":100}'::jsonb),
  ('whatsapp_group_url', '"https://chat.whatsapp.com/"'::jsonb);

insert into public.achievements (code, name, description, icon) values
  ('first_blood','FIRST BLOOD','Primeira kill na BRZ.','🩸'),
  ('booyah','BOOYAH','Primeira vitória.','👑'),
  ('carrasco','CARRASCO','10 kills em uma partida.','💀'),
  ('on_fire','ON FIRE','5 partidas consecutivas com pelo menos uma kill.','🔥'),
  ('cacador','CAÇADOR','50 kills.','🎯'),
  ('exterminador','EXTERMINADOR','100 kills.','☠️'),
  ('tricampeao','TRICAMPEÃO','3 Booyahs.','🏆'),
  ('mvp','MVP','Maior número de kills em um Daily.','⭐');

insert into public.tournaments (name, start_time, max_players, entry_fee, status) values
  ('BRZ DAILY 20:00','20:00',48,5,'open'),
  ('BRZ DAILY 21:00','21:00',48,5,'open'),
  ('BRZ DAILY 22:00','22:00',48,5,'open');