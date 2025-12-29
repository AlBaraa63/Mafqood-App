import 'react-native-gesture-handler';
import './global.css';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation';
import { useAuthStore, useOnboardingStore, useLanguageStore } from './src/hooks/useStore';
import { useTranslation } from './src/hooks';
import { colors } from './src/theme';
import { Loading } from './src/components/common';

const queryClient = new QueryClient();

export default function App() {
  const { checkAuth, isLoading } = useAuthStore();
  const { checkOnboarding } = useOnboardingStore();
  const { loadLanguage, isRTL } = useLanguageStore();
  const { t } = useTranslation();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    (async () => {
      await Promise.all([loadLanguage(), checkAuth(), checkOnboarding()]);
      setBootstrapped(true);
    })();
  }, [checkAuth, checkOnboarding, loadLanguage]);

  if (!bootstrapped || isLoading) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.background.primary,
            }}
          >
            <Loading text={t('loading')} />
            <StatusBar style="dark" />
          </View>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1 }} key={isRTL ? 'rtl' : 'ltr'}>
            <AppNavigator />
          </View>
          <StatusBar style="dark" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
