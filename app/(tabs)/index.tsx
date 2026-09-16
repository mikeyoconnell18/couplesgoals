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
  applicablePeriodTarget,
  paceForDay,
  weekDates,
  type MetricType,
} from '@/domain/progress';
import { isActionDue, type Cadence } from '@/domain/recurrence';
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
  progress,
  color,
  onLog,
}: {
  title: string;
  detail: string;
  owner: string;
  complete: boolean;
  progress: number;
  color: string;
  onLog: () => void;
}) {
  return (
    <View style={[s.action, complete && s.complete]}>
      <View style={s.actionCopy}>
        <Text numberOfLines={1} style={s.actionTitle}>
          {title}
        </Text>
        <View style={s.ownerRow}>
          <View style={[s.ownerDot, { backgroundColor: color }]} />
          <Text numberOfLines={1} style={s.meta}>
            {owner} · {detail}
          </Text>
        </View>
        <View style={s.actionTrack}>
          <View
            style={[
              s.actionProgress,
              {
                width: `${Math.min(Math.max(progress, 0), 100)}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>
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
  time,
  onReact,
}: {
  author: string;
  summary: string;
  time: string;
  onReact: () => void;
}) {
  return (
    <View style={s.activity}>
      <Avatar name={author} tone="raspberry" size={32} />
      <View style={s.activityCopy}>
        <Text style={s.activityAuthor}>{author}</Text>
        <Text numberOfLines={2} style={s.meta}>
          {summary} · {time}
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
  const latest = activities.find((item) => item.author === 'Taylor');
  const todayActions = actions.slice(0, 3);
  return (
    <AppScreen header={<Header names={names} unread={unread} />}>
      <WeekProgressChart
        series={chartSeries([ramp(mine), ramp(partner), ramp(joint)], names)}
        pace={Array.from({ length: 7 }, (_, i) => paceForDay(i))}
        currentDay={(new Date().getDay() + 6) % 7}
        summary={`Weekly actions: ${joint}% · ${joint >= paceForDay((new Date().getDay() + 6) % 7) ? 'on pace' : 'behind pace'}`}
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
            progress={(action.value / action.target) * 100}
            color={
              action.participation === 'joint'
                ? colors.coral
                : action.assignee.includes('Taylor')
                  ? colors.raspberry
                  : colors.primary
            }
            onLog={() =>
              action.metric === 'boolean'
                ? logAction(action.id)
                : setSelected(action.id)
            }
          />
        ))}
      </View>
      <Attention
        text="Mexico savings: behind target — review the next milestone."
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
          time={latest.time}
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
  const dates = useMemo(
    () => weekDates(new Date(), data.couple?.timezone ?? 'UTC'),
    [data.couple?.timezone],
  );
  const series = useMemo(
    () =>
      buildProgressSeries(
        data.actions.map((a) => ({
          id: a.id,
          metric: metric(a.metric_type),
          target: applicablePeriodTarget(
            a.cadence_type,
            Number(a.target_value),
            dates,
            a.selected_weekdays ?? [],
          ),
          participation: a.participation_mode,
          assignedUserId: a.assigned_user_id,
          participantUserIds: data.members.map((m) => m.user_id),
          cumulative: a.cadence_type === 'total' || a.cadence_type === 'once',
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
  const today = dateKey(new Date(), data.couple?.timezone ?? 'UTC');
  const day = Math.min(Math.max(dates.indexOf(today), 0), 6);
  const joint = series.joint[day] ?? 0;
  const progress = (id: string) => {
    const action = data.actions.find((item) => item.id === id);
    const periodStart =
      action?.cadence_type === 'daily' || action?.cadence_type === 'weekdays'
        ? today
        : action?.cadence_type === 'weekly'
          ? dates[0]
          : action?.cadence_type === 'monthly'
            ? `${today.slice(0, 7)}-01`
            : action?.start_date;
    return data.checkIns
      .filter(
        (c) =>
          c.action_id === id &&
          (action?.participation_mode !== 'parallel' ||
            c.user_id === session?.user.id) &&
          (!periodStart || c.effective_local_date >= periodStart),
      )
      .reduce((n, c) => n + Number(c.value), 0);
  };
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
  const latest = data.events.find(
    (event) => event.actor_user_id !== session?.user.id,
  );
  const obligation = data.obligations[0];
  const actions = data.actions
    .filter(
      (action) =>
        (action.participation_mode === 'joint' ||
          action.participation_mode === 'parallel' ||
          !action.assigned_user_id ||
          action.assigned_user_id === session?.user.id) &&
        isActionDue(
          {
            cadence: action.cadence_type as Cadence,
            selectedWeekdays: action.selected_weekdays ?? undefined,
            startDate: action.start_date,
            endDate: action.end_date ?? undefined,
          },
          new Date(),
          data.couple?.timezone ?? 'UTC',
        ),
    )
    .slice(0, 3);
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
        currentDay={day}
        summary={`Weekly actions: ${joint}% · ${joint >= paceForDay(day) ? 'on pace' : 'behind pace'}`}
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
              progress={(amount / Number(action.target_value || 1)) * 100}
              color={
                action.participation_mode === 'joint'
                  ? colors.coral
                  : action.assigned_user_id === ordered[1]?.user_id
                    ? colors.raspberry
                    : colors.primary
              }
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
            : `${data.goals[0]?.title ?? 'Shared goal'}: review cumulative target progress.`
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
          time={relative(latest.occurred_at)}
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
function dateKey(date: Date, timeZone: string) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
function relative(value: string) {
  const minutes = Math.max(
    1,
    Math.round((Date.now() - new Date(value).getTime()) / 60000),
  );
  return minutes < 60
    ? `${minutes}m ago`
    : minutes < 1440
      ? `${Math.round(minutes / 60)}h ago`
      : `${Math.round(minutes / 1440)}d ago`;
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
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ownerDot: { width: 7, height: 7, borderRadius: 4 },
  actionTrack: {
    height: 2,
    backgroundColor: colors.border,
    marginTop: 5,
    marginRight: spacing.md,
  },
  actionProgress: { height: 2, borderRadius: 1 },
  actionTitle: { ...type.card, color: colors.ink },
  meta: { ...type.support, color: colors.textSecondary },
  logButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logDone: { backgroundColor: colors.primary },
  attention: {
    marginTop: spacing.md,
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.ink,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  attentionLabel: { ...type.label, color: colors.coral, fontSize: 10 },
  attentionText: { ...type.support, color: colors.surface, flex: 1 },
  activity: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.raspberrySoft,
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
