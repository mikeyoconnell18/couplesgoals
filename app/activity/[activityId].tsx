import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  AppScreen,
  EmptyState,
  PrimaryButton,
  TextField,
} from '@/components/ui';
import { useAuth } from '@/features/auth/auth-context';
import {
  addComment,
  deleteComment,
} from '@/features/connected/connected-service';
import { useCoupleData } from '@/features/data/couple-data-context';
import { colors, radius, spacing, type } from '@/theme/tokens';
export default function ActivityThread() {
  const { activityId } = useLocalSearchParams<{ activityId: string }>();
  const { session } = useAuth();
  const { couple, events, comments, members, refresh } = useCoupleData();
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const event = events.find((e) => e.id === activityId);
  const thread = comments.filter((c) => c.activity_event_id === activityId);
  const name = (id: string) =>
    members.find((m) => m.user_id === id)?.profiles?.display_name ?? 'Partner';
  async function post() {
    if (!session || !couple || !body.trim()) return;
    try {
      await addComment({
        coupleId: couple.id,
        eventId: activityId,
        userId: session.user.id,
        body,
      });
      setBody('');
      await refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Could not add your comment.',
      );
    }
  }
  return (
    <AppScreen
      eyebrow="Shared activity"
      title={event?.summary ?? 'Conversation'}
    >
      {thread.length ? (
        thread.map((comment) => (
          <View key={comment.id} style={s.comment}>
            <Text style={s.author}>{name(comment.user_id)}</Text>
            <Text style={s.body}>{comment.body}</Text>
            <Text style={s.time}>
              {new Date(comment.created_at).toLocaleString()}
            </Text>
            {comment.user_id === session?.user.id ? (
              <Pressable
                onPress={() =>
                  void deleteComment(comment.id, session.user.id).then(refresh)
                }
              >
                <Text style={s.delete}>Delete</Text>
              </Pressable>
            ) : null}
          </View>
        ))
      ) : (
        <EmptyState
          title="No comments yet"
          body="Keep it short, kind, and connected to this moment."
        />
      )}
      <View style={s.composer}>
        <TextField
          label="Add a comment"
          value={body}
          onChangeText={setBody}
          maxLength={500}
          multiline
          placeholder="Say something supportive…"
          error={error}
        />
        <Text style={s.count}>{body.length}/500</Text>
        <PrimaryButton
          label="Post comment"
          disabled={!body.trim()}
          onPress={() => void post()}
        />
      </View>
    </AppScreen>
  );
}
const s = StyleSheet.create({
  comment: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  author: { ...type.label, color: colors.primary },
  body: { ...type.body, color: colors.ink, marginTop: spacing.xs },
  time: { ...type.support, color: colors.textSecondary, marginTop: spacing.xs },
  delete: { ...type.label, color: colors.error, marginTop: spacing.xs },
  composer: { marginTop: spacing.lg },
  count: {
    ...type.support,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
});
