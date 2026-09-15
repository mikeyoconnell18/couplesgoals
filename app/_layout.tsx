import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { DemoProvider } from '@/features/demo/demo-context';
import { AuthProvider } from '@/features/auth/auth-context';
import { CoupleDataProvider } from '@/features/data/couple-data-context';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CoupleDataProvider>
        <DemoProvider>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          />
        </DemoProvider>
      </CoupleDataProvider>
    </AuthProvider>
  );
}
