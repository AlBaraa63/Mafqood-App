/**
 * ScreenContainer - Reusable safe area wrapper for screens
 * Handles safe areas, status bar, and optional scrolling
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
import { colors, spacing } from '../theme/theme';

interface ScreenContainerProps {
  children: ReactNode;
  /** Background color for the screen */
  backgroundColor?: string;
  /** Background color for the safe area (status bar area) */
  safeAreaColor?: string;
  /** Whether content should scroll */
  scroll?: boolean;
  /** Extra padding at the bottom (for tab bar clearance) */
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
}

// Tab bar height to ensure content isn't hidden
export const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 64;

export default function ScreenContainer({
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
}: ScreenContainerProps) {
  // Use safeAreaColor for the outer container (affects status bar area)
  const finalSafeAreaColor = safeAreaColor ?? backgroundColor;

  const content = scroll ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        bottomPadding && styles.bottomPadding,
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
    <View style={[styles.container, bottomPadding && styles.bottomPadding, contentStyle]}>
      {children}
    </View>
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
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
  bottomPadding: {
    paddingBottom: spacing.xxxl + spacing.xl, // Extra padding for tab bar
  },
});
