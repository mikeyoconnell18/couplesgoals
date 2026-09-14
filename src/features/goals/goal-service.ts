import { getSupabaseClient } from '@/lib/supabase';
export type GoalDraft = {
  coupleId: string;
  title: string;
  description?: string;
  goalType: string;
  ownerType: 'shared' | 'user';
  ownerUserId?: string;
  startDate: string;
  endDate?: string;
  targetValue?: number;
  unitLabel?: string;
};
function client() {
  const value = getSupabaseClient();
  if (!value) throw new Error('Supabase is not configured');
  return value;
}
export async function createGoal(draft: GoalDraft, userId: string) {
  const { data, error } = await client()
    .from('goals')
    .insert({
      couple_id: draft.coupleId,
      created_by: userId,
      title: draft.title,
      description: draft.description,
      goal_type: draft.goalType,
      owner_type: draft.ownerType,
      owner_user_id: draft.ownerUserId,
      metric_type: draft.targetValue ? 'count' : 'boolean',
      start_date: draft.startDate,
      end_date: draft.endDate,
      target_value: draft.targetValue,
      unit_label: draft.unitLabel,
      status: 'active',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function updateGoal(
  id: string,
  changes: Record<string, string | number | null>,
) {
  const { data, error } = await client()
    .from('goals')
    .update(changes)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function archiveGoal(id: string) {
  return updateGoal(id, { status: 'archived' });
}
export async function deleteGoal(id: string) {
  return updateGoal(id, { deleted_at: new Date().toISOString() });
}
export async function addAction(
  goalId: string,
  input: {
    title: string;
    cadence: 'daily' | 'weekdays' | 'weekly' | 'once';
    target: number;
    assignedUserId?: string;
    startDate: string;
  },
) {
  const { data, error } = await client()
    .from('actions')
    .insert({
      goal_id: goalId,
      title: input.title,
      cadence_type: input.cadence,
      target_value: input.target,
      assigned_user_id: input.assignedUserId,
      start_date: input.startDate,
      metric_type: input.target === 1 ? 'boolean' : 'count',
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
export async function addConsequence(
  coupleId: string,
  goalId: string,
  actionId: string,
  userId: string,
  input: {
    title: string;
    responsibleUserId?: string;
    beneficiaryUserId?: string;
  },
) {
  const { data, error } = await client()
    .from('consequence_rules')
    .insert({
      couple_id: coupleId,
      goal_id: goalId,
      action_id: actionId,
      trigger_type: 'period_miss',
      category: 'custom',
      title: input.title,
      responsible_user_id: input.responsibleUserId,
      beneficiary_user_id: input.beneficiaryUserId,
      created_by: userId,
      trigger_config: { period: 'week' },
      active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
