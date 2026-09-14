import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/features/auth/auth-context';
import { colors } from '@/theme/tokens';
export default function Index() {
  const { isDemo, session, loading } = useAuth();
  if (loading)
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.cream,
        }}
      >
        <ActivityIndicator color={colors.raspberry} />
      </View>
    );
  return <Redirect href={isDemo || session ? '/(tabs)' : '/(auth)/sign-in'} />;
}
