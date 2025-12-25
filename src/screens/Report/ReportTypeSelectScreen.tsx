/**
 * Report Type Select Screen
 * Step 1: Choose between lost or found item (on-brand layout)
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Stepper } from '../../components/common';
import { useTranslation } from '../../hooks';
import { useReportFormStore } from '../../hooks/useStore';
import { ReportStackParamList } from '../../types';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportTypeSelect'>;

export const ReportTypeSelectScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { setType, resetForm } = useReportFormStore();
  
  React.useEffect(() => {
    // Reset form when entering this screen
    resetForm();
  }, []);
  
  const handleSelectType = (type: 'lost' | 'found') => {
    setType(type);
    navigation.navigate('ReportPhoto', { type });
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Stepper
          currentStep={1}
          totalSteps={6}
          labels={[
            t('step_label_type'),
            t('step_label_photo'),
            t('step_label_details'),
            t('step_label_where'),
            t('step_label_contact'),
            t('step_label_review'),
          ]}
        />
        
        <View style={styles.header}>
          <Text style={styles.title}>{t('report_type_title')}</Text>
          <Text style={styles.subtitle}>{t('report_intro_subtitle')}</Text>
        </View>
        
        <View style={styles.options}>
          <Card
            style={styles.optionCard}
            variant="outlined"
            onPress={() => handleSelectType('lost')}
          >
            <View style={[styles.optionIconContainer, styles.lostIconContainer]}>
              <MaterialCommunityIcons name="alert-outline" size={28} color={colors.primary[500]} />
            </View>
            <Text style={styles.optionTitle}>{t('report_type_lost')}</Text>
            <Text style={styles.optionDesc}>{t('report_type_lost_desc')}</Text>
            <View style={styles.optionHint}>
              <MaterialCommunityIcons name="arrow-right-bottom-bold" size={16} color={colors.primary[500]} />
              <Text style={styles.optionHintText}>{t('report_type_lost_hint')}</Text>
            </View>
          </Card>
          
          <Card
            style={styles.optionCard}
            variant="outlined"
            onPress={() => handleSelectType('found')}
          >
            <View style={[styles.optionIconContainer, styles.foundIconContainer]}>
              <MaterialCommunityIcons name="hand-heart" size={28} color={colors.accent[600]} />
            </View>
            <Text style={styles.optionTitle}>{t('report_type_found')}</Text>
            <Text style={styles.optionDesc}>{t('report_type_found_desc')}</Text>
            <View style={styles.optionHint}>
              <MaterialCommunityIcons name="arrow-right-bottom-bold" size={16} color={colors.accent[600]} />
              <Text style={styles.optionHintText}>{t('report_type_found_hint')}</Text>
            </View>
          </Card>
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
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing['2xl'],
  },
  options: {
    gap: spacing.lg,
  },
  optionCard: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.sm,
  },
  optionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  lostIconContainer: {
    backgroundColor: colors.primary[100],
  },
  foundIconContainer: {
    backgroundColor: colors.accent[100],
  },
  optionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  optionDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  optionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  optionHintText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});

export default ReportTypeSelectScreen;
