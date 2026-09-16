import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/screen';
import { useCoupleData } from '@/features/data/couple-data-context';
import {
  archiveGoal,
  deleteGoal,
  updateGoal,
} from '@/features/goals/goal-service';
import { colors, radius, spacing } from '@/theme/tokens';
export default function GoalDetail() {
  const { goalId } = useLocalSearchParams<{ goalId: string }>();
  const { goals, actions, refresh } = useCoupleData();
  const goal = goals.find((item) => item.id === goalId);
  const [title, setTitle] = useState(goal?.title ?? '');
  const [description, setDescription] = useState(goal?.description ?? '');
  const [error, setError] = useState('');
  if (!goal)
    return (
      <Screen title="Goal unavailable">
        <Text style={styles.copy}>
          It may have been archived or deleted by your partner.
        </Text>
      </Screen>
    );
  async function mutate(operation: () => Promise<unknown>, leave = false) {
    setError('');
    try {
      await operation();
      await refresh();
      if (leave) router.back();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not update the goal.',
      );
    }
  }
  return (
    <Screen eyebrow={goal.goal_type.replace('_', ' ')} title="Edit goal">
      <Text style={styles.label}>TITLE</Text>
      <TextInput value={title} onChangeText={setTitle} style={styles.input} />
      <Text style={styles.label}>DESCRIPTION</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        multiline
        style={[styles.input, styles.multiline]}
      />
      <Text style={styles.heading}>Actions</Text>
      {actions
        .filter((item) => item.goal_id === goal.id)
        .map((item) => (
          <Text key={item.id} style={styles.action}>
            {item.title} · {item.target_value} {item.cadence_type}
          </Text>
        ))}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        onPress={() =>
          void mutate(() =>
            updateGoal(goal.id, {
              title: title.trim(),
              description: description.trim(),
            }),
          )
        }
        style={styles.save}
      >
        <Text style={styles.saveText}>Save changes</Text>
      </Pressable>
      <Pressable
        onPress={() => void mutate(() => archiveGoal(goal.id), true)}
        style={styles.secondary}
      >
        <Text style={styles.secondaryText}>Archive goal</Text>
      </Pressable>
      <Pressable
        onPress={() =>
          Alert.alert(
            'Delete goal?',
            'History remains available, but the goal will leave active views.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => void mutate(() => deleteGoal(goal.id), true),
              },
            ],
          )
        }
      >
        <Text style={styles.delete}>Delete goal</Text>
      </Pressable>
    </Screen>
  );
}
const styles = StyleSheet.create({
  copy: { color: colors.textSecondary },
  label: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
    marginTop: spacing.md,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.ink,
  },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  heading: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '900',
    marginTop: spacing.xl,
  },
  action: {
    backgroundColor: colors.elevated,
    padding: spacing.md,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
    color: colors.ink,
  },
  error: { color: colors.raspberry, marginTop: spacing.md },
  save: {
    backgroundColor: colors.primary,
    padding: 17,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  saveText: { color: 'white', fontWeight: '900' },
  secondary: {
    borderWidth: 1,
    borderColor: colors.primary,
    padding: 15,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  secondaryText: { color: colors.raspberry, fontWeight: '800' },
  delete: {
    color: colors.raspberry,
    textAlign: 'center',
    marginTop: spacing.lg,
    fontWeight: '700',
  },
});
