create extension if not exists pgcrypto;

create type public.couple_role as enum ('subscriber_owner', 'member');
create type public.goal_status as enum ('draft', 'active', 'completed', 'archived');
create type public.obligation_status as enum ('pending', 'scheduled', 'completed', 'forgiven', 'dismissed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(display_name) between 1 and 80), avatar_url text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.couples (
  id uuid primary key default gen_random_uuid(), display_name text, timezone text not null default 'UTC',
  invite_code text unique not null default upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8)),
  invite_expires_at timestamptz not null default now() + interval '7 days', created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(), disconnected_at timestamptz
);
create table public.couple_members (
  couple_id uuid not null references public.couples(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade,
  role public.couple_role not null default 'member', joined_at timestamptz not null default now(), left_at timestamptz,
  primary key (couple_id, user_id)
);
create unique index one_active_couple_per_user on public.couple_members(user_id) where left_at is null;
create or replace function public.enforce_two_active_members() returns trigger language plpgsql set search_path = '' as $$
begin
  if (select count(*) from public.couple_members where couple_id = new.couple_id and left_at is null) >= 2 then raise exception 'A couple can have at most two active members'; end if;
  return new;
end $$;
create trigger enforce_two_active_members before insert on public.couple_members for each row when (new.left_at is null) execute function public.enforce_two_active_members();

create table public.goals (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id), created_by uuid not null references public.profiles(id),
  title text not null, description text, goal_type text not null check (goal_type in ('shared_outcome','personal','shared_habit','savings','milestone','competition','custom')),
  owner_type text not null check (owner_type in ('user','partner','shared','separate')), owner_user_id uuid references public.profiles(id), icon text,
  metric_type text not null check (metric_type in ('boolean','count','currency','percentage','custom')), unit_label text, start_date date not null, end_date date,
  target_value numeric, contributes_to_momentum boolean not null default true, status public.goal_status not null default 'draft',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table public.actions (
  id uuid primary key default gen_random_uuid(), goal_id uuid not null references public.goals(id), title text not null, description text,
  assigned_user_id uuid references public.profiles(id), metric_type text not null, unit_label text,
  cadence_type text not null check (cadence_type in ('once','daily','weekdays','weekly','monthly','total')), selected_weekdays integer[],
  target_value numeric not null check (target_value > 0), start_date date not null, end_date date, contributes_to_momentum boolean not null default true,
  sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table public.check_ins (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id), goal_id uuid not null references public.goals(id), action_id uuid references public.actions(id),
  user_id uuid not null references public.profiles(id), value numeric not null default 1, occurred_at timestamptz not null default now(), note text, photo_path text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz
);
create table public.milestones (
  id uuid primary key default gen_random_uuid(), goal_id uuid not null references public.goals(id), title text not null, description text, target_value numeric,
  due_at timestamptz, completed_at timestamptz, completed_by uuid references public.profiles(id), reward_text text, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.competitions (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id), goal_id uuid references public.goals(id), title text not null,
  metric_type text not null, unit_label text, start_at timestamptz not null, end_at timestamptz not null, participant_one_user_id uuid not null references public.profiles(id),
  participant_two_user_id uuid not null references public.profiles(id), target_action_id uuid references public.actions(id), comparison_type text not null check (comparison_type in ('highest_value','highest_percentage','first_to_target')),
  tie_rule_text text, result_user_id uuid references public.profiles(id), status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check (end_at >= start_at), check (participant_one_user_id <> participant_two_user_id)
);
create table public.consequence_rules (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id), goal_id uuid references public.goals(id), action_id uuid references public.actions(id), competition_id uuid references public.competitions(id),
  trigger_type text not null check (trigger_type in ('occurrence_miss','period_miss','competition_loss','milestone_complete','goal_complete')), trigger_config jsonb not null default '{}',
  beneficiary_user_id uuid references public.profiles(id), responsible_user_id uuid references public.profiles(id), category text not null, title text not null, description text,
  stack_mode text not null default 'stack' check (stack_mode in ('stack','largest_wins')), active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.obligations (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id), source_rule_id uuid references public.consequence_rules(id) on delete set null,
  source_goal_id uuid references public.goals(id) on delete set null, owed_by_user_id uuid references public.profiles(id), owed_to_user_id uuid references public.profiles(id),
  obligation_type text not null check (obligation_type in ('consequence','reward')), category text not null, title text not null, description text,
  triggered_at timestamptz not null default now(), due_at timestamptz, status public.obligation_status not null default 'pending', completed_at timestamptz, note text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.activity_events (
  id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id), actor_user_id uuid not null references public.profiles(id),
  event_type text not null, entity_type text not null, entity_id uuid, summary text not null, metadata jsonb not null default '{}', occurred_at timestamptz not null default now()
);
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(), owner_user_id uuid not null unique references public.profiles(id), revenuecat_app_user_id text not null unique,
  entitlement text not null, status text not null, current_period_end timestamptz, platform text, updated_at timestamptz not null default now()
);

create or replace function public.is_active_couple_member(target_couple_id uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.couple_members where couple_id = target_couple_id and user_id = auth.uid() and left_at is null);
$$;
create or replace function public.goal_couple_id(target_goal_id uuid) returns uuid language sql stable security definer set search_path = '' as $$ select couple_id from public.goals where id = target_goal_id $$;
create or replace function public.is_couple_creator(target_couple_id uuid) returns boolean language sql stable security definer set search_path = '' as $$ select exists(select 1 from public.couples where id = target_couple_id and created_by = auth.uid()) $$;

alter table public.profiles enable row level security; alter table public.couples enable row level security; alter table public.couple_members enable row level security;
alter table public.goals enable row level security; alter table public.actions enable row level security; alter table public.check_ins enable row level security;
alter table public.milestones enable row level security; alter table public.competitions enable row level security; alter table public.consequence_rules enable row level security;
alter table public.obligations enable row level security; alter table public.activity_events enable row level security; alter table public.subscriptions enable row level security;

create policy "own profile read" on public.profiles for select using (id = auth.uid());
create policy "own profile update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "own profile insert" on public.profiles for insert with check (id = auth.uid());
create policy "members read couple" on public.couples for select using (public.is_active_couple_member(id));
create policy "authenticated create couple" on public.couples for insert with check (created_by = auth.uid());
create policy "members update couple" on public.couples for update using (public.is_active_couple_member(id));
create policy "members read membership" on public.couple_members for select using (public.is_active_couple_member(couple_id));
create policy "creator adds self" on public.couple_members for insert with check (user_id = auth.uid() and public.is_couple_creator(couple_id));
create policy "member leaves" on public.couple_members for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "couple goals read" on public.goals for select using (public.is_active_couple_member(couple_id));
create policy "couple goals insert" on public.goals for insert with check (public.is_active_couple_member(couple_id) and created_by = auth.uid());
create policy "couple goals update" on public.goals for update using (public.is_active_couple_member(couple_id)) with check (public.is_active_couple_member(couple_id));
create policy "couple goals delete" on public.goals for delete using (public.is_active_couple_member(couple_id));
create policy "couple actions" on public.actions for all using (public.is_active_couple_member(public.goal_couple_id(goal_id))) with check (public.is_active_couple_member(public.goal_couple_id(goal_id)));
create policy "couple checkins" on public.check_ins for all using (public.is_active_couple_member(couple_id)) with check (public.is_active_couple_member(couple_id) and user_id = auth.uid());
create policy "couple milestones" on public.milestones for all using (public.is_active_couple_member(public.goal_couple_id(goal_id))) with check (public.is_active_couple_member(public.goal_couple_id(goal_id)));
create policy "couple competitions" on public.competitions for all using (public.is_active_couple_member(couple_id)) with check (public.is_active_couple_member(couple_id));
create policy "couple rules" on public.consequence_rules for all using (public.is_active_couple_member(couple_id)) with check (public.is_active_couple_member(couple_id));
create policy "couple obligations" on public.obligations for all using (public.is_active_couple_member(couple_id)) with check (public.is_active_couple_member(couple_id));
create policy "couple activity" on public.activity_events for all using (public.is_active_couple_member(couple_id)) with check (public.is_active_couple_member(couple_id) and actor_user_id = auth.uid());
-- Billing truth is server-managed. Mobile clients receive read-only access to their own cached entitlement.
create policy "owner reads subscription" on public.subscriptions for select using (owner_user_id = auth.uid());
