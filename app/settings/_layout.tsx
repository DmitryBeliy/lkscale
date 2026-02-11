import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="store" />
      <Stack.Screen name="regional" />
      <Stack.Screen name="business" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="announcements" />
      <Stack.Screen name="biometric" />
    </Stack>
  );
}
