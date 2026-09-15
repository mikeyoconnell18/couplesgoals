import { PropsWithChildren } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { AppScreen } from '@/components/ui';
import { colors, radius, spacing, type } from '@/theme/tokens';
export function Screen({
  title,
  eyebrow,
  children,
}: PropsWithChildren<{ title: string; eyebrow?: string }>) {
  return (
    <AppScreen title={title} eyebrow={eyebrow}>
      {children}
    </AppScreen>
  );
}
export function Placeholder({ children }: PropsWithChildren) {
  return (
    <View style={s.empty}>
      <Text style={s.copy}>{children}</Text>
    </View>
  );
}
const s = StyleSheet.create({
  empty: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  copy: { ...type.body, color: colors.textSecondary },
});
