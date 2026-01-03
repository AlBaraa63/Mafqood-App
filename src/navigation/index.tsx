import React from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { useAuthStore, useOnboardingStore, useLanguageStore } from '../hooks/useStore';
import { colors } from '../theme';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { AuthStackParamList } from '../types';

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary.accent,
    background: colors.background.primary,
    card: colors.background.primary,
    text: colors.text.primary,
    border: colors.border.light,
    notification: colors.primary.accent,
  },
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isGuest } = useAuthStore();
  const { hasSeenOnboarding } = useOnboardingStore();
  const { isRTL } = useLanguageStore();

  const initialAuthRoute: keyof AuthStackParamList = hasSeenOnboarding
    ? 'Login'
    : 'Onboarding';

  return (
    <NavigationContainer theme={navigationTheme}>
      <React.Fragment key={isRTL ? 'rtl' : 'ltr'}>
        {isAuthenticated || isGuest ? (
          <MainNavigator />
        ) : (
          <AuthNavigator initialRouteName={initialAuthRoute} />
        )}
      </React.Fragment>
    </NavigationContainer>
  );
};

export default AppNavigator;
