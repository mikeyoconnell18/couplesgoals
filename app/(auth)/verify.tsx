import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput } from 'react-native';
import { Screen } from '@/components/screen';
import { useAuth } from '@/features/auth/auth-context';
import { colors, radius, spacing } from '@/theme/tokens';
export default function Verify() {
  const { email = '' } = useLocalSearchParams<{ email: string }>();
  const { verifyCode } = useAuth();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  async function verify() {
    try {
      await verifyCode(email, token);
      router.replace('/(auth)/onboarding');
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'That code did not work.',
      );
    }
  }
  return (
    <Screen eyebrow="Check your inbox" title="Enter your code.">
      <Text style={styles.copy}>We sent a one-time code to {email}.</Text>
      <TextInput
        accessibilityLabel="One-time code"
        keyboardType="number-pad"
        value={token}
        onChangeText={setToken}
        maxLength={8}
        placeholder="123456"
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        disabled={token.length < 6}
        onPress={verify}
        style={styles.button}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </Pressable>
    </Screen>
  );
}
const styles = StyleSheet.create({
  copy: { color: colors.mutedPlum, fontSize: 16 },
  input: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 24,
    letterSpacing: 5,
    color: colors.plum,
  },
  error: { color: colors.raspberry, marginTop: 8 },
  button: {
    marginTop: spacing.md,
    padding: 17,
    borderRadius: radius.md,
    backgroundColor: colors.raspberry,
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontWeight: '900', fontSize: 16 },
});
