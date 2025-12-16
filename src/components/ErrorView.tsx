/**
 * ErrorView Component
 * Displays error states with retry functionality
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';

interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title,
  message,
  onRetry,
  fullScreen = false,
  icon = 'alert-circle-outline',
}) => {
  const { t } = useLanguage();

  const content = (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.status.error} />
      <Text style={styles.title}>{title || t('error')}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Ionicons name="refresh-outline" size={20} color={colors.text.inverse} />
          <Text style={styles.retryText}>{t('tryAgain')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (fullScreen) {
    return <View style={styles.fullScreen}>{content}</View>;
  }

  return content;
};

/**
 * EmptyStateView - For when there's no data
 */
interface EmptyStateViewProps {
  title: string;
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({
  title,
  message,
  icon = 'folder-open-outline',
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon} size={80} color={colors.text.tertiary} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={styles.emptyMessage}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * NetworkErrorView - Specific for network/connection errors
 */
interface NetworkErrorViewProps {
  onRetry?: () => void;
}

export const NetworkErrorView: React.FC<NetworkErrorViewProps> = ({ onRetry }) => {
  const { t } = useLanguage();

  return (
    <ErrorView
      icon="cloud-offline-outline"
      title={t('networkError')}
      message={t('checkConnection')}
      onRetry={onRetry}
      fullScreen
    />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  message: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
  },
  retryText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    flex: 1,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: fontSize.md,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
    lineHeight: 22,
  },
  actionButton: {
    backgroundColor: colors.primary.accent,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.xl,
  },
  actionText: {
    color: colors.text.inverse,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
