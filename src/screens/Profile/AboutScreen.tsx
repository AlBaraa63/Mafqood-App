/**
 * About Screen
 * Static information about Mafqood
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card } from '../../components/common';
import { useTranslation } from '../../hooks';
import { ProfileStackParamList } from '../../types';
import { colors, typography, spacing } from '../../theme';

export const AboutScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <Text style={styles.title}>{t('about_title')}</Text>
        <Text style={styles.subtitle}>{t('app_name')} — {t('app_tagline')}</Text>

        <Card style={styles.card} variant="outlined">
          <Text style={styles.sectionTitle}>{t('about_description')}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('about_version')}</Text>
            <Text style={styles.metaValue}>1.0.0</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('about_privacy')}</Text>
            <Text style={styles.metaValue}>{t('privacy_assurance')}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('about_terms')}</Text>
            <Text style={styles.metaValue}>{t('terms_checkbox')}</Text>
          </View>
        </Card>

        <Button
          title={t('go_home')}
          onPress={() => navigation.goBack()}
          variant="outline"
          fullWidth
          style={styles.backButton}
        />
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
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  card: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: 22,
  },
  metaRow: {
    marginTop: spacing.sm,
  },
  metaLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
  },
  metaValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  backButton: {
    marginTop: spacing.md,
  },
});

export default AboutScreen;
