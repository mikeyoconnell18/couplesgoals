import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/screen';
import { useAuth } from '@/features/auth/auth-context';
import { regenerateInvite } from '@/features/couples/couple-service';
import { useCoupleData } from '@/features/data/couple-data-context';
import { useDemo } from '@/features/demo/demo-context';
import { colors, radius, spacing } from '@/theme/tokens';
export default function Profile() {
  const { isDemo, signOut } = useAuth();
  const { couple, members, refresh } = useCoupleData();
  const { resetDemo } = useDemo();
  async function regenerate() {
    if (!couple) return;
    try {
      await regenerateInvite(couple.id);
      await refresh();
    } catch (cause) {
      Alert.alert(
        'Invite unavailable',
        cause instanceof Error ? cause.message : 'Try again.',
      );
    }
  }
  return (
    <Screen
      eyebrow="Settings"
      title={couple?.display_name ?? 'Taylor + Michael'}
    >
      <View style={styles.mode}>
        <Text style={styles.modeTitle}>
          {isDemo ? 'Demo mode' : 'Synced with Supabase'}
        </Text>
        <Text style={styles.copy}>
          {isDemo
            ? 'Changes stay on this device and reset when the app restarts.'
            : 'Your shared data persists and updates for both partners.'}
        </Text>
      </View>
      <Text style={styles.heading}>Members</Text>
      <View style={styles.card}>
        {isDemo ? (
          <Text style={styles.item}>Taylor · Michael</Text>
        ) : (
          members.map((member) => (
            <Text key={member.user_id} style={styles.item}>
              {member.profiles?.display_name ?? 'Partner'}
            </Text>
          ))
        )}
      </View>
      <Text style={styles.heading}>Couple settings</Text>
      <View style={styles.card}>
        <Text style={styles.label}>TIME ZONE</Text>
        <Text style={styles.item}>
          {couple?.timezone ?? 'America/New_York'}
        </Text>
        <Text style={styles.label}>INVITE CODE</Text>
        <Text selectable style={styles.code}>
          {couple?.invite_code ?? 'DEMO1234'}
        </Text>
        {!isDemo && members.length < 2 ? (
          <Pressable onPress={() => void regenerate()}>
            <Text style={styles.link}>Regenerate unused code</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.actions}>
        {isDemo ? (
          <Pressable
            onPress={() => {
              resetDemo();
              Alert.alert(
                'Demo reset',
                'The Mexico sample is back to its starting state.',
              );
            }}
            style={styles.outline}
          >
            <Text style={styles.outlineText}>Reset demo</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => void signOut()} style={styles.outline}>
            <Text style={styles.outlineText}>Sign out</Text>
          </Pressable>
        )}
        <Text style={styles.placeholder}>Privacy Policy · configure URL</Text>
        <Text style={styles.placeholder}>Support · configure URL</Text>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  mode: {
    backgroundColor: colors.peach,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  modeTitle: { color: colors.plum, fontWeight: '900', fontSize: 17 },
  copy: { color: colors.mutedPlum, lineHeight: 20, marginTop: 5 },
  heading: {
    color: colors.plum,
    fontWeight: '900',
    fontSize: 19,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.md,
    gap: 9,
  },
  label: {
    color: colors.raspberry,
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1,
  },
  item: { color: colors.plum, fontSize: 16, fontWeight: '700' },
  code: {
    color: colors.teal,
    fontWeight: '900',
    fontSize: 25,
    letterSpacing: 3,
  },
  link: { color: colors.raspberry, fontWeight: '800' },
  actions: { gap: spacing.md, marginTop: spacing.xl },
  outline: {
    borderWidth: 1,
    borderColor: colors.raspberry,
    borderRadius: radius.md,
    padding: 15,
    alignItems: 'center',
  },
  outlineText: { color: colors.raspberry, fontWeight: '900' },
  placeholder: { color: colors.mutedPlum, textAlign: 'center', fontSize: 12 },
});
