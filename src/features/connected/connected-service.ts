import { getSupabaseClient } from '@/lib/supabase';
export type ReactionKind = 'heart' | 'fire' | 'celebrate' | 'laugh' | 'support';
export type ActivityEvent = {
  id: string;
  couple_id: string;
  actor_user_id: string;
  event_type: string;
  summary: string;
  occurred_at: string;
};
export type Reaction = {
  id: string;
  activity_event_id: string;
  user_id: string;
  kind: ReactionKind;
};
export type ActivityComment = {
  id: string;
  activity_event_id: string | null;
  goal_id: string | null;
  user_id: string;
  body: string;
  created_at: string;
};
export type InAppNotification = {
  id: string;
  kind: string;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
  read_at: string | null;
  created_at: string;
};
function client() {
  const value = getSupabaseClient();
  if (!value) throw new Error('Supabase is not configured');
  return value;
}
export async function loadConnected(coupleId: string, userId: string) {
  const [events, reactions, comments, notifications] = await Promise.all([
    client()
      .from('activity_events')
      .select('*')
      .eq('couple_id', coupleId)
      .order('occurred_at', { ascending: false })
      .limit(30),
    client().from('activity_reactions').select('*').eq('couple_id', coupleId),
    client()
      .from('activity_comments')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: true }),
    client()
      .from('in_app_notifications')
      .select('*')
      .eq('recipient_user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);
  const error =
    events.error || reactions.error || comments.error || notifications.error;
  if (error) throw error;
  return {
    events: (events.data ?? []) as ActivityEvent[],
    reactions: (reactions.data ?? []) as Reaction[],
    comments: (comments.data ?? []) as ActivityComment[],
    notifications: (notifications.data ?? []) as InAppNotification[],
  };
}
export async function setReaction(input: {
  coupleId: string;
  eventId: string;
  userId: string;
  kind: ReactionKind | null;
}) {
  if (!input.kind) {
    const { error } = await client()
      .from('activity_reactions')
      .delete()
      .eq('activity_event_id', input.eventId)
      .eq('user_id', input.userId);
    if (error) throw error;
    return;
  }
  const { error } = await client().from('activity_reactions').upsert(
    {
      couple_id: input.coupleId,
      activity_event_id: input.eventId,
      user_id: input.userId,
      kind: input.kind,
    },
    { onConflict: 'activity_event_id,user_id' },
  );
  if (error) throw error;
}
export async function addComment(input: {
  coupleId: string;
  eventId?: string;
  goalId?: string;
  userId: string;
  body: string;
}) {
  const body = input.body.trim();
  if (!body || body.length > 500)
    throw new Error('Comments must be between 1 and 500 characters.');
  const { error } = await client().from('activity_comments').insert({
    couple_id: input.coupleId,
    activity_event_id: input.eventId,
    goal_id: input.goalId,
    user_id: input.userId,
    body,
  });
  if (error) throw error;
}
export async function deleteComment(id: string, userId: string) {
  const { error } = await client()
    .from('activity_comments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
}
export async function postCoupleNote(input: {
  coupleId: string;
  userId: string;
  body: string;
  kind: 'encouragement' | 'note' | 'nudge';
}) {
  const body = input.body.trim();
  if (!body || body.length > 500)
    throw new Error('Notes must be between 1 and 500 characters.');
  const { error } = await client()
    .from('activity_events')
    .insert({
      couple_id: input.coupleId,
      actor_user_id: input.userId,
      event_type: `couple_${input.kind}`,
      entity_type: 'couple',
      entity_id: input.coupleId,
      summary: body,
      metadata: { kind: input.kind },
    });
  if (error) throw error;
}
export async function markNotificationRead(id: string) {
  const { error } = await client()
    .from('in_app_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
export async function markAllNotificationsRead(userId: string) {
  const { error } = await client()
    .from('in_app_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('recipient_user_id', userId)
    .is('read_at', null);
  if (error) throw error;
}
