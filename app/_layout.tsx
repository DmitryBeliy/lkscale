import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@fastshot/auth';
import { LocalizationProvider } from '@/localization';
import { supabase, initConnectionMonitor } from '@/lib/supabase';
import { loadCachedData } from '@/store/dataStore';
import { loadNotifications } from '@/store/notificationStore';
import { colors } from '@/constants/theme';

// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        // Initialize connection monitor and load cached data in parallel
        initConnectionMonitor();
        await Promise.all([
          loadCachedData(),
          loadNotifications(),
        ]);
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider
          supabaseClient={supabase}
          routes={{
            login: '/login',
            afterLogin: '/(tabs)',
          }}
        >
          <LocalizationProvider>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="login" options={{ animation: 'fade' }} />
              <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
              <Stack.Screen
                name="order/[id]"
                options={{
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name="order/create"
                options={{
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name="product/[id]"
                options={{
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name="product/edit/[id]"
                options={{
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name="notifications"
                options={{
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name="customers/index"
                options={{
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name="customers/[id]"
                options={{
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name="auth/callback"
                options={{
                  presentation: 'card',
                }}
              />
            </Stack>
          </LocalizationProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
