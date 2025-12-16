/**
 * Section - Reusable section container with title
 * For grouping related content on screens
 */

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography, layout } from '../../theme/theme';

interface SectionProps {
  /** Section title */
  title?: string;
  /** Section subtitle/description */
  subtitle?: string;
  children: ReactNode;
  /** Custom style */
  style?: ViewStyle;
  /** Add horizontal padding */
  padded?: boolean;
  /** Spacing between items */
  gap?: number;
}

export default function Section({
  title,
  subtitle,
  children,
  style,
  padded = true,
  gap = spacing.sm,
}: SectionProps) {
  return (
    <View style={[styles.container, padded && styles.padded, style]}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
      <View style={[styles.content, { gap }]}>{children}</View>
    </View>
  );
}

/**
 * SectionDivider - Visual separator between sections
 */
export function SectionDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  padded: {
    paddingHorizontal: layout.screenPadding,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  content: {},
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
    marginHorizontal: layout.screenPadding,
  },
});
