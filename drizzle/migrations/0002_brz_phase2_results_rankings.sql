-- Idempotência do processamento de resultados
alter table public.tournaments
  add column if not exists results_applied boolean not null default false;

-- Uma conquista por jogador
create unique index if not exists player_achievements_unique
  on public.player_achievements (player_id, achievement_id);

-- Ranking por período real (semana/mês/temporada), derivado dos resultados
create or replace function public.ranking_period(_from date)
returns table(
  player_id uuid,
  brz_id text,
  nick text,
  kills integer,
  booyahs integer,
  matches integer,
  mvps integer,
  earnings numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select r.player_id,
         p.brz_id,
         p.nick,
         coalesce(sum(r.kills), 0)::int,
         count(*) filter (where r.position = 1)::int,
         count(*)::int,
         count(*) filter (where r.is_mvp)::int,
         coalesce(sum(r.prize), 0)
  from public.results r
  join public.tournaments t on t.id = r.tournament_id
  join public.profiles p on p.id = r.player_id
  where r.player_id is not null
    and (_from is null or t.tournament_date >= _from)
  group by r.player_id, p.brz_id, p.nick
$$;

grant execute on function public.ranking_period(date) to anon, authenticated, service_role;

-- Aplica os resultados de um Daily: stats, premiação e conquistas
create or replace function public.apply_tournament_results(_tournament_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  _applied boolean;
  _rows integer := 0;
  _unlocked integer := 0;
  r record;
begin
  if not (current_user in ('service_role', 'postgres') or public.has_role(auth.uid(), 'admin')) then
    raise exception 'not authorized';
  end if;

  select results_applied into _applied from public.tournaments where id = _tournament_id;
  if _applied is null then
    raise exception 'tournament not found';
  end if;
  if _applied then
    return jsonb_build_object('already_applied', true);
  end if;

  for r in
    select player_id,
           sum(kills)::int as kills,
           count(*) filter (where position = 1)::int as booyahs,
           count(*) filter (where position = 2)::int as top2,
           count(*) filter (where is_mvp)::int as mvps,
           coalesce(sum(prize), 0) as prize
    from public.results
    where tournament_id = _tournament_id and player_id is not null
    group by player_id
  loop
    insert into public.player_stats (player_id) values (r.player_id)
    on conflict (player_id) do nothing;

    update public.player_stats set
      matches = matches + 1,
      kills = kills + r.kills,
      booyahs = booyahs + r.booyahs,
      top2 = top2 + r.top2,
      mvps = mvps + r.mvps,
      earnings = earnings + r.prize,
      season_matches = season_matches + 1,
      season_kills = season_kills + r.kills,
      season_booyahs = season_booyahs + r.booyahs,
      season_top2 = season_top2 + r.top2,
      season_mvps = season_mvps + r.mvps,
      season_earnings = season_earnings + r.prize,
      updated_at = now()
    where player_id = r.player_id;

    _rows := _rows + 1;
  end loop;

  -- Conquistas derivadas dos totais all-time e do histórico
  with base as (
    select s.player_id, s.kills, s.booyahs, s.mvps,
           (select max(x.kills) from public.results x where x.player_id = s.player_id) as best_kills,
           (select count(*) from (
              select x.kills
              from public.results x
              join public.tournaments tt on tt.id = x.tournament_id
              where x.player_id = s.player_id
              order by tt.tournament_date desc, tt.start_time desc
              limit 5
            ) last5 where last5.kills > 0) as last5_with_kill
    from public.player_stats s
    where s.player_id in (
      select player_id from public.results
      where tournament_id = _tournament_id and player_id is not null
    )
  ),
  matched as (
    select b.player_id, a.id as achievement_id
    from base b
    join public.achievements a on
      (a.code = 'first_blood'  and b.kills >= 1) or
      (a.code = 'booyah'       and b.booyahs >= 1) or
      (a.code = 'carrasco'     and coalesce(b.best_kills, 0) >= 10) or
      (a.code = 'on_fire'      and b.last5_with_kill >= 5) or
      (a.code = 'cacador'      and b.kills >= 50) or
      (a.code = 'exterminador' and b.kills >= 100) or
      (a.code = 'tricampeao'   and b.booyahs >= 3) or
      (a.code = 'mvp'          and b.mvps >= 1)
  ),
  ins as (
    insert into public.player_achievements (player_id, achievement_id)
    select player_id, achievement_id from matched
    on conflict (player_id, achievement_id) do nothing
    returning 1
  )
  select count(*) into _unlocked from ins;

  update public.tournaments
     set results_applied = true,
         status = 'finished'
   where id = _tournament_id;

  return jsonb_build_object('players', _rows, 'achievements_unlocked', _unlocked);
end;
$$;

grant execute on function public.apply_tournament_results(uuid) to authenticated, service_role;