/**
 * Screen - Native-first safe area wrapper
 * Handles safe areas, status bar, keyboard avoiding, and optional scrolling
 */

import React, { ReactNode } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ViewStyle,
  RefreshControl,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { colors, layout } from '../../theme/theme';

interface ScreenProps {
  children: ReactNode;
  /** Background color for the screen */
  backgroundColor?: string;
  /** Background color for the safe area (status bar area) */
  safeAreaColor?: string;
  /** Whether content should scroll */
  scroll?: boolean;
  /** Extra padding at the bottom for tab bar clearance */
  bottomPadding?: boolean;
  /** Handle keyboard avoiding behavior */
  keyboardAvoiding?: boolean;
  /** Status bar style */
  statusBarStyle?: 'dark-content' | 'light-content';
  /** Which edges to apply safe area insets */
  edges?: Edge[];
  /** Custom content container style */
  contentStyle?: ViewStyle;
  /** Pull to refresh handler */
  onRefresh?: () => void;
  /** Whether currently refreshing */
  refreshing?: boolean;
  /** Horizontal padding (default: screenPadding from theme) */
  padded?: boolean;
}

export default function Screen({
  children,
  backgroundColor = colors.background.secondary,
  safeAreaColor,
  scroll = true,
  bottomPadding = true,
  keyboardAvoiding = false,
  statusBarStyle = 'dark-content',
  edges = ['top', 'left', 'right'],
  contentStyle,
  onRefresh,
  refreshing = false,
  padded = false,
}: ScreenProps) {
  const finalSafeAreaColor = safeAreaColor ?? backgroundColor;
  
  const paddingStyle: ViewStyle = padded ? { paddingHorizontal: layout.screenPadding } : {};
  const bottomPaddingStyle: ViewStyle = bottomPadding ? { paddingBottom: layout.tabBarHeight + layout.screenPadding } : {};

  const content = scroll ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        bottomPaddingStyle,
        paddingStyle,
        contentStyle,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.accent]}
            tintColor={colors.primary.accent}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, bottomPaddingStyle, paddingStyle, contentStyle]}>
      {children}
    </View>
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: finalSafeAreaColor }]} edges={edges}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={finalSafeAreaColor}
        translucent={false}
      />
      <View style={[styles.flex, { backgroundColor }]}>
        {wrappedContent}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
