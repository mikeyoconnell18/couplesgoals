-- Make individual, joint, and parallel participation explicit without changing historical meaning.
create type public.action_participation_mode as enum ('individual','joint','parallel');
alter table public.actions add column participation_mode public.action_participation_mode;
alter table public.actions add column accountability_user_id uuid references public.profiles(id);
update public.actions set participation_mode=case when assigned_user_id is null then 'joint'::public.action_participation_mode else 'individual'::public.action_participation_mode end where participation_mode is null;
alter table public.actions alter column participation_mode set not null;
alter table public.actions alter column participation_mode set default 'individual';
alter table public.actions add constraint action_participation_people_check check(
 (participation_mode='individual' and assigned_user_id is not null) or
 (participation_mode in ('joint','parallel') and assigned_user_id is null)
);
alter table public.check_ins add column participation_mode public.action_participation_mode;
update public.check_ins ci set participation_mode=a.participation_mode from public.actions a where a.id=ci.action_id and ci.participation_mode is null;
create or replace function public.copy_action_participation_to_checkin() returns trigger language plpgsql set search_path='' as $$
begin select participation_mode into new.participation_mode from public.actions where id=new.action_id; return new; end $$;
create trigger copy_action_participation before insert or update of action_id on public.check_ins for each row execute function public.copy_action_participation_to_checkin();
create unique index check_ins_joint_occurrence_unique on public.check_ins(action_id,effective_local_date) where deleted_at is null and participation_mode='joint';
create index actions_participation_assignee_idx on public.actions(goal_id,participation_mode,assigned_user_id) where deleted_at is null and archived_at is null;
comment on column public.actions.assigned_user_id is 'Primary performer for individual actions; null for joint and parallel actions.';
comment on column public.actions.accountability_user_id is 'Optional observing/encouraging partner for an individual action.';
comment on column public.check_ins.user_id is 'Performer for individual/parallel actions; honor-system logger attribution for joint actions.';


-- Replace generic connected copy with attributed partner names.
create or replace function public.notify_partner_for_activity() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.in_app_notifications(couple_id,recipient_user_id,actor_user_id,kind,title,body,entity_type,entity_id,group_key)
 select new.couple_id,cm.user_id,new.actor_user_id,new.event_type,coalesce((select p.display_name from public.profiles p where p.id=new.actor_user_id),'Your partner') || ' shared an update',new.summary,new.entity_type,new.entity_id,new.event_type || ':' || coalesce(new.entity_id::text,new.id::text)
 from public.couple_members cm where cm.couple_id=new.couple_id and cm.left_at is null and cm.user_id<>new.actor_user_id
 on conflict(recipient_user_id,group_key) where read_at is null and group_key is not null do update set title=excluded.title,body=excluded.body,created_at=now(); return new;
end $$;
create or replace function public.notify_partner_for_connected_item() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.in_app_notifications(couple_id,recipient_user_id,actor_user_id,kind,title,body,entity_type,entity_id)
 select new.couple_id,cm.user_id,new.user_id,tg_table_name,coalesce((select p.display_name from public.profiles p where p.id=new.user_id),'Your partner') || case when tg_table_name='activity_comments' then ' left a comment' else ' reacted to your update' end,case when tg_table_name='activity_comments' then left(to_jsonb(new)->>'body',160) else to_jsonb(new)->>'kind' end,'activity',new.activity_event_id
 from public.couple_members cm where cm.couple_id=new.couple_id and cm.left_at is null and cm.user_id<>new.user_id; return new;
end $$;
