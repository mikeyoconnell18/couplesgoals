import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';
export function MomentumRing({ value }: { value: number }) {
  return (
    <View
      accessibilityLabel={`Couple Momentum ${value} percent`}
      style={styles.ring}
    >
      <Text style={styles.value}>{value}%</Text>
      <Text style={styles.label}>Momentum</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  ring: {
    width: 146,
    height: 146,
    borderRadius: 73,
    borderWidth: 14,
    borderColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  value: { fontSize: 34, fontWeight: '900', color: colors.plum },
  label: { color: colors.teal, fontWeight: '700' },
});
