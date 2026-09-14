import { Placeholder, Screen } from '@/components/screen';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/features/auth/auth-context';
import { useCoupleData } from '@/features/data/couple-data-context';
import { colors, radius, spacing } from '@/theme/tokens';
export default function Goals() {
  const { isDemo } = useAuth();
  const { goals } = useCoupleData();
  if (isDemo)
    return (
      <Screen eyebrow="Our plans" title="Goals">
        <Placeholder>
          Mexico prep is active. Connect Supabase to create persistent shared
          goals with your partner.
        </Placeholder>
      </Screen>
    );
  return (
    <Screen eyebrow="Our plans" title="Goals">
      {goals.length ? (
        goals.map((goal) => (
          <Pressable
            key={goal.id}
            style={styles.card}
            onPress={() => router.push(`/goals/${goal.id}`)}
          >
            <Text style={styles.type}>{goal.goal_type.replace('_', ' ')}</Text>
            <Text style={styles.title}>{goal.title}</Text>
            <Text style={styles.copy}>
              {goal.description || `${goal.owner_type} · ${goal.status}`}
            </Text>
          </Pressable>
        ))
      ) : (
        <Placeholder>
          Your first shared goal can be anything meaningful to the two of you.
        </Placeholder>
      )}
      <Pressable
        onPress={() => router.push('/goals/new')}
        style={styles.button}
      >
        <Text style={styles.buttonText}>＋ Create a goal</Text>
      </Pressable>
    </Screen>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  type: {
    color: colors.raspberry,
    textTransform: 'uppercase',
    fontWeight: '900',
    fontSize: 10,
  },
  title: {
    color: colors.plum,
    fontWeight: '800',
    fontSize: 19,
    marginVertical: 5,
  },
  copy: { color: colors.mutedPlum },
  button: {
    backgroundColor: colors.raspberry,
    borderRadius: radius.md,
    padding: 17,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  buttonText: { color: 'white', fontWeight: '900' },
});
