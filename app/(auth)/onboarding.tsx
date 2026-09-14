import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/screen';
import { useAuth } from '@/features/auth/auth-context';
import {
  createCouple,
  joinCouple,
  upsertProfile,
} from '@/features/couples/couple-service';
import { normalizeInviteCode } from '@/domain/invite-code';
import { colors, radius, spacing } from '@/theme/tokens';
export default function Onboarding() {
  const { session } = useAuth();
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose');
  const [name, setName] = useState('');
  const [coupleName, setCoupleName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function finish() {
    if (!session) return;
    setBusy(true);
    setError('');
    try {
      await upsertProfile(session.user.id, name);
      if (mode === 'create')
        await createCouple(
          coupleName,
          Intl.DateTimeFormat().resolvedOptions().timeZone,
        );
      else await joinCouple(code);
      router.replace('/(tabs)');
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not finish pairing.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Screen eyebrow="Your team starts here" title="Who are you building with?">
      <Text style={styles.label}>YOUR DISPLAY NAME</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Taylor"
        style={styles.input}
      />
      {mode === 'choose' ? (
        <View style={styles.choices}>
          <Pressable style={styles.primary} onPress={() => setMode('create')}>
            <Text style={styles.primaryText}>Create a couple</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={() => setMode('join')}>
            <Text style={styles.secondaryText}>Join your partner</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <Text style={styles.label}>
            {mode === 'create' ? 'COUPLE / TEAM NAME' : 'INVITE CODE'}
          </Text>
          <TextInput
            autoCapitalize="characters"
            value={mode === 'create' ? coupleName : code}
            onChangeText={
              mode === 'create'
                ? setCoupleName
                : (value) => setCode(normalizeInviteCode(value))
            }
            placeholder={mode === 'create' ? 'Mexico prep crew' : 'A1B2C3D4'}
            style={styles.input}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Pressable
            disabled={
              busy ||
              !name.trim() ||
              (mode === 'create' ? !coupleName.trim() : code.length < 6)
            }
            onPress={finish}
            style={styles.primary}
          >
            <Text style={styles.primaryText}>
              {busy
                ? 'Working…'
                : mode === 'create'
                  ? 'Create our team'
                  : 'Join our team'}
            </Text>
          </Pressable>
          <Pressable onPress={() => setMode('choose')}>
            <Text style={styles.back}>Back</Text>
          </Pressable>
        </>
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  label: {
    color: colors.plum,
    fontSize: 11,
    fontWeight: '900',
    marginTop: spacing.md,
    marginBottom: 7,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.plum,
  },
  choices: { marginTop: spacing.xl, gap: spacing.sm },
  primary: {
    marginTop: spacing.md,
    padding: 17,
    borderRadius: radius.md,
    backgroundColor: colors.raspberry,
    alignItems: 'center',
  },
  primaryText: { color: 'white', fontWeight: '900', fontSize: 16 },
  secondary: {
    padding: 17,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.raspberry,
    alignItems: 'center',
  },
  secondaryText: { color: colors.raspberry, fontWeight: '900' },
  error: { color: colors.raspberry, marginTop: 8 },
  back: {
    textAlign: 'center',
    color: colors.mutedPlum,
    marginTop: spacing.md,
    fontWeight: '700',
  },
});
