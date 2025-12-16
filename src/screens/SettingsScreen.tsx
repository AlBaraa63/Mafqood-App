/**
 * Mafqood Mobile - Settings Screen
 * Enhanced with brand logo, AI tech info, language toggle, privacy, data management
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, borderRadius, typography, spacing, shadows, layout } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';
import { resetDatabase } from '../api/client';
import { Screen, Section, Card } from '../components/ui';

export default function SettingsScreen() {
  const { t, language, setLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const handleLanguageToggle = async () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    
    // Change language immediately
    await setLanguage(newLang);
    
    // Show info about RTL
    if (newLang === 'ar') {
      Alert.alert(
        'تم تغيير اللغة',
        'قد تحتاج إلى إعادة تشغيل التطبيق للحصول على التخطيط الصحيح من اليمين لليسار.',
        [{ text: 'حسناً' }]
      );
    }
  };

  const handleResetData = () => {
    Alert.alert(
      t('settings_reset_title'),
      t('settings_reset_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('settings_reset_button'),
          style: 'destructive',
          onPress: async () => {
            try {
              await resetDatabase();
              await AsyncStorage.clear();
              await queryClient.invalidateQueries();
              Alert.alert(t('success'), t('settings_reset_success'));
            } catch (error) {
              Alert.alert(t('error'), t('settings_reset_error'));
            }
          },
        },
      ]
    );
  };

  const handleOpenPrivacy = () => {
    Linking.openURL('https://mafqood.vercel.app/privacy-policy.html');
  };

  const handleOpenTerms = () => {
    Linking.openURL('https://mafqood.vercel.app/terms-of-service.html');
  };

  return (
    <Screen backgroundColor={colors.background.secondary} statusBarStyle="dark-content">
      {/* Brand Header */}
      <LinearGradient
        colors={[colors.primary.dark, '#0D3847']}
        style={[styles.brandHeader, { paddingTop: insets.top + spacing.md }]}
      >
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/Mafqood.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.brandTitle}>{t('app_title')}</Text>
        <Text style={styles.brandTagline}>{t('tagline')}</Text>
        
        {/* AI Badge */}
        <View style={styles.aiBadge}>
          <Ionicons name="sparkles" size={12} color={colors.primary.accent} />
          <Text style={styles.aiBadgeText}>{t('badge_ai')}</Text>
        </View>
      </LinearGradient>

      {/* Language Section */}
      <Section title={t('settings_language')} style={styles.section}>
        <TouchableOpacity style={styles.languageCard} onPress={handleLanguageToggle}>
          <View style={styles.languageRow}>
            {/* English */}
            <View style={[
              styles.languageOption, 
              language === 'en' && styles.languageOptionActive
            ]}>
              <Text style={styles.languageFlag}>🇬🇧</Text>
              <Text style={[
                styles.languageLabel,
                language === 'en' && styles.languageLabelActive,
              ]}>
                English
              </Text>
              {language === 'en' && (
                <Ionicons name="checkmark-circle" size={18} color={colors.primary.dark} />
              )}
            </View>

            {/* Divider */}
            <View style={styles.languageDivider} />

            {/* Arabic */}
            <View style={[
              styles.languageOption, 
              language === 'ar' && styles.languageOptionActive
            ]}>
              {language === 'ar' && (
                <Ionicons name="checkmark-circle" size={18} color={colors.primary.accent} />
              )}
              <Text style={[
                styles.languageLabel,
                language === 'ar' && styles.languageLabelActive,
              ]}>
                العربية
              </Text>
              <Text style={styles.languageFlag}>🇦🇪</Text>
            </View>
          </View>
          <Text style={styles.languageHint}>
            {t('settings_language_hint')}
          </Text>
        </TouchableOpacity>
      </Section>

      {/* About Mafqood Section */}
      <Section title={t('settings_about_title')} style={styles.section}>
        <Card variant="default" padding="md">
          <View style={styles.aboutRow}>
            <View style={[styles.aboutIcon, { backgroundColor: colors.primary.dark + '15' }]}>
              <Ionicons name="information-circle" size={20} color={colors.primary.dark} />
            </View>
            <View style={styles.aboutContent}>
              <Text style={styles.aboutText}>{t('settings_about_text')}</Text>
            </View>
          </View>
          
          {/* AI Technology Info */}
          <View style={styles.techDivider} />
          <View style={styles.aboutRow}>
            <View style={[styles.aboutIcon, { backgroundColor: colors.primary.accent + '15' }]}>
              <Ionicons name="eye" size={20} color={colors.primary.accent} />
            </View>
            <View style={styles.aboutContent}>
              <Text style={styles.techTitle}>{t('ai_powered_title')}</Text>
              <Text style={styles.techDesc}>{t('ai_powered_subtitle')}</Text>
            </View>
          </View>
          
          <View style={styles.featuresRow}>
            {[
              { icon: 'scan', text: t('ai_feature_visual') },
              { icon: 'analytics', text: t('ai_feature_similarity') },
              { icon: 'shield-checkmark', text: t('ai_feature_privacy') },
            ].map((feature, index) => (
              <View key={index} style={styles.featureChip}>
                <Ionicons name={feature.icon as any} size={12} color={colors.primary.accent} />
                <Text style={styles.featureText}>{feature.text}</Text>
              </View>
            ))}
          </View>
        </Card>
      </Section>

      {/* Legal Section */}
      <Section title={t('settings_privacy')} style={styles.section}>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItem} onPress={handleOpenPrivacy}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: colors.status.infoBg }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.status.info} />
              </View>
              <Text style={styles.menuItemText}>{t('settings_privacy_policy')}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.text.light} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleOpenTerms}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: `${colors.primary.dark}10` }]}>
                <Ionicons name="document-text-outline" size={18} color={colors.primary.dark} />
              </View>
              <Text style={styles.menuItemText}>{t('settings_terms')}</Text>
            </View>
            <Ionicons name="open-outline" size={18} color={colors.text.light} />
          </TouchableOpacity>
        </View>
      </Section>

      {/* Data Section */}
      <Section title={t('settings_data')} style={styles.section}>
        <TouchableOpacity style={styles.dangerCard} onPress={handleResetData}>
          <View style={styles.menuItemLeft}>
            <View style={[styles.menuIcon, { backgroundColor: colors.status.errorBg }]}>
              <Ionicons name="trash-outline" size={18} color={colors.status.error} />
            </View>
            <View style={styles.dangerTextContainer}>
              <Text style={styles.dangerText}>{t('settings_reset_button')}</Text>
              <Text style={styles.dangerSubtext}>{t('settings_reset_desc')}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.status.error} />
        </TouchableOpacity>
      </Section>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>v1.0.0</Text>
        <Text style={styles.footerDot}>•</Text>
        <Text style={styles.footerText}>{t('footer_rights')}</Text>
      </View>
      
      {/* Prototype Banner */}
      <View style={styles.prototypeBanner}>
        <Text style={styles.prototypeText}>{t('home_footer')}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Brand Header
  brandHeader: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
    marginBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    ...shadows.lg,
  },
  logo: {
    width: 56,
    height: 56,
  },
  brandTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    marginBottom: spacing.xs,
  },
  brandTagline: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  aiBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.white,
  },

  section: {
    marginTop: spacing.xs,
  },

  // Language
  languageCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: layout.cardPadding,
    ...shadows.sm,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  languageOptionActive: {
    backgroundColor: colors.background.tertiary,
  },
  languageFlag: {
    fontSize: 20,
  },
  languageLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  languageLabelActive: {
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  languageDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.sm,
  },
  languageHint: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // About
  aboutRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  aboutIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutContent: {
    flex: 1,
  },
  aboutText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  techDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },
  techTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  techDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  featuresRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary.accent + '10',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  featureText: {
    fontSize: 10,
    color: colors.primary.accent,
    fontWeight: typography.weights.medium,
  },

  // Menu
  menuCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: layout.cardPadding,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginHorizontal: layout.cardPadding,
  },

  // Danger
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: layout.cardPadding,
    borderWidth: 1,
    borderColor: `${colors.status.error}20`,
    ...shadows.sm,
  },
  dangerTextContainer: {
    flex: 1,
  },
  dangerText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.status.error,
  },
  dangerSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
    marginTop: 2,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  footerText: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
  },
  footerDot: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
  },
  prototypeBanner: {
    backgroundColor: colors.primary.dark + '08',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary.dark + '15',
  },
  prototypeText: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
    textAlign: 'center',
    lineHeight: 18,
  },
});
