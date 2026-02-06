import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = '@lkscale_onboarding_complete';
const DEMO_MODE_KEY = '@lkscale_demo_mode';
const GUIDED_TOUR_COMPLETE_KEY = '@lkscale_guided_tour_complete';

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  isDemoMode: boolean;
  hasCompletedGuidedTour: boolean;
  isLoading: boolean;
  completeOnboarding: () => Promise<void>;
  toggleDemoMode: () => Promise<void>;
  setDemoMode: (enabled: boolean) => Promise<void>;
  completeGuidedTour: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [hasCompletedGuidedTour, setHasCompletedGuidedTour] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOnboardingState();
  }, []);

  const loadOnboardingState = async () => {
    try {
      const [onboardingComplete, demoMode, tourComplete] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
        AsyncStorage.getItem(DEMO_MODE_KEY),
        AsyncStorage.getItem(GUIDED_TOUR_COMPLETE_KEY),
      ]);

      setHasCompletedOnboarding(onboardingComplete === 'true');
      setIsDemoMode(demoMode === 'true');
      setHasCompletedGuidedTour(tourComplete === 'true');
    } catch (error) {
      console.error('Error loading onboarding state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const toggleDemoMode = async () => {
    try {
      const newValue = !isDemoMode;
      await AsyncStorage.setItem(DEMO_MODE_KEY, String(newValue));
      setIsDemoMode(newValue);
    } catch (error) {
      console.error('Error toggling demo mode:', error);
    }
  };

  const setDemoModeValue = async (enabled: boolean) => {
    try {
      await AsyncStorage.setItem(DEMO_MODE_KEY, String(enabled));
      setIsDemoMode(enabled);
    } catch (error) {
      console.error('Error setting demo mode:', error);
    }
  };

  const completeGuidedTour = async () => {
    try {
      await AsyncStorage.setItem(GUIDED_TOUR_COMPLETE_KEY, 'true');
      setHasCompletedGuidedTour(true);
    } catch (error) {
      console.error('Error completing guided tour:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY),
        AsyncStorage.removeItem(GUIDED_TOUR_COMPLETE_KEY),
      ]);
      setHasCompletedOnboarding(false);
      setHasCompletedGuidedTour(false);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        isDemoMode,
        hasCompletedGuidedTour,
        isLoading,
        completeOnboarding,
        toggleDemoMode,
        setDemoMode: setDemoModeValue,
        completeGuidedTour,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
