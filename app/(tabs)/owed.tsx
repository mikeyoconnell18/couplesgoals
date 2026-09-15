import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Placeholder, Screen } from '@/components/screen';
import { useAuth } from '@/features/auth/auth-context';
import { useCoupleData } from '@/features/data/couple-data-context';
import { getSupabaseClient } from '@/lib/supabase';
import { colors, radius, spacing } from '@/theme/tokens';
export default function Owed() {
  const { isDemo } = useAuth();
  const { obligations, members, refresh } = useCoupleData();
  if (isDemo)
    return (
      <Screen eyebrow="Playful stakes" title="All squared up">
        <Placeholder>
          No make-it-ups yet. When a rule triggers, you can schedule, complete,
          forgive, or dismiss it here.
        </Placeholder>
      </Screen>
    );
  const name = (id: string | null) =>
    members.find((m) => m.user_id === id)?.profiles?.display_name ?? 'Partner';
  async function update(
    id: string,
    status: 'completed' | 'forgiven' | 'dismissed',
  ) {
    const client = getSupabaseClient();
    if (!client) return;
    const { error } = await client
      .from('obligations')
      .update({
        status,
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .eq('id', id);
    if (!error) await refresh();
  }
  return (
    <Screen eyebrow="Playful stakes" title="What we owe.">
      {obligations.length ? (
        obligations.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.owed}>
              {name(item.owed_by_user_id)} owes {name(item.owed_to_user_id)}
            </Text>
            <Text style={styles.title}>{item.title}</Text>
            <View style={styles.row}>
              <Pressable
                onPress={() => void update(item.id, 'dismissed')}
                style={styles.link}
              >
                <Text style={styles.linkText}>Dismiss</Text>
              </Pressable>
              <Pressable
                onPress={() => void update(item.id, 'forgiven')}
                style={styles.link}
              >
                <Text style={styles.linkText}>Forgive</Text>
              </Pressable>
              <Pressable
                onPress={() => void update(item.id, 'completed')}
                style={styles.done}
              >
                <Text style={styles.doneText}>Mark fulfilled</Text>
              </Pressable>
            </View>
          </View>
        ))
      ) : (
        <Placeholder>
          You&apos;re all squared up. Any future make-it-ups will appear here
          for both partners.
        </Placeholder>
      )}
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
  owed: {
    color: colors.raspberry,
    fontWeight: '900',
    fontSize: 11,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.ink,
    fontWeight: '800',
    fontSize: 19,
    marginVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    alignItems: 'center',
  },
  link: { padding: 10 },
  linkText: { color: colors.textSecondary, fontWeight: '700' },
  done: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    padding: 12,
  },
  doneText: { color: 'white', fontWeight: '900' },
});
