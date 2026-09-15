import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/screen';
import { useAuth } from '@/features/auth/auth-context';
import { useCoupleData } from '@/features/data/couple-data-context';
import {
  addAction,
  addConsequence,
  createGoal,
} from '@/features/goals/goal-service';
import { colors, radius, spacing } from '@/theme/tokens';
export default function NewGoal() {
  const { session } = useAuth();
  const { couple, members, refresh } = useCoupleData();
  const [title, setTitle] = useState('');
  const [action, setAction] = useState('');
  const [target, setTarget] = useState('1');
  const [consequence, setConsequence] = useState('');
  const [who, setWho] = useState<'me' | 'partner' | 'joint' | 'parallel'>(
    'joint',
  );
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function save() {
    if (!session || !couple) return;
    setBusy(true);
    setError('');
    try {
      const today = new Intl.DateTimeFormat('en-CA', {
        timeZone: couple.timezone,
      }).format(new Date());
      const goal = await createGoal(
        {
          coupleId: couple.id,
          title,
          goalType: 'custom',
          ownerType: 'shared',
          startDate: today,
          targetValue: Number(target),
          unitLabel: 'times',
        },
        session.user.id,
      );
      const createdAction = await addAction(goal.id, {
        title: action || title,
        cadence: 'weekly',
        target: Number(target),
        startDate: today,
        participationMode:
          who === 'joint'
            ? 'joint'
            : who === 'parallel'
              ? 'parallel'
              : 'individual',
        assignedUserId:
          who === 'me'
            ? session.user.id
            : who === 'partner'
              ? members.find((member) => member.user_id !== session.user.id)
                  ?.user_id
              : undefined,
        accountabilityUserId:
          who === 'me'
            ? members.find((member) => member.user_id !== session.user.id)
                ?.user_id
            : who === 'partner'
              ? session.user.id
              : undefined,
      });
      if (consequence.trim())
        await addConsequence(
          couple.id,
          goal.id,
          createdAction.id,
          session.user.id,
          {
            title: consequence,
            responsibleUserId: session.user.id,
            beneficiaryUserId: members.find(
              (member) => member.user_id !== session.user.id,
            )?.user_id,
          },
        );
      await refresh();
      router.back();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not save the goal.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen eyebrow="Our goal" title="Create it together.">
      <Field
        label="GOAL TITLE"
        value={title}
        onChange={setTitle}
        placeholder="Work out together"
      />
      <Field
        label="RECURRING ACTION"
        value={action}
        onChange={setAction}
        placeholder="Complete a workout"
      />
      <Text style={styles.label}>Who’s doing this?</Text>
      <View style={styles.choices}>
        {(
          [
            [
              'me',
              members.find((member) => member.user_id === session?.user.id)
                ?.profiles?.display_name ?? 'Me',
            ],
            [
              'partner',
              members.find((member) => member.user_id !== session?.user.id)
                ?.profiles?.display_name ?? 'My partner',
            ],
            [
              'joint',
              `${
                members
                  .map((member) => member.profiles?.display_name)
                  .filter(Boolean)
                  .join(' + ') || 'Both of us'
              } together`,
            ],
            [
              'parallel',
              `${
                members
                  .map((member) => member.profiles?.display_name)
                  .filter(Boolean)
                  .join(' and ') || 'Each of us'
              } separately`,
            ],
          ] as const
        ).map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setWho(value)}
            style={[styles.choice, who === value && styles.choiceSelected]}
          >
            <Text
              style={[
                styles.choiceText,
                who === value && styles.choiceTextSelected,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Field
        label="WEEKLY TARGET"
        value={target}
        onChange={setTarget}
        placeholder="4"
        numeric
      />
      <Field
        label="IF WE MISS (OPTIONAL)"
        value={consequence}
        onChange={setConsequence}
        placeholder="Cook dinner"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        disabled={busy || !title.trim() || Number(target) <= 0}
        onPress={() => void save()}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {busy ? 'Saving…' : 'Create shared goal'}
        </Text>
      </Pressable>
      <Text style={styles.hint}>
        Both partners can edit this later. No approval required.
      </Text>
    </Screen>
  );
}
function Field({
  label,
  value,
  onChange,
  placeholder,
  numeric,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  numeric?: boolean;
}) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType={numeric ? 'number-pad' : 'default'}
        style={styles.input}
      />
    </>
  );
}
const styles = StyleSheet.create({
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
  button: {
    marginTop: spacing.xl,
    padding: 17,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: '900' },
  error: { color: colors.raspberry, marginTop: spacing.sm },
  hint: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontSize: 12,
  },
  choices: { gap: spacing.xs, marginBottom: spacing.md },
  choice: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  choiceSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  choiceText: { color: colors.textSecondary, fontWeight: '600' },
  choiceTextSelected: { color: colors.primary },
});
