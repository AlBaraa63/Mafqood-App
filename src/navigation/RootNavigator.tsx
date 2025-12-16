/**
 * Mafqood Mobile - Root Navigator
 * Stack navigator containing bottom tabs and modal screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/itemTypes';
import { colors, typography } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';

// Navigators
import BottomTabs from './BottomTabs';

// Screens
import MatchDetailsScreen from '../screens/MatchDetailsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { t } = useLanguage();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background.secondary },
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen
        name="MatchDetails"
        component={MatchDetailsScreen}
        options={{
          headerShown: true,
          title: t('match_details_title'),
          headerStyle: {
            backgroundColor: colors.background.primary,
          },
          headerTitleStyle: {
            fontWeight: typography.weights.semibold,
            fontSize: typography.sizes.lg,
            color: colors.text.primary,
          },
          headerTintColor: colors.primary.dark,
          headerShadowVisible: false,
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}
