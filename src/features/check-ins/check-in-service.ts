import { getSupabaseClient } from '@/lib/supabase';
export type CheckInInput = {
  coupleId: string;
  goalId: string;
  actionId: string;
  userId: string;
  localDate: string;
  value: number;
  note?: string;
};
export async function logCheckIn(input: CheckInInput) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');
  const { data, error } = await client
    .from('check_ins')
    .upsert(
      {
        couple_id: input.coupleId,
        goal_id: input.goalId,
        action_id: input.actionId,
        user_id: input.userId,
        effective_local_date: input.localDate,
        value: input.value,
        note: input.note,
        occurred_at: new Date().toISOString(),
        deleted_at: null,
      },
      { onConflict: 'action_id,user_id,effective_local_date' },
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function undoCheckIn(id: string) {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');
  const { error } = await client
    .from('check_ins')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
