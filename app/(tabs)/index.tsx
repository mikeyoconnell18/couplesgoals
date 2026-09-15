import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, Check, ChevronRight, Heart, Plus } from 'lucide-react-native';
import { router } from 'expo-router';
import {
  AppScreen,
  Avatar,
  Banner,
  FormModal,
  IconButton,
  NotificationBadge,
  NumberField,
  PrimaryButton,
  SectionHeader,
} from '@/components/ui';
import { WeekProgressChart } from '@/components/week-progress-chart';
import {
  buildProgressSeries,
  paceForDay,
  weekDates,
  type MetricType,
} from '@/domain/progress';
import { useAuth } from '@/features/auth/auth-context';
import { logCheckIn } from '@/features/check-ins/check-in-service';
import { setReaction } from '@/features/connected/connected-service';
import { useCoupleData } from '@/features/data/couple-data-context';
import { useDemo } from '@/features/demo/demo-context';
import { colors, radius, spacing, type } from '@/theme/tokens';

export default function Today() {
  const { isDemo } = useAuth();
  return isDemo ? <DemoToday /> : <ConnectedToday />;
}
function Header({ names, unread }: { names: string[]; unread: number }) {
  return (
    <View style={s.header}>
      <View style={s.avatars}>
        {names.slice(0, 2).map((name, index) => (
          <View key={`${name}-${index}`} style={index ? s.overlap : undefined}>
            <Avatar name={name} tone={index ? 'raspberry' : 'teal'} />
          </View>
        ))}
      </View>
      <View style={s.headerCopy}>
        <Text numberOfLines={1} style={s.names}>
          {names.join(' + ') || 'Your team'}
        </Text>
        <Text style={s.date}>
          {new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          }).format(new Date())}
        </Text>
      </View>
      <View>
        <IconButton
          label="Open notifications"
          onPress={() => router.push('/notifications')}
        >
          <Bell color={colors.ink} size={20} />
        </IconButton>
        <NotificationBadge count={unread} />
      </View>
    </View>
  );
}
function ActionItem({
  title,
  detail,
  owner,
  complete,
  onLog,
}: {
  title: string;
  detail: string;
  owner: string;
  complete: boolean;
  onLog: () => void;
}) {
  return (
    <View style={[s.action, complete && s.complete]}>
      <View style={s.actionCopy}>
        <Text numberOfLines={1} style={s.actionTitle}>
          {title}
        </Text>
        <Text numberOfLines={1} style={s.meta}>
          {owner} · {detail}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Log ${title}`}
        onPress={onLog}
        style={[s.logButton, complete && s.logDone]}
      >
        {complete ? (
          <Check size={19} color={colors.surface} />
        ) : (
          <Plus size={20} color={colors.primary} />
        )}
      </Pressable>
    </View>
  );
}
function Attention({ text, route }: { text: string; route: string }) {
  return (
    <Pressable onPress={() => router.push(route as never)} style={s.attention}>
      <Text style={s.attentionLabel}>NEEDS ATTENTION</Text>
      <Text numberOfLines={2} style={s.attentionText}>
        {text}
      </Text>
      <ChevronRight color={colors.coral} size={20} />
    </Pressable>
  );
}
function Activity({
  author,
  summary,
  onReact,
}: {
  author: string;
  summary: string;
  onReact: () => void;
}) {
  return (
    <View style={s.activity}>
      <Avatar name={author} tone="raspberry" size={32} />
      <View style={s.activityCopy}>
        <Text style={s.activityAuthor}>{author}</Text>
        <Text numberOfLines={2} style={s.meta}>
          {summary}
        </Text>
      </View>
      <Pressable
        accessibilityLabel="Send a heart"
        onPress={onReact}
        style={s.react}
      >
        <Heart color={colors.raspberry} size={19} />
      </Pressable>
    </View>
  );
}
function chartSeries(values: number[][], names: string[]) {
  return [
    {
      key: 'me',
      label: names[0] || 'Me',
      color: colors.primary,
      values: values[0] || [],
    },
    {
      key: 'partner',
      label: names[1] || 'Partner',
      color: colors.raspberry,
      values: values[1] || [],
    },
    {
      key: 'joint',
      label: 'Together',
      color: colors.coral,
      values: values[2] || [],
      dashed: true,
    },
  ];
}
function DemoToday() {
  const { actions, activities, unread, lastLogged, logAction, undo, react } =
    useDemo();
  const [selected, setSelected] = useState<string>();
  const [value, setValue] = useState('');
  const names = ['Michael', 'Taylor'];
  const current = actions.map((a) =>
    Math.round(Math.min(a.value / a.target, 1) * 100),
  );
  const ramp = (end: number) =>
    [0.18, 0.3, 0.43, 0.56, 0.7, 0.84, 1].map((n) => Math.round(end * n));
  const mine = Math.round((current[2] + current[3]) / 2),
    partner = Math.round((current[0] + current[3]) / 2),
    joint = Math.round((current[1] + current[4]) / 2);
  const latest = activities[0];
  const todayActions = actions.slice(0, 3);
  return (
    <AppScreen header={<Header names={names} unread={unread} />}>
      <WeekProgressChart
        series={chartSeries([ramp(mine), ramp(partner), ramp(joint)], names)}
        pace={Array.from({ length: 7 }, (_, i) => paceForDay(i))}
        summary={`Together: ${joint}% · ${joint >= paceForDay(new Date().getDay() ? new Date().getDay() - 1 : 6) ? 'On pace' : 'Behind pace'}`}
      />
      {lastLogged ? (
        <Banner>
          Progress saved on this device.{' '}
          <Text onPress={undo} style={s.link}>
            Undo
          </Text>
        </Banner>
      ) : null}
      <SectionHeader
        title="Today’s actions"
        action={`${todayActions.length} due`}
      />
      <View style={s.actionGroup}>
        {todayActions.map((action) => (
          <ActionItem
            key={action.id}
            title={action.title}
            owner={action.assignee}
            detail={action.detail}
            complete={action.value >= action.target}
            onLog={() =>
              action.metric === 'boolean'
                ? logAction(action.id)
                : setSelected(action.id)
            }
          />
        ))}
      </View>
      <Attention
        text="Mexico goal is a little behind this week. See the next milestone."
        route="/goals/mexico"
      />
      <SectionHeader
        title="Latest from your partner"
        action="See all"
        onAction={() => router.push('/(tabs)/together')}
      />
      {latest ? (
        <Activity
          author={latest.author}
          summary={latest.title}
          onReact={() => react(latest.id, '❤️')}
        />
      ) : null}
      <FormModal
        visible={Boolean(selected)}
        title="Log progress"
        onClose={() => setSelected(undefined)}
      >
        <NumberField
          label="Amount completed"
          value={value}
          onChangeText={setValue}
          unit={actions.find((a) => a.id === selected)?.unit}
        />
        <PrimaryButton
          label="Save progress"
          disabled={!value || Number(value) <= 0}
          onPress={() => {
            if (selected) logAction(selected, Number(value));
            setSelected(undefined);
            setValue('');
          }}
        />
      </FormModal>
    </AppScreen>
  );
}
function ConnectedToday() {
  const { session } = useAuth();
  const data = useCoupleData();
  const [selected, setSelected] = useState<string>();
  const [value, setValue] = useState('');
  const ordered = useMemo(
    () =>
      [...data.members].sort((a, b) =>
        a.user_id === session?.user.id
          ? -1
          : b.user_id === session?.user.id
            ? 1
            : a.user_id.localeCompare(b.user_id),
      ),
    [data.members, session?.user.id],
  );
  const names = ordered.map((m) => m.profiles?.display_name ?? 'Partner');
  const dates = useMemo(() => weekDates(), []);
  const series = useMemo(
    () =>
      buildProgressSeries(
        data.actions.map((a) => ({
          id: a.id,
          metric: metric(a.metric_type),
          target: Number(a.target_value),
          participation: a.participation_mode,
          assignedUserId: a.assigned_user_id,
          participantUserIds: data.members.map((m) => m.user_id),
        })),
        data.checkIns.map((c) => ({
          actionId: c.action_id,
          userId: c.user_id,
          value: Number(c.value),
          localDate: c.effective_local_date,
        })),
        dates,
        ordered.map((m) => m.user_id),
      ),
    [data.actions, data.checkIns, data.members, dates, ordered],
  );
  if (data.loading)
    return (
      <AppScreen>
        <Text style={s.names}>Updating your shared progress…</Text>
      </AppScreen>
    );
  if (data.error)
    return (
      <AppScreen title="We couldn't refresh">
        <Banner tone="error">{data.error}</Banner>
        <PrimaryButton label="Try again" onPress={() => void data.refresh()} />
      </AppScreen>
    );
  const day = Math.min(
    Math.max(dates.indexOf(new Date().toISOString().slice(0, 10)), 0),
    6,
  );
  const joint = series.joint[day] ?? 0;
  const progress = (id: string) =>
    data.checkIns
      .filter((c) => c.action_id === id)
      .reduce((n, c) => n + Number(c.value), 0);
  async function log(id: string, amount: number) {
    const action = data.actions.find((a) => a.id === id);
    if (!session || !data.couple || !action) return;
    await logCheckIn({
      coupleId: data.couple.id,
      goalId: action.goal_id,
      actionId: id,
      userId: session.user.id,
      localDate: new Intl.DateTimeFormat('en-CA', {
        timeZone: data.couple.timezone,
      }).format(new Date()),
      value: amount,
      actorName: names[0],
      actionTitle: action.title,
      participationMode: action.participation_mode,
    });
    await data.refresh();
  }
  const latest = data.events[0];
  const obligation = data.obligations[0];
  const actions = data.actions.slice(0, 3);
  return (
    <AppScreen
      header={
        <Header
          names={names}
          unread={data.notifications.filter((n) => !n.read_at).length}
        />
      }
    >
      <WeekProgressChart
        series={chartSeries(
          [
            series.personal[ordered[0]?.user_id] ?? [],
            series.personal[ordered[1]?.user_id] ?? [],
            series.joint,
          ],
          names,
        )}
        pace={Array.from({ length: 7 }, (_, i) => paceForDay(i))}
        summary={`Together: ${joint}% · ${joint >= paceForDay(day) ? 'On pace' : 'Behind pace'}`}
      />
      <SectionHeader title="Today’s actions" action={`${actions.length} due`} />
      <View style={s.actionGroup}>
        {actions.map((action) => {
          const amount = progress(action.id),
            done = amount >= Number(action.target_value);
          return (
            <ActionItem
              key={action.id}
              title={action.title}
              owner={
                action.participation_mode === 'joint'
                  ? 'Together'
                  : action.participation_mode === 'parallel'
                    ? 'Each separately'
                    : (data.members.find(
                        (m) => m.user_id === action.assigned_user_id,
                      )?.profiles?.display_name ?? 'Me')
              }
              detail={`${amount} of ${action.target_value}`}
              complete={done}
              onLog={() =>
                action.metric_type === 'boolean'
                  ? void log(action.id, 1)
                  : setSelected(action.id)
              }
            />
          );
        })}
      </View>
      <Attention
        text={
          obligation
            ? obligation.title
            : `${data.goals[0]?.title ?? 'A shared goal'} is ${joint >= paceForDay(day) ? 'on pace' : 'falling behind pace'}.`
        }
        route={
          obligation
            ? '/(tabs)/owed'
            : data.goals[0]
              ? `/goals/${data.goals[0].id}`
              : '/(tabs)/goals'
        }
      />
      <SectionHeader
        title="Latest from your partner"
        action="See all"
        onAction={() => router.push('/(tabs)/together')}
      />
      {latest ? (
        <Activity
          author={
            data.members.find((m) => m.user_id === latest.actor_user_id)
              ?.profiles?.display_name ?? 'Partner'
          }
          summary={latest.summary}
          onReact={() =>
            session &&
            data.couple &&
            void setReaction({
              coupleId: data.couple.id,
              eventId: latest.id,
              userId: session.user.id,
              kind: 'heart',
            }).then(data.refresh)
          }
        />
      ) : (
        <Text style={s.meta}>
          Check-ins from your partner will appear here.
        </Text>
      )}
      <FormModal
        visible={Boolean(selected)}
        title="Log progress"
        onClose={() => setSelected(undefined)}
      >
        <NumberField
          label="Amount completed"
          value={value}
          onChangeText={setValue}
          unit={data.actions.find((a) => a.id === selected)?.metric_type}
        />
        <PrimaryButton
          label="Save progress"
          disabled={!value || Number(value) <= 0}
          onPress={() => {
            if (selected) void log(selected, Number(value));
            setSelected(undefined);
            setValue('');
          }}
        />
      </FormModal>
    </AppScreen>
  );
}
function metric(value: string): MetricType {
  return ['boolean', 'count', 'currency', 'duration'].includes(value)
    ? (value as MetricType)
    : 'custom';
}
const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatars: { flexDirection: 'row' },
  overlap: {
    marginLeft: -10,
    borderWidth: 2,
    borderColor: colors.background,
    borderRadius: 22,
  },
  headerCopy: { flex: 1, marginLeft: spacing.sm },
  names: { ...type.card, color: colors.ink },
  date: { ...type.support, color: colors.textSecondary },
  actionGroup: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  action: {
    minHeight: 64,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  complete: { opacity: 0.56 },
  actionCopy: { flex: 1 },
  actionTitle: { ...type.card, color: colors.ink },
  meta: { ...type.support, color: colors.textSecondary },
  logButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  logDone: { backgroundColor: colors.primary },
  attention: {
    marginTop: spacing.md,
    minHeight: 60,
    borderRadius: radius.md,
    backgroundColor: '#FFF4EF',
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  attentionLabel: { ...type.label, color: colors.coral, fontSize: 10 },
  attentionText: { ...type.support, color: colors.ink, flex: 1 },
  activity: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  activityCopy: { flex: 1 },
  activityAuthor: { ...type.label, color: colors.raspberry },
  react: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  link: { color: colors.primary, fontWeight: '700' },
});
