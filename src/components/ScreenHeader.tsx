/**
 * ScreenHeader - Reusable header component for screens
 * Displays title, subtitle, and optional icon with consistent styling
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../theme/theme';

type HeaderVariant = 'primary' | 'accent' | 'light';

interface ScreenHeaderProps {
  /** Main title text */
  title: string;
  /** Optional subtitle text */
  subtitle?: string;
  /** Ionicons icon name */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Header style variant */
  variant?: HeaderVariant;
  /** Whether to use compact (row) layout vs stacked */
  compact?: boolean;
  /** Custom style overrides */
  style?: ViewStyle;
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
    subtitleColor: `rgba(255, 255, 255, 0.7)`,
    iconBgColor: `rgba(40, 179, 163, 0.3)`, // accent with opacity
    iconColor: colors.text.white,
  },
  accent: {
    backgroundColor: colors.primary.accent,
    titleColor: colors.text.white,
    subtitleColor: `rgba(255, 255, 255, 0.8)`,
    iconBgColor: `rgba(255, 255, 255, 0.3)`,
    iconColor: colors.text.white,
  },
  light: {
    backgroundColor: colors.background.primary,
    titleColor: colors.text.primary,
    subtitleColor: colors.text.secondary,
    iconBgColor: `rgba(40, 179, 163, 0.15)`,
    iconColor: colors.primary.accent,
  },
};

export default function ScreenHeader({
  title,
  subtitle,
  icon,
  variant = 'primary',
  compact = true,
  style,
}: ScreenHeaderProps) {
  const variantStyle = variantStyles[variant];

  if (compact && icon) {
    // Compact row layout with icon
    return (
      <View style={[styles.compactContainer, { backgroundColor: variantStyle.backgroundColor }, style]}>
        <View style={[styles.iconContainer, { backgroundColor: variantStyle.iconBgColor }]}>
          <Ionicons name={icon} size={26} color={variantStyle.iconColor} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.compactTitle, { color: variantStyle.titleColor }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={[styles.compactSubtitle, { color: variantStyle.subtitleColor }]} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
    );
  }

  // Stacked/centered layout (for home screen style)
  return (
    <View style={[styles.stackedContainer, { backgroundColor: variantStyle.backgroundColor }, style]}>
      {icon && (
        <View style={[styles.stackedIconContainer, { backgroundColor: variantStyle.iconBgColor }]}>
          <Ionicons name={icon} size={28} color={variantStyle.iconColor} />
        </View>
      )}
      <Text style={[styles.stackedTitle, { color: variantStyle.titleColor }]}>
        {title}
      </Text>
      {subtitle && (
        <Text style={[styles.stackedSubtitle, { color: variantStyle.subtitleColor }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

/**
 * Simple header for Settings-style screens
 * Just title + subtitle, no background color
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
      {subtitle && (
        <Text style={styles.simpleSubtitle}>{subtitle}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Compact (row) layout
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  compactTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  compactSubtitle: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },

  // Stacked (centered) layout
  stackedContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  stackedIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stackedTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  stackedSubtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },

  // Simple (settings-style) layout
  simpleContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  simpleTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  simpleSubtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
});
