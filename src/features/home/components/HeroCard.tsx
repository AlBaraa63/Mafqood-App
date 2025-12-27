/**
 * Hero Card Component
 * Primary action card for reporting lost/found items
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button } from '../common/Button';
import { colors, spacing, borderRadius, shadows, typography } from '../../../theme';

interface HeroCardProps {
  onReportLost: () => void;
  onReportFound: () => void;
}

export const HeroCard: React.FC<HeroCardProps> = ({
  onReportLost,
  onReportFound,
}) => {
  return (
    <LinearGradient
      colors={[colors.primary[500], colors.primary[600]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.container, shadows.lg]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="magnify-scan"
            size={28}
            color={colors.neutral.white}
          />
          <Text style={styles.title}>Find Your Items</Text>
        </View>

        <Text style={styles.subtitle}>
          Report lost or found items and let AI find matches instantly
        </Text>

        <View style={styles.buttonContainer}>
          <Button
            title="Report Lost"
            onPress={onReportLost}
            variant="primary"
            size="large"
            fullWidth
            icon={
              <MaterialCommunityIcons
                name="alert-circle-outline"
                size={20}
                color={colors.neutral.white}
              />
            }
            style={styles.button}
          />
          <Button
            title="Report Found"
            onPress={onReportFound}
            variant="secondary"
            size="large"
            fullWidth
            icon={
              <MaterialCommunityIcons
                name="hand-heart"
                size={20}
                color={colors.neutral.white}
              />
            }
            style={styles.button}
          />
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  content: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[100],
    lineHeight: typography.lineHeight.normal,
  },
  buttonContainer: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    backgroundColor: 'transparent',
  },
});

export default HeroCard;
