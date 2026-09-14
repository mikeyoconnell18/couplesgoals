import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/features/auth/auth-context';
import { useCoupleRealtime } from '@/hooks/use-couple-realtime';
import { getSupabaseClient } from '@/lib/supabase';

export type CoupleRecord = {
  id: string;
  display_name: string | null;
  timezone: string;
  invite_code: string;
  invite_expires_at: string;
};
export type MemberRecord = {
  user_id: string;
  profiles: { display_name: string } | null;
};
export type GoalRecord = {
  id: string;
  couple_id: string;
  title: string;
  description: string | null;
  goal_type: string;
  owner_type: string;
  owner_user_id: string | null;
  target_value: number | null;
  unit_label: string | null;
  status: string;
};
export type ActionRecord = {
  id: string;
  goal_id: string;
  title: string;
  assigned_user_id: string | null;
  cadence_type: string;
  target_value: number;
  metric_type: string;
};
export type CheckInRecord = {
  id: string;
  goal_id: string;
  action_id: string;
  user_id: string;
  value: number;
  effective_local_date: string;
  note: string | null;
};
export type ObligationRecord = {
  id: string;
  title: string;
  status: string;
  owed_by_user_id: string | null;
  owed_to_user_id: string | null;
  source_goal_id: string | null;
};
type State = {
  couple?: CoupleRecord;
  members: MemberRecord[];
  goals: GoalRecord[];
  actions: ActionRecord[];
  checkIns: CheckInRecord[];
  obligations: ObligationRecord[];
  loading: boolean;
  error?: string;
  refresh(): Promise<void>;
};
const Context = createContext<State | null>(null);
export function CoupleDataProvider({ children }: PropsWithChildren) {
  const { session, isDemo } = useAuth();
  const [state, setState] = useState<Omit<State, 'refresh'>>({
    members: [],
    goals: [],
    actions: [],
    checkIns: [],
    obligations: [],
    loading: !isDemo,
  });
  const refresh = useCallback(async () => {
    const client = getSupabaseClient();
    if (!client || !session) return;
    setState((current) => ({ ...current, loading: true, error: undefined }));
    try {
      const { data: membership, error: membershipError } = await client
        .from('couple_members')
        .select('couple_id')
        .eq('user_id', session.user.id)
        .is('left_at', null)
        .maybeSingle();
      if (membershipError) throw membershipError;
      if (!membership) {
        setState({
          members: [],
          goals: [],
          actions: [],
          checkIns: [],
          obligations: [],
          loading: false,
        });
        return;
      }
      const coupleId = membership.couple_id;
      const reconciliation = await client.rpc('reconcile_closed_consequences', {
        target_couple_id: coupleId,
      });
      if (reconciliation.error) throw reconciliation.error;
      const [
        coupleResult,
        membersResult,
        goalsResult,
        checkInsResult,
        obligationsResult,
      ] = await Promise.all([
        client
          .from('couples')
          .select('id,display_name,timezone,invite_code,invite_expires_at')
          .eq('id', coupleId)
          .single(),
        client
          .from('couple_members')
          .select('user_id,profiles(display_name)')
          .eq('couple_id', coupleId)
          .is('left_at', null),
        client
          .from('goals')
          .select('*')
          .eq('couple_id', coupleId)
          .is('deleted_at', null)
          .neq('status', 'archived'),
        client
          .from('check_ins')
          .select('*')
          .eq('couple_id', coupleId)
          .is('deleted_at', null),
        client
          .from('obligations')
          .select('*')
          .eq('couple_id', coupleId)
          .in('status', ['pending', 'scheduled']),
      ]);
      const failure = [
        coupleResult,
        membersResult,
        goalsResult,
        checkInsResult,
        obligationsResult,
      ].find((item) => item.error)?.error;
      if (failure) throw failure;
      const goals = (goalsResult.data ?? []) as GoalRecord[];
      let actions: ActionRecord[] = [];
      if (goals.length) {
        const result = await client
          .from('actions')
          .select('*')
          .in(
            'goal_id',
            goals.map((goal) => goal.id),
          )
          .is('deleted_at', null)
          .is('archived_at', null);
        if (result.error) throw result.error;
        actions = (result.data ?? []) as ActionRecord[];
      }
      const nextState = {
        couple: coupleResult.data as CoupleRecord,
        members: (membersResult.data ?? []) as unknown as MemberRecord[],
        goals,
        actions,
        checkIns: (checkInsResult.data ?? []) as CheckInRecord[],
        obligations: (obligationsResult.data ?? []) as ObligationRecord[],
        loading: false,
      };
      setState(nextState);
      await AsyncStorage.setItem(
        `couples-goals:cache:${session.user.id}`,
        JSON.stringify(nextState),
      );
    } catch (cause) {
      setState((current) => ({
        ...current,
        loading: false,
        error:
          cause instanceof Error
            ? cause.message
            : 'Could not load your shared goals.',
      }));
    }
  }, [session]);
  useEffect(() => {
    if (!session || isDemo) return;
    let current = true;
    AsyncStorage.getItem(`couples-goals:cache:${session.user.id}`).then(
      (cached) => {
        if (current && cached)
          setState({ ...JSON.parse(cached), loading: true });
        void refresh();
      },
    );
    return () => {
      current = false;
    };
  }, [isDemo, refresh, session]);
  useCoupleRealtime(state.couple?.id, () => {
    void refresh();
  });
  return (
    <Context.Provider value={{ ...state, refresh }}>
      {children}
    </Context.Provider>
  );
}
export function useCoupleData() {
  const value = useContext(Context);
  if (!value)
    throw new Error('useCoupleData must be used in CoupleDataProvider');
  return value;
}
