import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, type } from '@/theme/tokens';

type Series = {
  key: string;
  label: string;
  color: string;
  values: number[];
  dashed?: boolean;
};
export function WeekProgressChart({
  series,
  pace,
  summary,
}: {
  series: Series[];
  pace: number[];
  summary: string;
}) {
  const [isolated, setIsolated] = useState<string>();
  const visible = isolated
    ? series.filter((item) => item.key === isolated)
    : series.slice(0, 3);
  return (
    <View style={s.card} accessibilityLabel="Seven-day progress graph">
      <View style={s.legend}>
        {series.slice(0, 3).map((item) => (
          <Pressable
            key={item.key}
            onPress={() =>
              setIsolated(isolated === item.key ? undefined : item.key)
            }
            style={[
              s.legendItem,
              isolated && isolated !== item.key && s.dimmed,
            ]}
          >
            <View style={[s.swatch, { backgroundColor: item.color }]} />
            <Text style={s.legendText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.plot}>
        {[25, 50, 75, 100].map((level) => (
          <View key={level} style={[s.grid, { bottom: `${level}%` }]} />
        ))}
        {pace.map((value, index) => (
          <View
            key={`pace-${index}`}
            style={[
              s.paceDot,
              { left: `${index * 16.2}%`, bottom: `${value}%` },
            ]}
          />
        ))}
        {visible.map((item) =>
          item.values.map((value, index) => (
            <View
              key={`${item.key}-${index}`}
              style={[
                s.point,
                item.dashed && s.hollow,
                {
                  backgroundColor: item.dashed ? colors.surface : item.color,
                  borderColor: item.color,
                  left: `${index * 16.2}%`,
                  bottom: `${value}%`,
                },
              ]}
            />
          )),
        )}
      </View>
      <View style={s.days}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <Text key={`${day}-${index}`} style={s.day}>
            {day}
          </Text>
        ))}
      </View>
      <Text style={s.summary}>{summary}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  legend: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm },
  legendItem: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dimmed: { opacity: 0.35 },
  swatch: { width: 9, height: 9, borderRadius: 5 },
  legendText: { ...type.label, color: colors.ink },
  plot: { height: 116, marginHorizontal: 5, position: 'relative' },
  grid: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paceDot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.textSecondary,
  },
  point: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    marginLeft: -5,
    marginBottom: -5,
  },
  hollow: { borderStyle: 'dashed' },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  day: { ...type.support, color: colors.textSecondary },
  summary: { ...type.label, color: colors.ink, marginTop: spacing.sm },
});
