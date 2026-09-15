import { Redirect, Tabs } from 'expo-router';
import {
  CalendarCheck,
  Goal,
  HandHeart,
  Settings,
  Users,
} from 'lucide-react-native';
import { colors } from '@/theme/tokens';
import { useAuth } from '@/features/auth/auth-context';
import { useCoupleData } from '@/features/data/couple-data-context';

export default function TabsLayout() {
  const { isDemo, session } = useAuth();
  const { couple, loading } = useCoupleData();
  if (!isDemo && !session) return <Redirect href="/(auth)/sign-in" />;
  if (!isDemo && !loading && !couple)
    return <Redirect href="/(auth)/onboarding" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.elevated,
          height: 84,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <CalendarCheck color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color }) => <Goal color={color} />,
        }}
      />
      <Tabs.Screen
        name="together"
        options={{
          title: 'Together',
          tabBarIcon: ({ color }) => <Users color={color} />,
        }}
      />
      <Tabs.Screen
        name="owed"
        options={{
          title: 'Owed',
          tabBarIcon: ({ color }) => <HandHeart color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Settings color={color} />,
        }}
      />
    </Tabs>
  );
}
