import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getAuthState, subscribeAuth } from '@/store/authStore';
import { colors } from '@/constants/theme';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = subscribeAuth(() => {
      const state = getAuthState();
      setIsAuthenticated(state.isAuthenticated);
      setIsLoading(state.isLoading);
    });

    // Check initial state
    const state = getAuthState();
    setIsAuthenticated(state.isAuthenticated);
    setIsLoading(state.isLoading);

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
