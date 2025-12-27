/**
 * Quick Action Card Component
 * Secondary navigation and quick links
 */

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '../common/Card';
import { colors, spacing, typography } from '../../../theme';

interface QuickActionCardProps {
  onViewMatches: () => void;
  onViewReports: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  onViewMatches,
  onViewReports,
}) => {
  return (
    <View style={styles.container}>
      <Card
        variant="outlined"
        style={styles.card}
        onPress={onViewMatches}
      >
        <View style={styles.content}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.accent[500]}20` }]}>
            <MaterialCommunityIcons
              name="magnify-scan"
              size={24}
              color={colors.accent[500]}
            />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.title}>View Matches</Text>
            <Text style={styles.subtitle}>See potential matches</Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={colors.text.tertiary}
          />
        </View>
      </Card>

      <Card
        variant="outlined"
        style={styles.card}
        onPress={onViewReports}
      >
        <View style={styles.content}>
          <View style={[styles.iconBox, { backgroundColor: `${colors.primary[500]}20` }]}>
            <MaterialCommunityIcons
              name="history"
              size={24}
              color={colors.primary[500]}
            />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.title}>My Reports</Text>
            <Text style={styles.subtitle}>View your history</Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={colors.text.tertiary}
          />
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  card: {
    padding: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: 2,
  },
});

export default QuickActionCard;
