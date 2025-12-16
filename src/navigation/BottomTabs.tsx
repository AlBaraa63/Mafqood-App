/**
 * Mafqood Mobile - Bottom Tab Navigator
 * 4 tabs: Home, Report, Matches, Settings
 */

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, layout } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';
import { BottomTabParamList } from '../types/itemTypes';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ReportItemScreen from '../screens/ReportItemScreen';
import MatchesScreen from '../screens/MatchesScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabs() {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.accent,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: t('nav_home'),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportItemScreen}
        options={{
          tabBarLabel: t('nav_report_lost').replace(' Lost', '').replace('مفقود', '').trim() || 'Report',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? 'add-circle' : 'add-circle-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Matches"
        component={MatchesScreen}
        options={{
          tabBarLabel: t('nav_matches'),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? 'git-compare' : 'git-compare-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: t('nav_settings'),
          tabBarIcon: ({ color, size, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? 'settings' : 'settings-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    height: layout.tabBarHeight,
    ...shadows.sm,
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  tabBarItem: {
    paddingVertical: 4,
  },
  activeIconContainer: {
    backgroundColor: colors.primary.accentLight,
    borderRadius: 12,
    padding: 6,
    marginBottom: -4,
  },
});
