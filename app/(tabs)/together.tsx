import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import {
  ActivityCard,
  AppScreen,
  EmptyState,
  PartnerBadge,
  ProgressBar,
  SectionHeader,
} from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import { setReaction } from '@/features/connected/connected-service';
import { useCoupleData } from '@/features/data/couple-data-context';
import { useDemo } from '@/features/demo/demo-context';
import { colors, radius, spacing, type } from '@/theme/tokens';
const reactions = [
  ['❤️', 'heart'],
  ['🔥', 'fire'],
  ['🎉', 'celebrate'],
  ['🙌', 'support'],
] as const;
export default function Together() {
  const { isDemo } = useAuth();
  return isDemo ? <DemoTogether /> : <ConnectedTogether />;
}
function WorkingNow({
  name,
  title,
  detail,
  tone = 'teal',
}: {
  name: string;
  title: string;
  detail: string;
  tone?: 'teal' | 'raspberry';
}) {
  return (
    <View style={s.now}>
      <PartnerBadge name={name} tone={tone} />
      <Text numberOfLines={2} style={s.nowTitle}>
        {title}
      </Text>
      <Text style={s.support}>{detail}</Text>
    </View>
  );
}
function DemoTogether() {
  const { actions, activities, react } = useDemo();
  return (
    <AppScreen eyebrow="Shared accountability" title="Together">
      <SectionHeader title="Working on now" />
      <View style={s.grid}>
        <WorkingNow
          name="Michael"
          title={actions[2]?.title ?? 'Choosing a next action'}
          detail={actions[2]?.detail ?? ''}
        />
        <WorkingNow
          name="Taylor"
          tone="raspberry"
          title={actions[3]?.title ?? 'Choosing a next action'}
          detail={actions[3]?.detail ?? ''}
        />
      </View>
      <Recap
        completed={actions.filter((a) => a.value >= a.target).length}
        total={actions.length}
      />
      <SectionHeader title="Shared activity" action="This week" />
      {activities.map((item) => (
        <ActivityCard
          key={item.id}
          accentColor={
            item.author === 'Together'
              ? colors.coral
              : item.author === 'Taylor'
                ? colors.raspberry
                : colors.primary
          }
          title={`${item.author} · ${item.time}`}
          body={item.title}
          footer={
            <View>
              <Text style={s.support}>{item.body}</Text>
              <View style={s.reactions}>
                {reactions.map(([emoji]) => (
                  <Pressable
                    key={emoji}
                    onPress={() => react(item.id, emoji)}
                    style={s.reaction}
                  >
                    <Text>{emoji}</Text>
                  </Pressable>
                ))}
                {item.comment ? (
                  <View style={s.comment}>
                    <MessageCircle size={14} color={colors.primary} />
                    <Text style={s.commentText}>{item.comment}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          }
        />
      ))}
    </AppScreen>
  );
}
function Recap({ completed, total }: { completed: number; total: number }) {
  const value = total ? (completed / total) * 100 : 0;
  return (
    <View style={s.recap}>
      <View>
        <Text style={s.recapTitle}>This week</Text>
        <Text style={s.support}>
          {completed} of {total} commitments complete
        </Text>
      </View>
      <Text style={s.percent}>{Math.round(value)}%</Text>
      <View style={s.full}>
        <ProgressBar value={value} />
      </View>
    </View>
  );
}
function ConnectedTogether() {
  const { session } = useAuth();
  const data = useCoupleData();
  const name = (id: string | null) =>
    data.members.find((m) => m.user_id === id)?.profiles?.display_name ??
    'Partner';
  const orderedMembers = [...data.members].sort((a, b) =>
    a.user_id === session?.user.id
      ? -1
      : b.user_id === session?.user.id
        ? 1
        : a.user_id.localeCompare(b.user_id),
  );
  const current = orderedMembers.slice(0, 2).map((member) => ({
    member,
    action: data.actions.find(
      (a) =>
        a.assigned_user_id === member.user_id ||
        a.participation_mode === 'parallel',
    ),
  }));
  const complete = data.actions.filter(
    (a) =>
      data.checkIns
        .filter((c) => c.action_id === a.id)
        .reduce((n, c) => n + Number(c.value), 0) >= Number(a.target_value),
  ).length;
  const showdown = data.events.find(
    (e) =>
      e.event_type.includes('competition') || e.event_type.includes('side_bet'),
  );
  return (
    <AppScreen eyebrow="Shared accountability" title="Together">
      <SectionHeader title="Working on now" />
      <View style={s.grid}>
        {current.map(({ member, action }, i) => (
          <WorkingNow
            key={member.user_id}
            name={name(member.user_id)}
            tone={i ? 'raspberry' : 'teal'}
            title={action?.title ?? 'Ready for the next action'}
            detail={
              action
                ? `${data.checkIns.filter((c) => c.action_id === action.id && c.user_id === member.user_id).length} check-ins this period`
                : 'No action assigned'
            }
          />
        ))}
      </View>
      <Recap completed={complete} total={data.actions.length} />
      {showdown ? (
        <View style={s.showdown}>
          <Text style={s.showdownLabel}>ACTIVE SHOWDOWN</Text>
          <Text style={s.nowTitle}>{showdown.summary}</Text>
        </View>
      ) : null}
      <SectionHeader title="Shared activity" action="Newest first" />
      {data.events.length ? (
        data.events.map((event) => (
          <ActivityCard
            key={event.id}
            accentColor={
              event.actor_user_id === session?.user.id
                ? colors.primary
                : colors.raspberry
            }
            onPress={() => router.push(`/activity/${event.id}`)}
            title={`${name(event.actor_user_id)} · ${relative(event.occurred_at)}`}
            body={event.summary}
            footer={
              <View style={s.reactions}>
                {reactions.map(([emoji, kind]) => (
                  <Pressable
                    accessibilityLabel={`React ${emoji}`}
                    key={kind}
                    style={s.reaction}
                    onPress={() =>
                      session &&
                      data.couple &&
                      void setReaction({
                        coupleId: data.couple.id,
                        eventId: event.id,
                        userId: session.user.id,
                        kind,
                      }).then(data.refresh)
                    }
                  >
                    <Text>{emoji}</Text>
                  </Pressable>
                ))}
                <View style={s.comment}>
                  <MessageCircle size={14} color={colors.primary} />
                  <Text style={s.commentText}>
                    {
                      data.comments.filter(
                        (c) => c.activity_event_id === event.id,
                      ).length
                    }
                  </Text>
                </View>
              </View>
            }
          />
        ))
      ) : (
        <EmptyState
          title="Your shared history starts here"
          body="Check in to an action and that meaningful progress will appear for both of you."
        />
      )}
    </AppScreen>
  );
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
  grid: { flexDirection: 'row', gap: spacing.sm },
  now: {
    flex: 1,
    minHeight: 116,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nowTitle: { ...type.card, color: colors.ink, marginTop: spacing.sm },
  support: {
    ...type.support,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  recap: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recapTitle: { ...type.card, color: colors.ink },
  percent: { ...type.section, color: colors.primary },
  full: { width: '100%' },
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  reaction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.elevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  commentText: { ...type.support, color: colors.primary },
  showdown: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.raspberrySoft,
  },
  showdownLabel: { ...type.label, fontSize: 10, color: colors.raspberry },
});
