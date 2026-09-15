import { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { colors, radius, spacing, type } from '@/theme/tokens';

export function AppScreen({
  title,
  eyebrow,
  header,
  children,
}: PropsWithChildren<{
  title?: string;
  eyebrow?: string;
  header?: ReactNode;
}>) {
  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.screen}
      >
        {header}
        {eyebrow ? <Text style={s.eyebrow}>{eyebrow}</Text> : null}
        {title ? <Text style={s.screenTitle}>{title}</Text> : null}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={s.sectionRow}>
      <Text style={s.section}>{title}</Text>
      {action ? (
        <Pressable hitSlop={8} onPress={onAction}>
          <Text style={s.sectionAction}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
type ButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};
export function PrimaryButton(p: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={p.disabled || p.loading}
      onPress={p.onPress}
      style={({ pressed }) => [
        s.primaryButton,
        pressed && s.primaryPressed,
        (p.disabled || p.loading) && s.disabled,
      ]}
    >
      {p.loading ? (
        <ActivityIndicator color={colors.surface} />
      ) : (
        <Text style={s.primaryText}>{p.label}</Text>
      )}
    </Pressable>
  );
}
export function SecondaryButton(p: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={p.disabled || p.loading}
      onPress={p.onPress}
      style={({ pressed }) => [
        s.secondaryButton,
        pressed && s.secondaryPressed,
        (p.disabled || p.loading) && s.disabled,
      ]}
    >
      {p.loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Text style={s.secondaryText}>{p.label}</Text>
      )}
    </Pressable>
  );
}
export function IconButton({
  label,
  onPress,
  children,
}: {
  label: string;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [s.iconButton, pressed && s.secondaryPressed]}
    >
      {children}
    </Pressable>
  );
}
export function TextField({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        {...props}
        style={[s.input, props.multiline && s.multiline, props.style]}
      />
      {error ? <Text style={s.error}>{error}</Text> : null}
    </View>
  );
}
export function NumberField(
  props: TextInputProps & { label: string; unit?: string; error?: string },
) {
  return (
    <View>
      <TextField {...props} keyboardType="decimal-pad" />
      <Text style={s.unit}>{props.unit}</Text>
    </View>
  );
}
export function CurrencyField({
  value,
  onChangeText,
  label = 'Amount',
  error,
}: {
  value: string;
  onChangeText: (v: string) => void;
  label?: string;
  error?: string;
}) {
  const clean = (v: string) => {
    const normalized = v.replace(/[^0-9.]/g, '');
    if ((normalized.match(/\./g) ?? []).length <= 1) onChangeText(normalized);
  };
  return (
    <View>
      <TextField
        label={label}
        value={value}
        onChangeText={clean}
        keyboardType="decimal-pad"
        inputMode="decimal"
        error={error}
      />
      <Text style={s.currency}>$</Text>
      <View style={s.chips}>
        {[10, 25, 50, 100].map((v) => (
          <Pressable
            key={v}
            onPress={() => onChangeText(String(v))}
            style={s.chip}
          >
            <Text style={s.chipText}>${v}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
export function ProgressBar({
  value,
  color = colors.primary,
}: {
  value: number;
  color?: string;
}) {
  const now = Math.round(Math.min(100, Math.max(0, value)));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now }}
      style={s.track}
    >
      <View
        style={[s.progress, { width: `${now}%`, backgroundColor: color }]}
      />
    </View>
  );
}
export function Avatar({
  name,
  tone = 'teal',
  size = 36,
}: {
  name: string;
  tone?: 'teal' | 'raspberry';
  size?: number;
}) {
  return (
    <View
      accessibilityLabel={name}
      style={[
        s.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: tone === 'teal' ? colors.primary : colors.raspberry,
        },
      ]}
    >
      <Text style={s.avatarText}>{name.trim().charAt(0).toUpperCase()}</Text>
    </View>
  );
}
export function PartnerBadge({
  name,
  tone = 'teal',
}: {
  name: string;
  tone?: 'teal' | 'raspberry';
}) {
  return (
    <View style={[s.partnerBadge, tone === 'raspberry' && s.partnerRaspberry]}>
      <Avatar name={name} tone={tone} size={22} />
      <Text numberOfLines={1} style={s.partnerText}>
        {name}
      </Text>
    </View>
  );
}
export function EmptyState({
  title,
  body,
  action,
  onAction,
}: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={s.empty}>
      <Text style={s.emptyTitle}>{title}</Text>
      <Text style={s.support}>{body}</Text>
      {action && onAction ? (
        <SecondaryButton label={action} onPress={onAction} />
      ) : null}
    </View>
  );
}
export function NotificationBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <View style={s.notification}>
      <Text style={s.notificationText}>{count > 9 ? '9+' : count}</Text>
    </View>
  );
}
export function Banner({
  tone = 'success',
  children,
}: {
  tone?: 'success' | 'error' | 'info';
  children: ReactNode;
}) {
  return (
    <View
      style={[
        s.banner,
        tone === 'error' && s.bannerError,
        tone === 'info' && s.bannerInfo,
      ]}
    >
      <Text style={s.bannerText}>{children}</Text>
    </View>
  );
}
export function FormModal({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <AppScreen title={title}>
        <SecondaryButton label="Close" onPress={onClose} />
        {children}
      </AppScreen>
    </Modal>
  );
}
export function GoalCard({
  title,
  subtitle,
  progress,
  owner,
  onPress,
}: {
  title: string;
  subtitle: string;
  progress: number;
  owner: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && s.cardPressed]}
    >
      <View style={s.cardTop}>
        <Text numberOfLines={2} style={s.cardTitle}>
          {title}
        </Text>
        <PartnerBadge name={owner} />
      </View>
      <Text style={s.support}>{subtitle}</Text>
      <ProgressBar value={progress} />
    </Pressable>
  );
}
export function ActionRow({
  title,
  detail,
  assignee,
  children,
}: {
  title: string;
  detail: string;
  assignee: string;
  children: ReactNode;
}) {
  return (
    <View style={s.actionRow}>
      <View style={s.actionCopy}>
        <Text numberOfLines={2} style={s.cardTitle}>
          {title}
        </Text>
        <Text style={s.support}>{detail}</Text>
        <PartnerBadge name={assignee} />
      </View>
      {children}
    </View>
  );
}
export function ActivityCard({
  title,
  body,
  footer,
  onPress,
}: {
  title: string;
  body: string;
  footer?: ReactNode;
  onPress?: () => void;
}) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [s.activity, pressed && s.cardPressed]}
    >
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.support}>{body}</Text>
      {footer}
    </Pressable>
  );
}
const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  screen: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: 112,
    backgroundColor: colors.background,
  },
  eyebrow: { ...type.label, color: colors.primary, marginBottom: spacing.xs },
  screenTitle: { ...type.screen, color: colors.ink, marginBottom: spacing.lg },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  section: { ...type.section, color: colors.ink },
  sectionAction: { ...type.label, color: colors.primary },
  primaryButton: {
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  primaryPressed: { backgroundColor: colors.primaryPressed },
  primaryText: { ...type.label, color: colors.surface },
  secondaryButton: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  secondaryPressed: { backgroundColor: colors.elevated },
  secondaryText: { ...type.label, color: colors.primary },
  disabled: { opacity: 0.45 },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  field: { marginBottom: spacing.md },
  fieldLabel: { ...type.label, color: colors.ink, marginBottom: spacing.xs },
  input: {
    ...type.body,
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.ink,
    paddingHorizontal: spacing.md,
  },
  multiline: {
    minHeight: 104,
    paddingTop: spacing.sm,
    textAlignVertical: 'top',
  },
  error: { ...type.support, color: colors.error, marginTop: spacing.xs },
  unit: {
    position: 'absolute',
    right: spacing.md,
    top: 42,
    ...type.support,
    color: colors.textSecondary,
  },
  currency: {
    position: 'absolute',
    left: spacing.md,
    top: 42,
    ...type.body,
    color: colors.ink,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: -spacing.xs,
    marginBottom: spacing.md,
  },
  chip: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.elevated,
  },
  chipText: { ...type.label, color: colors.primary },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: colors.border,
    marginTop: spacing.sm,
  },
  progress: { height: 8, borderRadius: 4 },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...type.label, color: colors.surface },
  partnerBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingRight: spacing.sm,
    minHeight: 30,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
  },
  partnerRaspberry: { backgroundColor: colors.raspberrySoft },
  partnerText: { ...type.label, color: colors.ink, maxWidth: 120 },
  empty: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  emptyTitle: { ...type.card, color: colors.ink },
  support: {
    ...type.support,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  notification: {
    position: 'absolute',
    right: -2,
    top: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.raspberry,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  notificationText: { fontSize: 10, fontWeight: '700', color: colors.surface },
  banner: {
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.primarySoft,
    marginVertical: spacing.sm,
  },
  bannerError: { backgroundColor: colors.raspberrySoft },
  bannerInfo: { backgroundColor: colors.elevated },
  bannerText: { ...type.support, color: colors.ink },
  card: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cardPressed: { backgroundColor: colors.elevated },
  cardTop: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  cardTitle: { ...type.card, color: colors.ink, flexShrink: 1 },
  actionRow: {
    minHeight: 76,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionCopy: { flex: 1, gap: spacing.xxs },
  activity: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
