create or replace function public.tournament_slot_counts()
returns table (tournament_id uuid, taken int, confirmed int)
language sql stable security definer set search_path = public as $$
  select t.id,
         count(r.id) filter (where r.slot_status <> 'cancelled')::int,
         count(r.id) filter (where r.payment_status = 'confirmed')::int
  from public.tournaments t
  left join public.registrations r on r.tournament_id = t.id
  group by t.id
$$;
grant execute on function public.tournament_slot_counts() to anon, authenticated;