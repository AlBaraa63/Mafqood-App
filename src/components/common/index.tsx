/**
 * Common Components Index
 * Export all reusable UI components
 */

export { Button } from './Button';
export { Input } from './Input';
export { Card } from './Card';
export { Stepper } from './Stepper';
export { Header } from './Header';

// Additional common components

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../theme';

// ===== Loading Spinner =====

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = colors.primary[500],
  text,
}) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size={size} color={color} />
    {text && <Text style={styles.loadingText}>{text}</Text>}
  </View>
);

// ===== Empty State =====

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
}) => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyIcon}>{icon}</Text>
    <Text style={styles.emptyTitle}>{title}</Text>
    {description && <Text style={styles.emptyDescription}>{description}</Text>}
    {actionLabel && onAction && (
      <TouchableOpacity style={styles.emptyAction} onPress={onAction}>
        <Text style={styles.emptyActionText}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ===== Status Chip =====

interface StatusChipProps {
  status: 'open' | 'matched' | 'closed';
  label: string;
  size?: 'small' | 'medium';
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  size = 'medium',
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'open':
        return {
          light: colors.accent[50],
          main: colors.accent[500],
          dark: colors.accent[800],
        };
      case 'matched':
        return {
          light: colors.highlight[100],
          main: colors.highlight[400],
          dark: colors.highlight[700],
        };
      case 'closed':
        return { light: colors.neutral[100], main: colors.neutral[500], dark: colors.neutral[700] };
      default:
        return colors.info;
    }
  };
  
  const statusColor = getStatusColor();
  
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: statusColor.light },
        size === 'small' && styles.chipSmall,
      ]}
    >
      <View style={[styles.chipDot, { backgroundColor: statusColor.main }]} />
      <Text
        style={[
          styles.chipText,
          { color: statusColor.dark },
          size === 'small' && styles.chipTextSmall,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

// ===== Confidence Badge =====

interface ConfidenceBadgeProps {
  confidence: 'high' | 'medium' | 'low';
  label: string;
  percentage?: number;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  label,
  percentage,
}) => {
  const getConfidenceColor = () => {
    switch (confidence) {
      case 'high':
        return {
          light: colors.accent[50],
          main: colors.accent[600],
          dark: colors.accent[800],
        };
      case 'medium':
        return {
          light: colors.highlight[100],
          main: colors.highlight[500],
          dark: colors.highlight[700],
        };
      case 'low':
        return { light: colors.neutral[200], main: colors.neutral[500], dark: colors.neutral[700] };
      default:
        return colors.info;
    }
  };
  
  const confColor = getConfidenceColor();
  
  return (
    <View style={[styles.badge, { backgroundColor: confColor.light }]}>
      <Text style={[styles.badgeText, { color: confColor.dark }]}>
        {label}
        {percentage !== undefined && ` (${Math.round(percentage)}%)`}
      </Text>
    </View>
  );
};

// ===== Type Chip =====

interface TypeChipProps {
  type: 'lost' | 'found';
  label: string;
}

export const TypeChip: React.FC<TypeChipProps> = ({ type, label }) => {
  const isLost = type === 'lost';
  
  return (
    <View
      style={[
        styles.typeChip,
        { backgroundColor: isLost ? colors.primary[100] : colors.accent[100] },
      ]}
    >
      <Text
        style={[
          styles.typeChipText,
          { color: isLost ? colors.primary[600] : colors.accent[700] },
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

// ===== Item Thumbnail =====

interface ItemThumbnailProps {
  imageUrl: string;
  size?: number;
}

export const ItemThumbnail: React.FC<ItemThumbnailProps> = ({
  imageUrl,
  size = 80,
}) => (
  <Image
    source={{ uri: imageUrl }}
    style={[
      styles.thumbnail,
      { width: size, height: size, borderRadius: borderRadius.md },
    ]}
    resizeMode="cover"
  />
);

// ===== Divider =====

interface DividerProps {
  spacing?: number;
}

export const Divider: React.FC<DividerProps> = ({ spacing: spacingValue = spacing.md }) => (
  <View style={[styles.divider, { marginVertical: spacingValue }]} />
);

// ===== Section Header =====

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  actionLabel,
  onAction,
}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {actionLabel && onAction && (
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>{actionLabel}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  
  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  emptyActionText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
  
  // Chips
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  chipSmall: {
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
  },
  chipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
  chipText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  chipTextSmall: {
    fontSize: typography.fontSize.xs,
  },
  
  // Badge
  badge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  
  // Type Chip
  typeChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  typeChipText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
  },
  
  // Thumbnail
  thumbnail: {
    backgroundColor: colors.neutral[200],
  },
  
  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.neutral[200],
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  sectionAction: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
});
