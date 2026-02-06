import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function TeamLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="invite" options={{ presentation: 'modal' }} />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="activity" />
      <Stack.Screen name="shifts" />
    </Stack>
  );
}
