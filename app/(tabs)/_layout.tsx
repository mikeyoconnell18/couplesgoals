import { Tabs } from 'expo-router';
import { CalendarCheck, Goal, HandHeart, Settings, Users } from 'lucide-react-native';
import { colors } from '@/theme/tokens';

export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors.raspberry, tabBarInactiveTintColor: colors.mutedPlum, tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.peach, height: 84, paddingTop: 8 } }}>
    <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: ({ color }) => <CalendarCheck color={color} /> }} />
    <Tabs.Screen name="goals" options={{ title: 'Goals', tabBarIcon: ({ color }) => <Goal color={color} /> }} />
    <Tabs.Screen name="together" options={{ title: 'Together', tabBarIcon: ({ color }) => <Users color={color} /> }} />
    <Tabs.Screen name="owed" options={{ title: 'Owed', tabBarIcon: ({ color }) => <HandHeart color={color} /> }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Settings color={color} /> }} />
  </Tabs>;
}
