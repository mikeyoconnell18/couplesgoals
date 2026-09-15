import { StyleSheet, Text, View } from 'react-native';
import { colors, type } from '@/theme/tokens';
export function MomentumRing({ value }: { value: number }) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: value }}
      style={s.ring}
    >
      <Text style={s.value}>{value}</Text>
      <Text style={s.label}>Momentum</Text>
    </View>
  );
}
const s = StyleSheet.create({
  ring: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 7,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  value: { fontSize: 28, fontWeight: '800', color: colors.ink },
  label: { ...type.label, color: colors.textSecondary },
});
