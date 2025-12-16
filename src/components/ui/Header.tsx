/**
 * Header - Native-style screen header component
 * Supports multiple variants for different screen types
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing, layout } from '../../theme/theme';

type HeaderVariant = 'primary' | 'accent' | 'light' | 'transparent';

interface HeaderProps {
  /** Main title text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Ionicons icon name */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Header style variant */
  variant?: HeaderVariant;
  /** Show back button */
  showBack?: boolean;
  /** Back button press handler */
  onBack?: () => void;
  /** Right action button */
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
  };
  /** Custom style overrides */
  style?: ViewStyle;
  /** Centered title (default: false for left-aligned native feel) */
  centered?: boolean;
}

const variantStyles: Record<HeaderVariant, {
  backgroundColor: string;
  titleColor: string;
  subtitleColor: string;
  iconBgColor: string;
  iconColor: string;
}> = {
  primary: {
    backgroundColor: colors.primary.dark,
    titleColor: colors.text.white,
    subtitleColor: 'rgba(255, 255, 255, 0.7)',
    iconBgColor: 'rgba(40, 179, 163, 0.3)',
    iconColor: colors.text.white,
  },
  accent: {
    backgroundColor: colors.primary.accent,
    titleColor: colors.text.white,
    subtitleColor: 'rgba(255, 255, 255, 0.8)',
    iconBgColor: 'rgba(255, 255, 255, 0.3)',
    iconColor: colors.text.white,
  },
  light: {
    backgroundColor: colors.background.primary,
    titleColor: colors.text.primary,
    subtitleColor: colors.text.secondary,
    iconBgColor: 'rgba(40, 179, 163, 0.15)',
    iconColor: colors.primary.accent,
  },
  transparent: {
    backgroundColor: 'transparent',
    titleColor: colors.text.primary,
    subtitleColor: colors.text.secondary,
    iconBgColor: 'rgba(40, 179, 163, 0.15)',
    iconColor: colors.primary.accent,
  },
};

export default function Header({
  title,
  subtitle,
  icon,
  variant = 'transparent',
  showBack = false,
  onBack,
  rightAction,
  style,
  centered = false,
}: HeaderProps) {
  const variantStyle = variantStyles[variant];
  const hasIcon = icon && !showBack;

  return (
    <View 
      style={[
        styles.container, 
        { backgroundColor: variantStyle.backgroundColor },
        centered && styles.centered,
        style,
      ]}
    >
      {/* Back button or Icon */}
      {showBack && onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="chevron-back" size={24} color={variantStyle.titleColor} />
        </TouchableOpacity>
      ) : hasIcon ? (
        <View style={[styles.iconContainer, { backgroundColor: variantStyle.iconBgColor }]}>
          <Ionicons name={icon} size={22} color={variantStyle.iconColor} />
        </View>
      ) : null}

      {/* Title and subtitle */}
      <View style={[styles.textContainer, centered && styles.textCentered]}>
        <Text 
          style={[styles.title, { color: variantStyle.titleColor }]} 
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            style={[styles.subtitle, { color: variantStyle.subtitleColor }]} 
            numberOfLines={2}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right action */}
      {rightAction ? (
        <TouchableOpacity onPress={rightAction.onPress} style={styles.rightAction} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={rightAction.icon} size={24} color={variantStyle.titleColor} />
        </TouchableOpacity>
      ) : showBack ? (
        <View style={styles.rightPlaceholder} />
      ) : null}
    </View>
  );
}

/**
 * SimpleHeader - Minimal header for settings-style screens
 */
export function SimpleHeader({ 
  title, 
  subtitle,
  style,
}: { 
  title: string; 
  subtitle?: string;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.simpleContainer, style]}>
      <Text style={styles.simpleTitle}>{title}</Text>
      {subtitle && <Text style={styles.simpleSubtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  centered: {
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  textCentered: {
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  rightAction: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightPlaceholder: {
    width: 40,
  },

  // Simple header styles
  simpleContainer: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  simpleTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  simpleSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
