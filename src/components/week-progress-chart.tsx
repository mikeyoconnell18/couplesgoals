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
const PLOT_HEIGHT = 88;
export function WeekProgressChart({
  series,
  pace,
  summary,
  currentDay,
}: {
  series: Series[];
  pace: number[];
  summary: string;
  currentDay: number;
}) {
  const [isolated, setIsolated] = useState<string>();
  const [width, setWidth] = useState(0);
  const visible = isolated
    ? series.filter((item) => item.key === isolated)
    : series.slice(0, 3);
  const x = (index: number) => (width * index) / 6;
  const y = (value: number) =>
    PLOT_HEIGHT * (1 - Math.min(Math.max(value, 0), 100) / 100);
  return (
    <View style={s.card} accessibilityLabel={`Weekly progress. ${summary}`}>
      <View style={s.top}>
        <Text style={s.title}>THIS WEEK</Text>
        <View style={s.legend}>
          {series.slice(0, 3).map((item) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.label} progress; ${isolated === item.key ? 'showing only' : 'tap to isolate'}`}
              accessibilityState={{ selected: isolated === item.key }}
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
      </View>
      <View
        style={s.plot}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      >
        {[25, 50, 75].map((level) => (
          <View key={level} style={[s.grid, { top: y(level) }]} />
        ))}
        {width > 0 &&
          pace.map((value, index) =>
            index < 6 ? (
              <Segment
                key={`pace-${index}`}
                x1={x(index)}
                y1={y(value)}
                x2={x(index + 1)}
                y2={y(pace[index + 1])}
                color="rgba(255,255,255,.22)"
                dashed
              />
            ) : null,
          )}
        {width > 0 &&
          visible.map((item) => {
            const values = item.values.slice(0, currentDay + 1);
            return (
              <View key={item.key}>
                {values.map((value, index) =>
                  index < values.length - 1 ? (
                    <Segment
                      key={`${item.key}-line-${index}`}
                      x1={x(index)}
                      y1={y(value)}
                      x2={x(index + 1)}
                      y2={y(values[index + 1])}
                      color={item.color}
                      dashed={item.dashed}
                    />
                  ) : null,
                )}
                {values.map((value, index) => (
                  <View
                    key={`${item.key}-point-${index}`}
                    style={[
                      s.point,
                      {
                        backgroundColor: item.color,
                        left: x(index) - 4,
                        top: y(value) - 4,
                      },
                      index === currentDay && s.todayPoint,
                    ]}
                  />
                ))}
              </View>
            );
          })}
      </View>
      <View style={s.days}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
          <View key={`${day}-${index}`} style={s.dayWrap}>
            <Text style={[s.day, index === currentDay && s.today]}>{day}</Text>
            {index === currentDay ? <View style={s.todayTick} /> : null}
          </View>
        ))}
      </View>
      <Text style={s.summary}>{summary}</Text>
    </View>
  );
}
function Segment({
  x1,
  y1,
  x2,
  y2,
  color,
  dashed,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  dashed?: boolean;
}) {
  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <View
      style={[
        s.segment,
        {
          left: x1,
          top: y1 - 1.5,
          width: length,
          backgroundColor: color,
          transform: [{ rotate: `${angle}deg` }],
          transformOrigin: 'left center',
        },
        dashed && s.dashed,
      ]}
    />
  );
}
const s = StyleSheet.create({
  card: {
    backgroundColor: colors.ink,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...type.label,
    fontSize: 10,
    letterSpacing: 1.2,
    color: 'rgba(255,255,255,.6)',
  },
  legend: { flexDirection: 'row', gap: spacing.sm },
  legendItem: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dimmed: { opacity: 0.35 },
  swatch: { width: 8, height: 8, borderRadius: 4 },
  legendText: { ...type.label, fontSize: 11, color: '#FFFFFF' },
  plot: { height: PLOT_HEIGHT, position: 'relative' },
  grid: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,.08)',
  },
  segment: { position: 'absolute', height: 3, borderRadius: 2 },
  dashed: {
    height: 2,
    borderStyle: 'dashed',
    borderTopWidth: 2,
    backgroundColor: 'transparent',
  },
  point: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.ink,
  },
  todayPoint: {
    width: 11,
    height: 11,
    borderRadius: 6,
    marginLeft: -1.5,
    marginTop: -1.5,
    borderColor: '#FFFFFF',
  },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  dayWrap: { width: 16, alignItems: 'center' },
  day: { ...type.support, fontSize: 11, color: 'rgba(255,255,255,.45)' },
  today: { color: '#FFFFFF', fontWeight: '800' },
  todayTick: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.coral,
  },
  summary: { ...type.label, color: '#FFFFFF', marginTop: spacing.xs },
});
