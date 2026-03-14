import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { logger } from '@/lib/logger';

export default function Callback() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          logger.error('Auth callback error:', error);
          router.replace(`/login?error=${encodeURIComponent(error.message)}`);
          return;
        }

        if (session) {
          // Successfully authenticated
          router.replace('/(tabs)');
        } else {
          // No session, check for error in URL
          const errorMessage = params.error || 'Authentication failed';
          router.replace(`/login?error=${encodeURIComponent(String(errorMessage))}`);
        }
      } catch (err) {
        logger.error('Callback error:', err);
        router.replace('/login?error=Authentication%20failed');
      }
    };

    handleCallback();
  }, [router, params]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.text, { color: colors.text }]}>
        Выполняется вход...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 16,
  },
});
