import { router } from 'expo-router';
import { View, StyleSheet, Text } from 'react-native';
import {
  AppScreen,
  EmptyState,
  GoalCard,
  PrimaryButton,
  SectionHeader,
} from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { useCoupleData } from '@/features/data/couple-data-context';
import { colors, spacing, type } from '@/theme/tokens';
export default function Goals() {
  const { isDemo } = useAuth();
  const data = useCoupleData();
  const goals = isDemo
    ? [
        {
          id: 'mexico',
          title: 'Mexico, here we come',
          description: 'Travel · 62% complete',
          owner_type: 'shared',
          owner_user_id: null,
          target_value: 100,
        },
        {
          id: 'spanish',
          title: 'Practice Spanish',
          description: 'Learning · 67% complete',
          owner_type: 'user',
          owner_user_id: 'taylor',
          target_value: 3,
        },
      ]
    : data.goals;
  const shared = goals.filter((g) => g.owner_type === 'shared');
  const personal = goals.filter((g) => g.owner_type !== 'shared');
  const progress = (id: string, target: number | null) =>
    isDemo
      ? id === 'mexico'
        ? 62
        : 67
      : Math.min(
          100,
          (data.checkIns
            .filter((c) => c.goal_id === id)
            .reduce((n, c) => n + Number(c.value), 0) /
            Number(target || 1)) *
            100,
        );
  return (
    <AppScreen
      eyebrow={isDemo ? 'Demo · saved locally' : 'Connected'}
      title="Goals"
    >
      <Text style={s.intro}>
        Everything you are building together, with personal commitments kept in
        the same shared picture.
      </Text>
      <SectionHeader title="Shared goals" action={`${shared.length} active`} />
      {shared.length ? (
        shared.map((g) => (
          <GoalCard
            key={g.id}
            title={g.title}
            subtitle={g.description || 'Shared goal'}
            progress={progress(g.id, g.target_value)}
            owner="Both"
            onPress={() => !isDemo && router.push(`/goals/${g.id}`)}
          />
        ))
      ) : (
        <EmptyState
          title="Build something together"
          body="Create a shared outcome and choose the small actions that move it forward."
        />
      )}
      <SectionHeader
        title="Personal contributions"
        action={`${personal.length} active`}
      />
      {personal.length ? (
        personal.map((g) => (
          <GoalCard
            key={g.id}
            title={g.title}
            subtitle={g.description || 'Visible to both partners'}
            progress={progress(g.id, g.target_value)}
            owner={
              isDemo
                ? 'Taylor'
                : (data.members.find((m) => m.user_id === g.owner_user_id)
                    ?.profiles?.display_name ?? 'Partner')
            }
            onPress={() => !isDemo && router.push(`/goals/${g.id}`)}
          />
        ))
      ) : (
        <EmptyState
          title="No personal goals yet"
          body="Personal commitments can still contribute to your shared momentum."
        />
      )}
      <View style={s.footer}>
        <PrimaryButton
          label="Create a goal"
          onPress={() => router.push('/goals/new')}
        />
      </View>
    </AppScreen>
  );
}
const s = StyleSheet.create({
  intro: {
    ...type.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  footer: { marginTop: spacing.lg },
});
