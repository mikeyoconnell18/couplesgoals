-- Persistent two-person slice: atomic pairing, idempotent logging/reconciliation,
-- weekly history, indexes, and safe updated timestamps.
alter table public.couples add column if not exists invite_used_at timestamptz;
alter table public.goals add column if not exists custom_type_label text;
alter table public.goals drop constraint if exists goals_goal_type_check;
alter table public.goals add constraint goals_goal_type_check check (goal_type in ('fitness','health','relationship','savings','travel','household','learning','habit','shared_project','competition','custom','shared_outcome','personal','shared_habit','milestone'));
alter table public.actions add column if not exists archived_at timestamptz;
alter table public.check_ins add column if not exists effective_local_date date;
alter table public.consequence_rules add column if not exists monetary_amount numeric check (monetary_amount is null or monetary_amount >= 0);
alter table public.consequence_rules add column if not exists created_by uuid references public.profiles(id);
alter table public.obligations add column if not exists generation_key text;

update public.check_ins set effective_local_date = occurred_at::date where effective_local_date is null;
alter table public.check_ins alter column effective_local_date set not null;

create unique index if not exists check_ins_daily_unique
  on public.check_ins(action_id, user_id, effective_local_date)
  where deleted_at is null;
create unique index if not exists obligations_generation_unique
  on public.obligations(generation_key) where generation_key is not null;
create index if not exists goals_couple_status_idx on public.goals(couple_id, status) where deleted_at is null;
create index if not exists actions_goal_dates_idx on public.actions(goal_id, start_date, end_date) where deleted_at is null and archived_at is null;
create index if not exists check_ins_couple_date_idx on public.check_ins(couple_id, effective_local_date desc) where deleted_at is null;
create index if not exists obligations_couple_status_idx on public.obligations(couple_id, status, triggered_at desc);
create index if not exists activity_couple_occurred_idx on public.activity_events(couple_id, occurred_at desc);

create table public.weekly_results (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  competition_id uuid references public.competitions(id) on delete set null,
  week_start date not null,
  week_end date not null,
  participant_one_user_id uuid not null references public.profiles(id),
  participant_two_user_id uuid not null references public.profiles(id),
  participant_one_score numeric not null default 0,
  participant_two_score numeric not null default 0,
  shared_score numeric not null default 0,
  winner_user_id uuid references public.profiles(id),
  finalized_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique(couple_id, competition_id, week_start),
  check (week_end >= week_start),
  check (participant_one_user_id <> participant_two_user_id)
);
create index weekly_results_couple_week_idx on public.weekly_results(couple_id, week_start desc);
alter table public.weekly_results enable row level security;
create policy "couple weekly results" on public.weekly_results for all
  using (public.is_active_couple_member(couple_id))
  with check (public.is_active_couple_member(couple_id));

create or replace function public.shares_active_couple_with(other_user_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.couple_members mine join public.couple_members theirs on theirs.couple_id = mine.couple_id
    where mine.user_id = auth.uid() and mine.left_at is null and theirs.user_id = other_user_id and theirs.left_at is null);
$$;
create policy "partners read profile" on public.profiles for select using (public.shares_active_couple_with(id));

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
do $$ declare table_name text; begin
  foreach table_name in array array['profiles','goals','actions','check_ins','competitions','consequence_rules','obligations'] loop
    execute format('drop trigger if exists touch_updated_at on public.%I', table_name);
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function public.touch_updated_at()', table_name);
  end loop;
end $$;

create or replace function public.create_couple_with_membership(couple_name text, couple_timezone text)
returns table(couple_id uuid, invite_code text, invite_expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); created_id uuid; code text;
begin
  if uid is null then raise exception using errcode = '42501', message = 'Authentication required'; end if;
  if not exists(select 1 from public.profiles where id = uid) then raise exception using errcode = 'P0001', message = 'Complete your profile first'; end if;
  if exists(select 1 from public.couple_members where user_id = uid and left_at is null) then raise exception using errcode = '23505', message = 'You already belong to a couple'; end if;
  code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
  insert into public.couples(display_name, timezone, invite_code, invite_expires_at, created_by)
  values(nullif(trim(couple_name), ''), coalesce(nullif(trim(couple_timezone), ''), 'UTC'), code, now() + interval '7 days', uid) returning id into created_id;
  insert into public.couple_members(couple_id, user_id, role) values(created_id, uid, 'subscriber_owner');
  return query select created_id, code, now() + interval '7 days';
end $$;

create or replace function public.join_couple_by_invite_code(raw_code text)
returns table(couple_id uuid, couple_name text)
language plpgsql security definer set search_path = '' as $$
declare uid uuid := auth.uid(); normalized text := upper(regexp_replace(coalesce(raw_code, ''), '[^A-Za-z0-9]', '', 'g')); target public.couples%rowtype; member_count integer;
begin
  if uid is null then raise exception using errcode = '42501', message = 'Authentication required'; end if;
  if exists(select 1 from public.couple_members where user_id = uid and left_at is null) then raise exception using errcode = '23505', message = 'You already belong to a couple'; end if;
  select * into target from public.couples where invite_code = normalized and disconnected_at is null for update;
  if not found then raise exception using errcode = 'P0001', message = 'Invite code is invalid'; end if;
  if target.invite_used_at is not null then raise exception using errcode = 'P0001', message = 'Invite code was already used'; end if;
  if target.invite_expires_at <= now() then raise exception using errcode = 'P0001', message = 'Invite code has expired'; end if;
  select count(*) into member_count from public.couple_members where couple_members.couple_id = target.id and left_at is null;
  if member_count >= 2 then raise exception using errcode = 'P0001', message = 'This couple is already full'; end if;
  insert into public.couple_members(couple_id, user_id) values(target.id, uid);
  update public.couples set invite_used_at = now() where id = target.id;
  return query select target.id, target.display_name;
end $$;

create or replace function public.regenerate_couple_invite_code(target_couple_id uuid)
returns table(invite_code text, invite_expires_at timestamptz)
language plpgsql security definer set search_path = '' as $$
declare code text; expires timestamptz := now() + interval '7 days'; member_count integer;
begin
  if auth.uid() is null or not public.is_active_couple_member(target_couple_id) then raise exception using errcode = '42501', message = 'Not a couple member'; end if;
  select count(*) into member_count from public.couple_members where couple_id = target_couple_id and left_at is null;
  if member_count >= 2 then raise exception using errcode = 'P0001', message = 'This couple is already full'; end if;
  code := upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));
  update public.couples set invite_code = code, invite_expires_at = expires, invite_used_at = null where id = target_couple_id;
  return query select code, expires;
end $$;

revoke all on function public.create_couple_with_membership(text,text) from public;
revoke all on function public.join_couple_by_invite_code(text) from public;
revoke all on function public.regenerate_couple_invite_code(uuid) from public;
grant execute on function public.create_couple_with_membership(text,text) to authenticated;
grant execute on function public.join_couple_by_invite_code(text) to authenticated;
grant execute on function public.regenerate_couple_invite_code(uuid) to authenticated;

create or replace function public.reconcile_closed_consequences(target_couple_id uuid)
returns integer language plpgsql security definer set search_path = '' as $$
declare inserted_count integer; week_start date; week_end date;
begin
  if auth.uid() is null or not public.is_active_couple_member(target_couple_id) then raise exception using errcode = '42501', message = 'Not a couple member'; end if;
  select (date_trunc('week', now() at time zone c.timezone)::date - 7), (date_trunc('week', now() at time zone c.timezone)::date - 1)
  into week_start, week_end from public.couples c where c.id = target_couple_id;
  insert into public.obligations(couple_id,source_rule_id,source_goal_id,owed_by_user_id,owed_to_user_id,obligation_type,category,title,description,triggered_at,status,generation_key)
  select r.couple_id,r.id,r.goal_id,r.responsible_user_id,r.beneficiary_user_id,'consequence',r.category,r.title,r.description,now(),'pending',r.id::text || ':' || week_start::text
  from public.consequence_rules r join public.actions a on a.id = r.action_id
  where r.couple_id = target_couple_id and r.active and r.trigger_type = 'period_miss'
    and coalesce((select sum(ci.value) from public.check_ins ci where ci.action_id=a.id and ci.deleted_at is null and ci.effective_local_date between week_start and week_end),0) < a.target_value
  on conflict (generation_key) where generation_key is not null do nothing;
  get diagnostics inserted_count = row_count; return inserted_count;
end $$;
revoke all on function public.reconcile_closed_consequences(uuid) from public;
grant execute on function public.reconcile_closed_consequences(uuid) to authenticated;

-- Invite discovery is possible only through the narrow join RPC above.
drop policy if exists "authenticated create couple" on public.couples;
drop policy if exists "creator adds self" on public.couple_members;

alter publication supabase_realtime add table public.goals;
alter publication supabase_realtime add table public.actions;
alter publication supabase_realtime add table public.check_ins;
alter publication supabase_realtime add table public.obligations;
alter publication supabase_realtime add table public.activity_events;
