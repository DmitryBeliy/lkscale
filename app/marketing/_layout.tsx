import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function MarketingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="churn-analysis" />
      <Stack.Screen name="staff-performance" />
    </Stack>
  );
}
