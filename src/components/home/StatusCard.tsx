/**
 * Status Card Component
 * Shows user's active reports and match count
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { colors, spacing, typography } from '../../theme';

interface StatusCardProps {
  activeReports: number;
  newMatches: number;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  activeReports,
  newMatches,
}) => {
  return (
    <Card variant="elevated" style={styles.container}>
      <View style={styles.content}>
        <View style={styles.stat}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.primary[500]}20` }]}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={24}
              color={colors.primary[500]}
            />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statValue}>{activeReports}</Text>
            <Text style={styles.statLabel}>Active Reports</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.highlight[500]}20` }]}>
            <MaterialCommunityIcons
              name="star-outline"
              size={24}
              color={colors.highlight[500]}
            />
          </View>
          <View style={styles.statText}>
            <Text style={styles.statValue}>{newMatches}</Text>
            <Text style={styles.statLabel}>New Matches</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statText: {
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 48,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.md,
  },
});

export default StatusCard;
