-- Connected encouragement layer. Additive; does not rewrite deployed history.
alter table public.activity_events add constraint activity_events_id_couple_unique unique(id,couple_id);
alter table public.goals add constraint goals_id_couple_unique unique(id,couple_id);

create type public.activity_reaction_kind as enum ('heart','fire','celebrate','laugh','support');
create table public.activity_reactions (
 id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
 activity_event_id uuid not null, user_id uuid not null references public.profiles(id) on delete cascade,
 kind public.activity_reaction_kind not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(activity_event_id,user_id), foreign key(activity_event_id,couple_id) references public.activity_events(id,couple_id) on delete cascade
);
create table public.activity_comments (
 id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
 activity_event_id uuid, goal_id uuid,
 user_id uuid not null references public.profiles(id) on delete cascade, body text not null check(length(trim(body)) between 1 and 500),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(num_nonnulls(activity_event_id,goal_id)=1), foreign key(activity_event_id,couple_id) references public.activity_events(id,couple_id) on delete cascade, foreign key(goal_id,couple_id) references public.goals(id,couple_id) on delete cascade
);
create table public.in_app_notifications (
 id uuid primary key default gen_random_uuid(), couple_id uuid not null references public.couples(id) on delete cascade,
 recipient_user_id uuid not null references public.profiles(id) on delete cascade, actor_user_id uuid references public.profiles(id) on delete set null,
 kind text not null, title text not null, body text, entity_type text, entity_id uuid, group_key text, read_at timestamptz,
 created_at timestamptz not null default now(), check(actor_user_id is null or actor_user_id <> recipient_user_id)
);
create index activity_reactions_couple_event_idx on public.activity_reactions(couple_id,activity_event_id);
create index activity_comments_event_created_idx on public.activity_comments(activity_event_id,created_at);
create index activity_comments_goal_created_idx on public.activity_comments(goal_id,created_at);
create index notifications_recipient_unread_idx on public.in_app_notifications(recipient_user_id,created_at desc) where read_at is null;
create unique index notifications_grouped_unread_idx on public.in_app_notifications(recipient_user_id,group_key) where read_at is null and group_key is not null;
alter table public.activity_reactions enable row level security; alter table public.activity_comments enable row level security; alter table public.in_app_notifications enable row level security;
create policy "members read reactions" on public.activity_reactions for select using(public.is_active_couple_member(couple_id));
create policy "members add own reactions" on public.activity_reactions for insert with check(public.is_active_couple_member(couple_id) and user_id=auth.uid());
create policy "users update own reactions" on public.activity_reactions for update using(user_id=auth.uid()) with check(user_id=auth.uid() and public.is_active_couple_member(couple_id));
create policy "users delete own reactions" on public.activity_reactions for delete using(user_id=auth.uid());
create policy "members read comments" on public.activity_comments for select using(public.is_active_couple_member(couple_id));
create policy "members add own comments" on public.activity_comments for insert with check(public.is_active_couple_member(couple_id) and user_id=auth.uid());
create policy "users update own comments" on public.activity_comments for update using(user_id=auth.uid()) with check(user_id=auth.uid() and public.is_active_couple_member(couple_id));
create policy "users delete own comments" on public.activity_comments for delete using(user_id=auth.uid());
create policy "recipients read notifications" on public.in_app_notifications for select using(recipient_user_id=auth.uid());
create policy "recipients update notifications" on public.in_app_notifications for update using(recipient_user_id=auth.uid()) with check(recipient_user_id=auth.uid());
-- Activity authors may create a notification only for their current partner, never themselves.
create policy "members notify partner" on public.in_app_notifications for insert with check(actor_user_id=auth.uid() and recipient_user_id<>auth.uid() and public.is_active_couple_member(couple_id) and public.shares_active_couple_with(recipient_user_id));
create trigger touch_updated_at before update on public.activity_reactions for each row execute function public.touch_updated_at();
create trigger touch_updated_at before update on public.activity_comments for each row execute function public.touch_updated_at();
alter publication supabase_realtime add table public.activity_reactions;
alter publication supabase_realtime add table public.activity_comments;
alter publication supabase_realtime add table public.in_app_notifications;

create or replace function public.notify_partner_for_activity() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.in_app_notifications(couple_id,recipient_user_id,actor_user_id,kind,title,body,entity_type,entity_id,group_key)
 select new.couple_id,cm.user_id,new.actor_user_id,new.event_type,'New update from your partner',new.summary,new.entity_type,new.entity_id,new.event_type || ':' || coalesce(new.entity_id::text,new.id::text)
 from public.couple_members cm where cm.couple_id=new.couple_id and cm.left_at is null and cm.user_id<>new.actor_user_id
 on conflict(recipient_user_id,group_key) where read_at is null and group_key is not null do update set body=excluded.body,created_at=now();
 return new;
end $$;
create trigger notify_partner_after_activity after insert on public.activity_events for each row execute function public.notify_partner_for_activity();
create or replace function public.notify_partner_for_connected_item() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.in_app_notifications(couple_id,recipient_user_id,actor_user_id,kind,title,body,entity_type,entity_id)
 select new.couple_id,cm.user_id,new.user_id,tg_table_name,case when tg_table_name='activity_comments' then 'Your partner left a comment' else 'Your partner reacted' end,
 case when tg_table_name='activity_comments' then left(to_jsonb(new)->>'body',160) else to_jsonb(new)->>'kind' end,'activity',new.activity_event_id
 from public.couple_members cm where cm.couple_id=new.couple_id and cm.left_at is null and cm.user_id<>new.user_id;
 return new;
end $$;
create trigger notify_partner_after_comment after insert on public.activity_comments for each row execute function public.notify_partner_for_connected_item();
create trigger notify_partner_after_reaction after insert on public.activity_reactions for each row execute function public.notify_partner_for_connected_item();
