import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/screen';
import { useAuth } from '@/features/auth/auth-context';
import { colors, radius, spacing } from '@/theme/tokens';
export default function SignIn() {
  const { sendCode } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit() {
    setBusy(true);
    setError('');
    try {
      await sendCode(email);
      router.push({ pathname: '/(auth)/verify', params: { email } });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : 'Could not send the code. Try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen eyebrow="Couples Goals" title="Build it together.">
      <Text style={styles.copy}>
        Enter your email and we'll send a one-time sign-in code. No password
        needed.
      </Text>
      <Text style={styles.label}>EMAIL</Text>
      <TextInput
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        disabled={busy || !email.includes('@')}
        onPress={submit}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {busy ? 'Sending…' : 'Email me a code'}
        </Text>
      </Pressable>
      <View style={styles.note}>
        <Text style={styles.copy}>
          By continuing, you agree to use the honor system and treat shared
          goals with care.
        </Text>
      </View>
    </Screen>
  );
}
const styles = StyleSheet.create({
  copy: { color: colors.textSecondary, fontSize: 16, lineHeight: 23 },
  label: {
    color: colors.ink,
    fontSize: 11,
    fontWeight: '900',
    marginTop: spacing.xl,
    marginBottom: 7,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.ink,
  },
  error: { color: colors.raspberry, marginTop: 8 },
  button: {
    marginTop: spacing.md,
    padding: 17,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: '900', fontSize: 16 },
  note: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.elevated,
  },
});
