import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check, Plus, Sparkles } from 'lucide-react-native';
import { MomentumRing } from '@/components/momentum-ring';
import { Screen } from '@/components/screen';
import { calculateMomentum } from '@/domain/momentum';
import { useAuth } from '@/features/auth/auth-context';
import { logCheckIn } from '@/features/check-ins/check-in-service';
import { useCoupleData } from '@/features/data/couple-data-context';
import { useDemo } from '@/features/demo/demo-context';
import { colors, radius, spacing } from '@/theme/tokens';

export default function TodayScreen() {
  const { isDemo } = useAuth();
  return isDemo ? <DemoToday /> : <RealToday />;
}
function DemoToday() {
  const { actions, momentum, logAction, lastLogged } = useDemo();
  return (
    <Screen eyebrow="Monday, together · Demo" title="Make today count.">
      <View style={styles.hero}>
        <MomentumRing value={momentum} />
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>MEXICO, HERE YOU COME</Text>
          <Text style={styles.heroTitle}>Your week is building.</Text>
          <Text style={styles.heroBody}>
            Every small action moves the trip forward.
          </Text>
        </View>
      </View>
      {lastLogged && (
        <View style={styles.toast}>
          <Sparkles color={colors.teal} size={20} />
          <Text style={styles.toastText}>
            Saved on this device only. Shared momentum moved.
          </Text>
        </View>
      )}
      <Text style={styles.section}>Today's moves</Text>
      {actions.map((action) => (
        <View key={action.id} style={styles.card}>
          <View style={[styles.dot, { backgroundColor: action.accent }]} />
          <View style={styles.actionCopy}>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.detail}>{action.detail}</Text>
          </View>
          <Pressable
            accessibilityLabel={`Log ${action.title}`}
            onPress={() => logAction(action.id)}
            disabled={action.value >= action.target}
            style={[styles.log, action.value >= action.target && styles.done]}
          >
            {action.value >= action.target ? (
              <Check color="white" />
            ) : (
              <Plus color="white" />
            )}
          </Pressable>
        </View>
      ))}
      <Milestones />
    </Screen>
  );
}
function RealToday() {
  const { session } = useAuth();
  const {
    couple,
    members,
    goals,
    actions,
    checkIns,
    obligations,
    loading,
    error,
    refresh,
  } = useCoupleData();
  const [message, setMessage] = useState('');
  if (loading)
    return (
      <Screen title="Loading your goals…">
        <ActivityIndicator color={colors.raspberry} />
      </Screen>
    );
  if (error)
    return (
      <Screen title="We couldn't refresh.">
        <Text style={styles.body}>{error}</Text>
        <Pressable onPress={() => void refresh()} style={styles.retry}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </Screen>
    );
  const inputs = actions.map((action) => ({
    id: action.id,
    target: Number(action.target_value),
    progress: checkIns
      .filter((c) => c.action_id === action.id)
      .reduce((sum, c) => sum + Number(c.value), 0),
    contributesToMomentum: true,
  }));
  const momentum = calculateMomentum(inputs);
  async function log(action: (typeof actions)[number]) {
    if (!session || !couple) return;
    const goal = goals.find((g) => g.id === action.goal_id);
    if (!goal) return;
    setMessage('Saving…');
    try {
      const localDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: couple.timezone,
      }).format(new Date());
      await logCheckIn({
        coupleId: couple.id,
        goalId: goal.id,
        actionId: action.id,
        userId: session.user.id,
        localDate,
        value: 1,
      });
      setMessage('Logged — your partner will see it.');
      await refresh();
    } catch (cause) {
      setMessage(
        cause instanceof Error ? cause.message : 'Could not log. Retry.',
      );
    }
  }
  return (
    <Screen
      eyebrow={couple?.display_name ?? 'Together'}
      title="Make today count."
    >
      <View style={styles.hero}>
        <MomentumRing value={momentum} />
        <View style={styles.heroCopy}>
          <Text style={styles.kicker}>COUPLE MOMENTUM</Text>
          <Text style={styles.heroTitle}>
            {members
              .map((m) => m.profiles?.display_name)
              .filter(Boolean)
              .join(' + ') || 'Your team'}
          </Text>
          <Text style={styles.heroBody}>
            {inputs.length
              ? `${inputs.length} actions shape this score.`
              : 'No history yet — your first check-in starts momentum.'}
          </Text>
        </View>
      </View>
      {message ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{message}</Text>
        </View>
      ) : null}
      <Text style={styles.section}>Today's actions</Text>
      {actions.length ? (
        actions.map((action) => {
          const value = checkIns
            .filter((c) => c.action_id === action.id)
            .reduce((sum, c) => sum + Number(c.value), 0);
          return (
            <View key={action.id} style={styles.card}>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{action.title}</Text>
                <Text style={styles.detail}>
                  {value} of {action.target_value} · {action.cadence_type}
                </Text>
              </View>
              <Pressable
                accessibilityLabel={`Log ${action.title}`}
                onPress={() => void log(action)}
                style={styles.log}
              >
                <Plus color="white" />
              </Pressable>
            </View>
          );
        })
      ) : (
        <Empty
          title="Nothing due yet"
          copy="Add an action to an active goal."
        />
      )}
      <Text style={styles.section}>This week together</Text>
      <Empty
        title={`${checkIns.length} check-ins · ${obligations.length} make-it-ups open`}
        copy="Shared progress comes first. Scores update for both partners in realtime."
      />
      <Milestones />
    </Screen>
  );
}
function Empty({ title, copy }: { title: string; copy: string }) {
  return (
    <View style={styles.milestone}>
      <Text style={styles.milestoneTitle}>{title}</Text>
      <Text style={styles.body}>{copy}</Text>
    </View>
  );
}
function Milestones() {
  return (
    <View style={styles.milestone}>
      <Text style={styles.kicker}>NEXT SHARED WIN</Text>
      <Text style={styles.milestoneTitle}>Book the hotel</Text>
      <Text style={styles.body}>Celebrate with tacos when it's done</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.plum,
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.lg,
    alignItems: 'center',
  },
  heroCopy: { flex: 1 },
  kicker: {
    color: colors.coral,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: 'white',
    fontSize: 21,
    fontWeight: '800',
    marginVertical: 8,
  },
  heroBody: { color: colors.peach, fontSize: 14, lineHeight: 20 },
  body: { color: colors.mutedPlum, fontSize: 15, lineHeight: 21 },
  section: {
    color: colors.plum,
    fontSize: 21,
    fontWeight: '800',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: { width: 10, height: 42, borderRadius: 5 },
  actionCopy: { flex: 1 },
  actionTitle: { color: colors.plum, fontSize: 17, fontWeight: '700' },
  detail: { color: colors.mutedPlum, marginTop: 3 },
  log: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.raspberry,
  },
  done: { backgroundColor: colors.teal },
  toast: {
    marginTop: spacing.md,
    backgroundColor: '#E1F4ED',
    padding: 14,
    borderRadius: radius.sm,
    flexDirection: 'row',
    gap: 8,
  },
  toastText: { color: colors.plum, flex: 1, fontWeight: '600' },
  milestone: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    padding: spacing.lg,
    backgroundColor: colors.peach,
  },
  milestoneTitle: {
    color: colors.plum,
    fontWeight: '800',
    fontSize: 19,
    marginVertical: 6,
  },
  retry: {
    backgroundColor: colors.raspberry,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  retryText: { color: 'white', fontWeight: '800' },
});
