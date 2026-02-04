import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../theme';

type Status = 'open' | 'matched' | 'closed' | 'high' | 'medium' | 'low';

interface Props {
  label: string;
  status: Status;
}

export const StatusChip: React.FC<Props> = ({ label, status }) => {
  const palette =
    status === 'open'
      ? { bg: '#E8F5E9', text: colors.semantic.success }
      : status === 'matched'
        ? { bg: '#FFF3E0', text: colors.semantic.warning }
        : status === 'closed'
          ? { bg: colors.neutral[100], text: colors.neutral[600] }
          : status === 'high'
            ? { bg: '#E8F5E9', text: colors.semantic.success }
            : status === 'medium'
              ? { bg: '#FFF3E0', text: colors.semantic.warning }
              : { bg: colors.neutral[100], text: colors.neutral[600] };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg }]}>
      <View style={[styles.dot, { backgroundColor: palette.text }]} />
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
});

export default StatusChip;
