import { getSupabaseClient } from '@/lib/supabase';
import { normalizeInviteCode } from '@/domain/invite-code';

function requiredClient() {
  const client = getSupabaseClient();
  if (!client) throw new Error('Supabase is not configured');
  return client;
}
export async function upsertProfile(userId: string, displayName: string) {
  const { error } = await requiredClient()
    .from('profiles')
    .upsert({ id: userId, display_name: displayName.trim() });
  if (error) throw error;
}
export async function createCouple(name: string, timezone: string) {
  const { data, error } = await requiredClient().rpc(
    'create_couple_with_membership',
    { couple_name: name, couple_timezone: timezone },
  );
  if (error) throw error;
  return data?.[0];
}
export async function joinCouple(code: string) {
  const { data, error } = await requiredClient().rpc(
    'join_couple_by_invite_code',
    { raw_code: normalizeInviteCode(code) },
  );
  if (error) throw error;
  return data?.[0];
}
export async function regenerateInvite(coupleId: string) {
  const { data, error } = await requiredClient().rpc(
    'regenerate_couple_invite_code',
    { target_couple_id: coupleId },
  );
  if (error) throw error;
  return data?.[0];
}
