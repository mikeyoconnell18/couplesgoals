import { Check, Plus, Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MomentumRing } from '@/components/momentum-ring';
import { Screen } from '@/components/screen';
import { useDemo } from '@/features/demo/demo-context';
import { colors, radius, spacing } from '@/theme/tokens';

export default function TodayScreen() {
  const { actions, momentum, logAction, lastLogged } = useDemo();
  return <Screen eyebrow="Monday, together" title="Make today count.">
    <View style={styles.hero}><MomentumRing value={momentum} /><View style={styles.heroCopy}><Text style={styles.kicker}>MEXICO, HERE YOU COME</Text><Text style={styles.heroTitle}>Your week is building.</Text><Text style={styles.body}>Every small action moves the trip forward.</Text></View></View>
    {lastLogged && <View style={styles.toast}><Sparkles color={colors.teal} size={20}/><Text style={styles.toastText}>Nice one. Your shared momentum just moved.</Text></View>}
    <Text style={styles.section}>Today's moves</Text>
    {actions.map((action) => <View key={action.id} style={styles.card}><View style={[styles.dot, { backgroundColor: action.accent }]} /><View style={styles.actionCopy}><Text style={styles.actionTitle}>{action.title}</Text><Text style={styles.detail}>{action.detail}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Log ${action.title}`} onPress={() => logAction(action.id)} disabled={action.value >= action.target} style={({ pressed }) => [styles.log, pressed && styles.pressed, action.value >= action.target && styles.done]}>{action.value >= action.target ? <Check color="white"/> : <Plus color="white"/>}</Pressable></View>)}
    <View style={styles.milestone}><Text style={styles.kicker}>NEXT SHARED WIN</Text><Text style={styles.milestoneTitle}>Book the hotel</Text><Text style={styles.body}>Two weeks away · celebrate with tacos when it's done</Text></View>
  </Screen>;
}
const styles = StyleSheet.create({ hero: { backgroundColor: colors.plum, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', gap: spacing.lg, alignItems: 'center' }, heroCopy: { flex: 1 }, kicker: { color: colors.coral, fontSize: 11, fontWeight: '900', letterSpacing: 1.2 }, heroTitle: { color: 'white', fontSize: 22, fontWeight: '800', marginVertical: 8 }, body: { color: colors.mutedPlum, fontSize: 15, lineHeight: 21 }, section: { color: colors.plum, fontSize: 21, fontWeight: '800', marginTop: spacing.xl, marginBottom: spacing.md }, card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: 12 }, dot: { width: 10, height: 42, borderRadius: 5 }, actionCopy: { flex: 1 }, actionTitle: { color: colors.plum, fontSize: 17, fontWeight: '700' }, detail: { color: colors.mutedPlum, marginTop: 3 }, log: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.raspberry }, done: { backgroundColor: colors.teal }, pressed: { opacity: 0.75, transform: [{ scale: 0.96 }] }, toast: { marginTop: spacing.md, backgroundColor: '#E1F4ED', padding: 14, borderRadius: radius.sm, flexDirection: 'row', gap: 8 }, toastText: { color: colors.plum, flex: 1, fontWeight: '600' }, milestone: { marginTop: spacing.lg, borderRadius: radius.md, padding: spacing.lg, backgroundColor: colors.peach }, milestoneTitle: { color: colors.plum, fontWeight: '800', fontSize: 20, marginVertical: 6 } });
