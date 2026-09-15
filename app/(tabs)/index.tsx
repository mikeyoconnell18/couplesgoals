import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Bell,
  Check,
  ChevronRight,
  MessageCircle,
  Plus,
  TrendingUp,
} from 'lucide-react-native';
import { router } from 'expo-router';
import {
  ActionRow,
  ActivityCard,
  AppScreen,
  Avatar,
  Banner,
  CurrencyField,
  FormModal,
  IconButton,
  NotificationBadge,
  PartnerBadge,
  PrimaryButton,
  ProgressBar,
  SectionHeader,
  TextField,
} from '@/components/ui';
import { calculateMomentum } from '@/domain/momentum';
import { useAuth } from '@/features/auth/auth-context';
import { logCheckIn } from '@/features/check-ins/check-in-service';
import {
  postCoupleNote,
  setReaction,
} from '@/features/connected/connected-service';
import { useCoupleData } from '@/features/data/couple-data-context';
import { useDemo } from '@/features/demo/demo-context';
import { colors, radius, spacing, type } from '@/theme/tokens';
const REACTIONS = ['❤️', '🔥', '🎉', '😂', '🙌'];
const REACTION_KINDS = [
  'heart',
  'fire',
  'celebrate',
  'laugh',
  'support',
] as const;
export default function Dashboard() {
  const { isDemo } = useAuth();
  return isDemo ? <DemoDashboard /> : <ConnectedDashboard />;
}
function Header({
  names,
  mode,
  unread,
}: {
  names: string[];
  mode: string;
  unread: number;
}) {
  return (
    <View style={s.header}>
      <View style={s.avatarPair}>
        {names.slice(0, 2).map((name, index) => (
          <View key={name} style={index ? s.overlap : undefined}>
            <Avatar name={name} tone={index ? 'raspberry' : 'teal'} />
          </View>
        ))}
      </View>
      <View style={s.headerCopy}>
        <Text numberOfLines={1} style={s.greeting}>
          {names.join(' + ') || 'Your team'}
        </Text>
        <Text style={s.date}>
          {new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          }).format(new Date())}{' '}
          · {mode}
        </Text>
      </View>
      <View>
        <IconButton
          label="Open notifications"
          onPress={() => router.push('/notifications')}
        >
          <Bell color={colors.ink} size={21} />
        </IconButton>
        <NotificationBadge count={unread} />
      </View>
    </View>
  );
}
function Momentum({ value, names }: { value: number; names: string[] }) {
  return (
    <View style={s.momentum}>
      <View style={s.score}>
        <Text style={s.scoreValue}>{value}</Text>
        <Text style={s.scoreUnit}>/ 100</Text>
      </View>
      <View style={s.momentumCopy}>
        <View style={s.trend}>
          <TrendingUp color={colors.success} size={16} />
          <Text style={s.trendText}>Up 6 this week</Text>
        </View>
        <Text style={s.cardTitle}>You are showing up together.</Text>
        <Text style={s.support}>
          You both completed planned actions yesterday.{' '}
          {names[0] || 'Partner one'} and {names[1] || 'partner two'} each moved
          the shared score.
        </Text>
      </View>
    </View>
  );
}
function DemoDashboard() {
  const {
    actions,
    momentum,
    activities,
    unread,
    lastLogged,
    logAction,
    undo,
    postNote,
    react,
  } = useDemo();
  const [selected, setSelected] = useState<string>();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const savings = actions.find((a) => a.id === 'savings');
  return (
    <AppScreen
      header={
        <Header names={['Taylor', 'Michael']} mode="Demo" unread={unread} />
      }
    >
      <Text style={s.dashboardTitle}>Good morning, you two.</Text>
      <Momentum value={momentum} names={['Taylor', 'Michael']} />
      {lastLogged ? (
        <Banner>
          Saved on this device only.{' '}
          <Text onPress={undo} style={s.link}>
            Undo
          </Text>
        </Banner>
      ) : null}
      <SectionHeader title="Today" action="3 planned" />
      <View style={s.actionGroup}>
        {actions
          .filter((action) => action.participation !== 'parallel')
          .map((action) => (
            <ActionRow
              key={action.id}
              title={action.title}
              detail={action.detail}
              assignee={action.assignee}
            >
              {action.metric === 'currency' ? (
                <PrimaryButton
                  label="Add"
                  onPress={() => setSelected(action.id)}
                />
              ) : (
                <IconButton
                  label={`Complete ${action.title}`}
                  onPress={() => logAction(action.id)}
                >
                  {action.value >= action.target ? (
                    <Check color={colors.surface} />
                  ) : (
                    <Plus color={colors.primary} />
                  )}
                </IconButton>
              )}
            </ActionRow>
          ))}
      </View>
      <SectionHeader title="Today, side by side" action="Support, not scores" />
      <View style={s.partnerGrid}>
        <PartnerNow
          name="Michael"
          detail="Spanish · 2 of 3"
          recent="Wrote and practiced yesterday"
          onComplete={() => logAction('workouts', 1, 'Michael')}
        />
        <PartnerNow
          name="Taylor"
          tone="raspberry"
          detail="Healthy lunch · done"
          recent="Finished her workout today"
          onComplete={() => logAction('workouts', 1, 'Taylor')}
        />
      </View>
      <View style={s.togetherRow}>
        <PartnerBadge name="Together" />
        <View style={s.obligationCopy}>
          <Text style={s.cardTitle}>Trip-planning session</Text>
          <Text style={s.support}>
            Either of you can log this one shared completion.
          </Text>
        </View>
      </View>
      <SectionHeader title="Recent wins" action="This week" />
      <View style={s.partnerGrid}>
        <WinCard name="Michael" text="Practiced Spanish 2 days" />
        <WinCard
          name="Taylor"
          tone="raspberry"
          text="Prepped lunch and worked out"
        />
      </View>
      <SectionHeader title="Shared focus" />
      <View style={s.focus}>
        <View style={s.focusTop}>
          <View>
            <Text style={s.cardTitle}>Mexico, here we come</Text>
            <Text style={s.support}>14 days to go · $3,000 target</Text>
          </View>
          <Text style={s.focusEmoji}>🇲🇽</Text>
        </View>
        <ProgressBar
          value={((savings?.value ?? 0) / (savings?.target ?? 1)) * 100}
        />
        <Text style={s.next}>Next milestone: Book the hotel</Text>
      </View>
      <Showdown />
      <SectionHeader title="One make-it-up" />
      <View style={s.obligation}>
        <View style={s.obligationCopy}>
          <Text style={s.cardTitle}>Michael owes Taylor dinner</Text>
          <Text style={s.support}>Workout target · settle it your way</Text>
        </View>
        <SecondaryCompact label="Mark fulfilled" />
      </View>
      <NoteComposer
        value={note}
        setValue={setNote}
        onPost={() => {
          if (note.trim()) {
            postNote(note);
            setNote('');
          }
        }}
      />
      <SectionHeader title="Couple activity" action="See all" />
      {activities.map((item) => (
        <ActivityCard
          key={item.id}
          title={`${item.author} · ${item.time}`}
          body={item.title}
          footer={
            <View>
              <Text style={s.activityBody}>{item.body}</Text>
              {item.comment ? (
                <Text style={s.comment}>{item.comment}</Text>
              ) : null}
              <View style={s.reactions}>
                {REACTIONS.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => react(item.id, r)}
                    style={s.reaction}
                  >
                    <Text>{r}</Text>
                  </Pressable>
                ))}
                {item.reaction ? (
                  <Text style={s.reactionCount}>{item.reaction}</Text>
                ) : null}
              </View>
            </View>
          }
        />
      ))}
      <FormModal
        visible={Boolean(selected)}
        title="Add to savings"
        onClose={() => setSelected(undefined)}
      >
        <CurrencyField value={amount} onChangeText={setAmount} />
        <PrimaryButton
          label="Save contribution"
          disabled={!amount || Number(amount) <= 0}
          onPress={() => {
            if (selected) logAction(selected, Number(amount));
            setSelected(undefined);
            setAmount('');
          }}
        />
      </FormModal>
    </AppScreen>
  );
}
function ConnectedDashboard() {
  const { session } = useAuth();
  const {
    couple,
    members,
    goals,
    actions,
    checkIns,
    obligations,
    events,
    reactions,
    comments,
    notifications,
    loading,
    error,
    refresh,
  } = useCoupleData();
  const [note, setNote] = useState('');
  const [selected, setSelected] = useState<string>();
  const [amount, setAmount] = useState('');
  const names = members.map((m) => m.profiles?.display_name ?? 'Partner');
  const inputs = useMemo(
    () =>
      actions.flatMap((a) => {
        const base = {
          id: a.id,
          target: Number(a.target_value),
          contributesToMomentum: true,
          participationMode: a.participation_mode,
        };
        if (a.participation_mode === 'parallel')
          return members.map((member) => ({
            ...base,
            participantUserId: member.user_id,
            progress: checkIns
              .filter(
                (c) => c.action_id === a.id && c.user_id === member.user_id,
              )
              .reduce((n, c) => n + Number(c.value), 0),
          }));
        return [
          {
            ...base,
            progress: checkIns
              .filter((c) => c.action_id === a.id)
              .reduce((n, c) => n + Number(c.value), 0),
          },
        ];
      }),
    [actions, checkIns, members],
  );
  if (loading)
    return (
      <AppScreen>
        <Text style={s.dashboardTitle}>
          Bringing your shared space up to date…
        </Text>
      </AppScreen>
    );
  if (error)
    return (
      <AppScreen title="We couldn't refresh">
        <Banner tone="error">{error}</Banner>
        <PrimaryButton label="Try again" onPress={() => void refresh()} />
      </AppScreen>
    );
  async function log(id: string, value: number) {
    if (!session || !couple) return;
    const action = actions.find((a) => a.id === id);
    if (!action) return;
    const date = new Intl.DateTimeFormat('en-CA', {
      timeZone: couple.timezone,
    }).format(new Date());
    await logCheckIn({
      coupleId: couple.id,
      goalId: action.goal_id,
      actionId: id,
      userId: session.user.id,
      localDate: date,
      value,
      actorName: names.find(
        (_name, index) => members[index]?.user_id === session.user.id,
      ),
      actionTitle: action.title,
      participationMode: action.participation_mode,
    });
    await refresh();
  }
  async function sendNote() {
    if (!session || !couple || !note.trim()) return;
    await postCoupleNote({
      coupleId: couple.id,
      userId: session.user.id,
      body: note,
      kind: 'encouragement',
    });
    setNote('');
    await refresh();
  }
  return (
    <AppScreen
      header={
        <Header
          names={names}
          mode="Connected"
          unread={notifications.filter((n) => !n.read_at).length}
        />
      }
    >
      <Text style={s.dashboardTitle}>Good morning, you two.</Text>
      <Momentum value={calculateMomentum(inputs)} names={names} />
      <SectionHeader title="Today" action={`${actions.length} planned`} />
      <View style={s.actionGroup}>
        {actions.map((action) => {
          const progress = checkIns
            .filter((c) => c.action_id === action.id)
            .reduce((n, c) => n + Number(c.value), 0);
          return (
            <ActionRow
              key={action.id}
              title={action.title}
              detail={`${progress} of ${action.target_value} · ${action.cadence_type}`}
              assignee={
                members.find((m) => m.user_id === action.assigned_user_id)
                  ?.profiles?.display_name ?? 'Both'
              }
            >
              {action.metric_type === 'currency' ? (
                <PrimaryButton
                  label="Add"
                  onPress={() => setSelected(action.id)}
                />
              ) : (
                <IconButton
                  label={`Complete ${action.title}`}
                  onPress={() => void log(action.id, 1)}
                >
                  <Plus color={colors.primary} />
                </IconButton>
              )}
            </ActionRow>
          );
        })}
      </View>
      <SectionHeader title="Today, side by side" action="Active today" />
      <View style={s.partnerGrid}>
        {members.slice(0, 2).map((member, index) => {
          const personName = member.profiles?.display_name ?? 'Partner';
          const current = actions.find(
            (action) =>
              action.assigned_user_id === member.user_id ||
              action.participation_mode === 'parallel',
          );
          const recent = checkIns.filter(
            (item) => item.user_id === member.user_id,
          ).length;
          return (
            <PartnerNow
              key={member.user_id}
              name={personName}
              tone={index ? 'raspberry' : 'teal'}
              detail={current?.title ?? 'Open for encouragement'}
              recent={
                recent
                  ? `Last check-in today · ${recent} this period`
                  : 'No check-in yet — a gentle nudge may help'
              }
              onComplete={() => current && void log(current.id, 1)}
            />
          );
        })}
      </View>
      <View style={s.togetherRow}>
        <PartnerBadge name={names.join(' + ') || 'Together'} />
        <View style={s.obligationCopy}>
          <Text style={s.cardTitle}>
            {actions.find((action) => action.participation_mode === 'joint')
              ?.title ?? 'Your shared actions'}
          </Text>
          <Text style={s.support}>
            One completion belongs to you both; either partner can log it.
          </Text>
        </View>
      </View>
      <SectionHeader title="Recent wins" action="This week" />
      <View style={s.partnerGrid}>
        {members.slice(0, 2).map((member, index) => (
          <WinCard
            key={member.user_id}
            name={member.profiles?.display_name ?? 'Partner'}
            tone={index ? 'raspberry' : 'teal'}
            text={`${checkIns.filter((item) => item.user_id === member.user_id).length} personal contributions`}
          />
        ))}
      </View>
      <SectionHeader title="Shared focus" />
      {goals[0] ? (
        <View style={s.focus}>
          <Text style={s.cardTitle}>{goals[0].title}</Text>
          <Text style={s.support}>
            {goals[0].description || 'Your primary shared goal'}
          </Text>
          <ProgressBar value={calculateMomentum(inputs)} />
        </View>
      ) : null}
      <Showdown />
      <SectionHeader title="Make-it-ups" />
      <View style={s.obligation}>
        <Text style={s.cardTitle}>
          {obligations.length
            ? `${obligations.length} open between you`
            : 'All squared up'}
        </Text>
      </View>
      <NoteComposer
        value={note}
        setValue={setNote}
        onPost={() => void sendNote()}
      />
      <SectionHeader title="Couple activity" />
      {events.map((event) => (
        <ActivityCard
          key={event.id}
          onPress={() => router.push(`/activity/${event.id}`)}
          title={`${names[members.findIndex((m) => m.user_id === event.actor_user_id)] || 'Partner'} · ${relative(event.occurred_at)}`}
          body={event.summary}
          footer={
            <View>
              {comments
                .filter((c) => c.activity_event_id === event.id)
                .slice(-1)
                .map((c) => (
                  <Text key={c.id} style={s.comment}>
                    {c.body}
                  </Text>
                ))}
              <View style={s.reactions}>
                {REACTIONS.map((emoji, index) => (
                  <Pressable
                    key={emoji}
                    style={s.reaction}
                    onPress={() =>
                      session &&
                      couple &&
                      void setReaction({
                        coupleId: couple.id,
                        eventId: event.id,
                        userId: session.user.id,
                        kind:
                          reactions.find(
                            (reaction) =>
                              reaction.activity_event_id === event.id &&
                              reaction.user_id === session.user.id,
                          )?.kind === REACTION_KINDS[index]
                            ? null
                            : REACTION_KINDS[index],
                      }).then(refresh)
                    }
                  >
                    <Text>{emoji}</Text>
                  </Pressable>
                ))}
                <Text style={s.reactionCount}>
                  {reactions.filter((r) => r.activity_event_id === event.id)
                    .length || ''}
                </Text>
              </View>
            </View>
          }
        />
      ))}
      <FormModal
        visible={Boolean(selected)}
        title="Add progress"
        onClose={() => setSelected(undefined)}
      >
        <CurrencyField value={amount} onChangeText={setAmount} />
        <PrimaryButton
          label="Save contribution"
          disabled={!amount || Number(amount) <= 0}
          onPress={() => {
            if (selected) void log(selected, Number(amount));
            setSelected(undefined);
            setAmount('');
          }}
        />
      </FormModal>
    </AppScreen>
  );
}
function NoteComposer({
  value,
  setValue,
  onPost,
}: {
  value: string;
  setValue: (v: string) => void;
  onPost: () => void;
}) {
  return (
    <View style={s.composer}>
      <MessageCircle color={colors.raspberry} />
      <View style={s.composerCopy}>
        <Text style={s.cardTitle}>Send some encouragement</Text>
        <TextField
          label="Leave a note or playful nudge"
          value={value}
          onChangeText={setValue}
          maxLength={500}
          placeholder="You've got this — we're close!"
        />
        <PrimaryButton
          label="Share with my partner"
          disabled={!value.trim()}
          onPress={onPost}
        />
      </View>
    </View>
  );
}
function Showdown() {
  return (
    <>
      <SectionHeader title="Weekly Showdown" />
      <View style={s.showdown}>
        <View style={s.showdownRow}>
          <PartnerBadge name="Taylor" />
          <Text style={s.showdownScore}>3</Text>
        </View>
        <ProgressBar value={75} color={colors.raspberry} />
        <View style={s.showdownRow}>
          <PartnerBadge name="Michael" tone="raspberry" />
          <Text style={s.showdownScore}>3</Text>
        </View>
        <ProgressBar value={75} />
        <Text style={s.support}>
          Neck and neck · winner chooses Saturday's date
        </Text>
      </View>
    </>
  );
}
function PartnerNow({
  name,
  detail,
  recent,
  tone = 'teal',
  onComplete,
}: {
  name: string;
  detail: string;
  recent: string;
  tone?: 'teal' | 'raspberry';
  onComplete: () => void;
}) {
  return (
    <View style={s.partnerCard}>
      <PartnerBadge name={name} tone={tone} />
      <Text style={s.partnerWork}>{detail}</Text>
      <Text style={s.support}>{recent}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onComplete}
        style={s.encourage}
      >
        <Text style={s.encourageText}>🙌 Encourage</Text>
      </Pressable>
    </View>
  );
}
function WinCard({
  name,
  text,
  tone = 'teal',
}: {
  name: string;
  text: string;
  tone?: 'teal' | 'raspberry';
}) {
  return (
    <View style={s.winCard}>
      <PartnerBadge name={name} tone={tone} />
      <Text style={s.partnerWork}>{text}</Text>
    </View>
  );
}
function SecondaryCompact({ label }: { label: string }) {
  return (
    <Pressable style={s.compact}>
      <Text style={s.compactText}>{label}</Text>
      <ChevronRight color={colors.primary} size={16} />
    </Pressable>
  );
}
function relative(value: string) {
  const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  return minutes < 60 ? `${Math.max(1, minutes)} min` : 'Earlier';
}
const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  avatarPair: { flexDirection: 'row' },
  overlap: { marginLeft: -10 },
  headerCopy: { flex: 1 },
  greeting: { ...type.card, color: colors.ink },
  date: { ...type.support, color: colors.textSecondary },
  dashboardTitle: {
    ...type.dashboard,
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  momentum: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  score: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 6,
    borderColor: colors.primary,
  },
  scoreValue: { fontSize: 30, fontWeight: '800', color: colors.ink },
  scoreUnit: {
    ...type.support,
    color: colors.textSecondary,
    alignSelf: 'flex-end',
    marginBottom: 22,
  },
  momentumCopy: { flex: 1, justifyContent: 'center' },
  trend: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  trendText: { ...type.label, color: colors.success },
  cardTitle: { ...type.card, color: colors.ink },
  support: {
    ...type.support,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
  link: { color: colors.primary, fontWeight: '700' },
  actionGroup: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  focus: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  focusTop: { flexDirection: 'row', justifyContent: 'space-between' },
  focusEmoji: { fontSize: 30 },
  next: { ...type.label, color: colors.primary, marginTop: spacing.sm },
  showdown: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.elevated,
  },
  showdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  showdownScore: { ...type.card, color: colors.ink },
  obligation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  obligationCopy: { flex: 1 },
  compact: { minHeight: 44, flexDirection: 'row', alignItems: 'center' },
  compactText: { ...type.label, color: colors.primary },
  composer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.raspberrySoft,
    marginTop: spacing.lg,
  },
  composerCopy: { flex: 1 },
  activityBody: {
    ...type.support,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  comment: {
    ...type.support,
    color: colors.ink,
    backgroundColor: colors.elevated,
    padding: spacing.sm,
    borderRadius: radius.md,
    marginTop: spacing.sm,
  },
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  reaction: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: colors.elevated,
  },
  reactionCount: { ...type.label, color: colors.textSecondary },
  partnerGrid: { flexDirection: 'row', gap: spacing.xs },
  partnerCard: {
    flex: 1,
    minWidth: 0,
    padding: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  partnerWork: { ...type.label, color: colors.ink, marginTop: spacing.sm },
  encourage: { minHeight: 44, justifyContent: 'center', marginTop: spacing.xs },
  encourageText: { ...type.label, color: colors.raspberry },
  togetherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    marginTop: spacing.xs,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
  },
  winCard: {
    flex: 1,
    minWidth: 0,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.elevated,
  },
});
