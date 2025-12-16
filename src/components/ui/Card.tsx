/**
 * Card - Reusable card container component
 * Provides consistent styling for content cards
 */

import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, borderRadius, spacing, shadows, layout } from '../../theme/theme';

interface CardProps {
  children: ReactNode;
  /** Card variant */
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  /** Background color override */
  backgroundColor?: string;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Custom style */
  style?: ViewStyle;
  /** Make card pressable */
  onPress?: () => void;
  /** Full width with screen margin */
  fullWidth?: boolean;
}

export default function Card({
  children,
  variant = 'default',
  backgroundColor,
  padding = 'md',
  style,
  onPress,
  fullWidth = false,
}: CardProps) {
  const cardStyle = [
    styles.base,
    variantStyles[variant],
    paddingStyles[padding],
    backgroundColor ? { backgroundColor } : {},
    fullWidth && styles.fullWidth,
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    ...shadows.sm,
  },
  elevated: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  outlined: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  filled: {
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.md,
  },
});

const paddingStyles = StyleSheet.create({
  none: {
    padding: 0,
  },
  sm: {
    padding: spacing.sm,
  },
  md: {
    padding: layout.cardPadding,
  },
  lg: {
    padding: spacing.lg,
  },
});

const styles = StyleSheet.create({
  base: {},
  fullWidth: {
    marginHorizontal: layout.screenPadding,
  },
});
