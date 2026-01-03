/**
 * Report Success Screen
 * Shows success message after report submission
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/common';
import { useTranslation } from '../../hooks';
import { ReportStackParamList } from '../../types';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportSuccess'>;
type RouteProps = RouteProp<ReportStackParamList, 'ReportSuccess'>;

export const ReportSuccessScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { type, item, matchCount, aiError } = route.params;
  
  const isLost = type === 'lost';
  
  const handleViewMatches = () => {
    // Navigate to matches screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'ReportTypeSelect' as any,
          },
        ],
      })
    );
    // Note: In a real app, you'd navigate to the Matches tab
    // navigation.navigate('MatchesTab' as any);
  };
  
  const handleGoHome = () => {
    // Reset stack and go to home
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'ReportTypeSelect' as any,
          },
        ],
      })
    );
    // Note: In a real app, you'd navigate to the Home tab
    // navigation.navigate('HomeTab' as any);
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{isLost ? '🔍' : '🎉'}</Text>
        </View>
        
        {/* Success Message */}
        <Text style={styles.title}>
          {isLost ? t('success_lost_title') : t('success_found_title')}
        </Text>
        <Text style={styles.message}>
          {isLost ? t('success_lost_message') : t('success_found_message')}
        </Text>
        
        {/* AI Warning */}
        {aiError && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>{aiError}</Text>
          </View>
        )}
        
        {/* Match Count */}
        {matchCount > 0 && (
          <View style={styles.matchBanner}>
            <Text style={styles.matchIcon}>✨</Text>
            <Text style={styles.matchText}>
              {t('success_matches_found').replace('{count}', matchCount.toString())}
            </Text>
          </View>
        )}
        
        {/* Item Preview */}
        <View style={styles.itemPreview}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemLocation}>📍 {item.location}</Text>
        </View>
        
        {/* Action Buttons */}
        <View style={styles.buttons}>
          {matchCount > 0 && (
            <Button
              title={t('view_potential_matches')}
              onPress={handleViewMatches}
              style={styles.primaryButton}
            />
          )}
          <Button
            title={t('go_home')}
            onPress={handleGoHome}
            variant={matchCount > 0 ? 'outline' : 'primary'}
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent[50],
    borderWidth: 1,
    borderColor: colors.accent[200],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  matchIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  matchText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent[700],
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning[50],
    borderWidth: 1,
    borderColor: colors.warning[200],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.warning[700],
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  itemPreview: {
    width: '100%',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  itemLocation: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  buttons: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
  },
});

export default ReportSuccessScreen;
