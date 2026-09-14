import { AppState } from 'react-native';
import { useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase';
const TABLES = [
  'goals',
  'actions',
  'check_ins',
  'obligations',
  'activity_events',
] as const;
export function useCoupleRealtime(
  coupleId: string | undefined,
  refresh: () => void,
) {
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client || !coupleId) return;
    let channel = client.channel(`couple:${coupleId}`);
    for (const table of TABLES)
      channel = channel.on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        refresh,
      );
    channel.subscribe();
    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      appState.remove();
      void client.removeChannel(channel);
    };
  }, [coupleId, refresh]);
}
