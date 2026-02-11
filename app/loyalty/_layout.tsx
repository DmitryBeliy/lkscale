import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function LoyaltyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="customer/[id]" />
      <Stack.Screen name="coupons" />
      <Stack.Screen name="coupon/create" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
