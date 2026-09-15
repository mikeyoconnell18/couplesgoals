import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppScreen, EmptyState, SectionHeader } from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import {
  markAllNotificationsRead,
  markNotificationRead,
} from '@/features/connected/connected-service';
import { useCoupleData } from '@/features/data/couple-data-context';
import { useDemo } from '@/features/demo/demo-context';
import { colors, radius, spacing, type } from '@/theme/tokens';
const demo = [
  {
    id: 'n1',
    title: 'Michael logged a workout',
    body: 'Your shared momentum moved up.',
    read: false,
  },
  {
    id: 'n2',
    title: 'New comment',
    body: 'Taylor replied to your Mexico savings update.',
    read: false,
  },
  {
    id: 'n3',
    title: 'A make-it-up is ready',
    body: 'Cook dinner is now in Owed.',
    read: false,
  },
];
export default function Notifications() {
  const { isDemo, session } = useAuth();
  const { notifications, refresh } = useCoupleData();
  const { markNotificationsRead, unread } = useDemo();
  const items = isDemo ? demo : notifications;
  async function all() {
    if (isDemo) markNotificationsRead();
    else if (session) {
      await markAllNotificationsRead(session.user.id);
      await refresh();
    }
  }
  async function open(item: (typeof items)[number]) {
    if (!isDemo) {
      await markNotificationRead(item.id);
      await refresh();
      const entityType = 'entity_type' in item ? item.entity_type : null;
      const entityId = 'entity_id' in item ? item.entity_id : null;
      const target =
        entityType === 'goal' && entityId
          ? `/goals/${entityId}`
          : entityType === 'obligation'
            ? '/(tabs)/owed'
            : entityType === 'activity' && entityId
              ? `/activity/${entityId}`
              : '/(tabs)';
      router.replace(target as never);
    } else markNotificationsRead();
  }
  return (
    <AppScreen eyebrow="Your shared space" title="Notifications">
      <SectionHeader
        title="Recent"
        action="Mark all read"
        onAction={() => void all()}
      />
      {items.length ? (
        items.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => void open(item)}
            style={[
              s.item,
              (isDemo ? unread > 0 : !('read_at' in item) || !item.read_at) &&
                s.unread,
            ]}
          >
            <View style={s.dot} />
            <View style={s.copy}>
              <Text style={s.title}>{item.title}</Text>
              <Text style={s.body}>{item.body}</Text>
            </View>
          </Pressable>
        ))
      ) : (
        <EmptyState
          title="You're caught up"
          body="Partner updates and shared wins will appear here."
        />
      )}
    </AppScreen>
  );
}
const s = StyleSheet.create({
  item: {
    minHeight: 76,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  unread: { backgroundColor: colors.primarySoft },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.raspberry,
    marginTop: 6,
  },
  copy: { flex: 1 },
  title: { ...type.card, color: colors.ink },
  body: {
    ...type.support,
    color: colors.textSecondary,
    marginTop: spacing.xxs,
  },
});
