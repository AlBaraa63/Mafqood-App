/**
 * Mafqood Mobile - Home Screen
 * RTL-first, native-quality smart city app design
 * Follows DubaiNow-level polish with bilingual Arabic/English support
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { colors, borderRadius, typography, spacing, shadows, layout } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';
import { BottomTabParamList } from '../types/itemTypes';
import { MafqoodLogo } from '../components/ui/MafqoodLogo';

type NavigationProp = BottomTabNavigationProp<BottomTabParamList>;

// Dynamic sizing helper
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_HEIGHT < 700;
const isMediumScreen = SCREEN_HEIGHT >= 700 && SCREEN_HEIGHT < 850;
const isLargeScreen = SCREEN_HEIGHT >= 850;

// Scale factor for dynamic sizing
const scale = (size: number) => {
  const baseHeight = 700;
  return Math.round(size * (SCREEN_HEIGHT / baseHeight));
};

// ========================================
// Main Home Screen
// ========================================

export default function HomeScreen() {
  const { t, language, isRTL, setLanguage } = useLanguage();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  // Item categories for quick access
  const categories = [
    { icon: 'phone-portrait' as const, label: language === 'en' ? 'Phones' : 'هواتف', color: '#3B82F6' },
    { icon: 'wallet' as const, label: language === 'en' ? 'Wallets' : 'محافظ', color: '#10B981' },
    { icon: 'key' as const, label: language === 'en' ? 'Keys' : 'مفاتيح', color: '#F59E0B' },
    { icon: 'bag' as const, label: language === 'en' ? 'Bags' : 'حقائب', color: '#8B5CF6' },
    { icon: 'document-text' as const, label: language === 'en' ? 'IDs' : 'هوية', color: '#EF4444' },
    { icon: 'ellipsis-horizontal' as const, label: language === 'en' ? 'Other' : 'أخرى', color: '#6B7280' },
  ];

  // How it works steps
  const howItWorksSteps = [
    { num: '1', icon: 'camera' as const, title: t('how_step1_title'), desc: t('how_step1_desc') },
    { num: '2', icon: 'location' as const, title: t('home_step_2_heading'), desc: t('home_step_2_desc') },
    { num: '3', icon: 'sparkles' as const, title: t('home_step_3_heading'), desc: t('home_step_3_desc') },
    { num: '4', icon: 'notifications' as const, title: t('home_step_4_heading'), desc: t('home_step_4_desc') },
  ];

  // Dynamic icon sizes
  const iconSize = {
    header: scale(18),
    action: scale(22),
    category: scale(22),
    step: scale(16),
    footer: scale(14),
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.contentWrapper}>
        {/* ================================
            HERO SECTION
            ================================ */}
        <View style={styles.heroContainer}>
          {/* Top Header Bar */}
          <View style={[styles.headerBar, isRTL && styles.rtlRow]}>
            {/* Logo */}
            <MafqoodLogo size={32} showText />

            {/* Right side: Language + Notifications + Profile */}
            <View style={[styles.headerRight, isRTL && styles.rtlRow]}>
              {/* Language Toggle */}
              <TouchableOpacity
                style={styles.langToggle}
                onPress={toggleLanguage}
                activeOpacity={0.7}
              >
                <Text style={styles.langToggleText}>
                  {language === 'en' ? 'ع' : 'EN'}
                </Text>
              </TouchableOpacity>

              {/* Notification Bell */}
              <TouchableOpacity
                style={styles.notificationBtn}
                onPress={() => navigation.navigate('Matches')}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={iconSize.header} color={colors.text.white} />
              </TouchableOpacity>

              {/* Profile Avatar Placeholder */}
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => navigation.navigate('Settings')}
                activeOpacity={0.7}
              >
                <Ionicons name="person" size={iconSize.header} color={colors.text.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Main Headline */}
          <Text style={[styles.heroTitle, isRTL && styles.rtlText]}>
            {t('home_hero_title')}
          </Text>

          {/* Subheadline */}
          <Text style={[styles.heroSubtitle, isRTL && styles.rtlText]}>
            {t('home_hero_subtitle')}
          </Text>
        </View>

        {/* ================================
            QUICK ACTIONS - All 3 buttons in one row
            ================================ */}
        <View style={styles.quickActionsSection}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.lostBtn]}
            onPress={() => navigation.navigate('Report', { type: 'lost' })}
            activeOpacity={0.85}
          >
            <View style={styles.actionBtnIcon}>
              <Ionicons name="search" size={iconSize.action} color={colors.text.white} />
            </View>
            <Text style={styles.actionBtnText}>{t('nav_report_lost')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.foundBtn]}
            onPress={() => navigation.navigate('Report', { type: 'found' })}
            activeOpacity={0.85}
          >
            <View style={styles.actionBtnIcon}>
              <Ionicons name="hand-left" size={iconSize.action} color={colors.text.white} />
            </View>
            <Text style={styles.actionBtnText}>{t('nav_report_found')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.matchesBtn]}
            onPress={() => navigation.navigate('Matches')}
            activeOpacity={0.85}
          >
            <View style={[styles.actionBtnIcon, styles.matchesBtnIcon]}>
              <Ionicons name="git-compare" size={iconSize.action} color={colors.primary.accent} />
            </View>
            <Text style={styles.matchesBtnText}>{t('nav_matches')}</Text>
          </TouchableOpacity>
        </View>

        {/* ================================
            ITEM CATEGORIES
            ================================ */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {language === 'en' ? 'Browse by Category' : 'تصفح حسب الفئة'}
          </Text>
          <View style={[styles.categoriesGrid, isRTL && styles.rtlRow]}>
            {categories.map((cat, index) => (
              <TouchableOpacity key={index} style={styles.categoryItem} activeOpacity={0.7}>
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                  <Ionicons name={cat.icon} size={iconSize.category} color={cat.color} />
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ================================
            HOW MAFQOOD WORKS - Vertical list with connector lines
            ================================ */}
        <View style={styles.howItWorksSection}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {t('home_how_it_works_title')}
          </Text>

          <View style={styles.stepsCard}>
            {howItWorksSteps.map((step, index) => (
              <View key={index} style={[styles.stepRow, isRTL && styles.rtlRow]}>
                {/* Step Number Column */}
                <View style={styles.stepNumberCol}>
                  <View style={styles.stepNumCircle}>
                    <Text style={styles.stepNumText}>{step.num}</Text>
                  </View>
                  {index < howItWorksSteps.length - 1 && <View style={styles.stepConnector} />}
                </View>
                
                {/* Step Content */}
                <View style={styles.stepContent}>
                  <View style={[styles.stepHeader, isRTL && styles.rtlRow]}>
                    <View style={styles.stepIconBox}>
                      <Ionicons name={step.icon} size={iconSize.step} color={colors.primary.accent} />
                    </View>
                    <Text style={[styles.stepTitle, isRTL && styles.rtlText]}>{step.title}</Text>
                  </View>
                  <Text style={[styles.stepDesc, isRTL && styles.rtlText]} numberOfLines={2}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* ================================
            FOOTER - Dubai Branding
            ================================ */}
        <View style={styles.footer}>
          <View style={styles.footerContent}>
            <Ionicons name="location" size={iconSize.footer} color={colors.text.secondary} />
            <Text style={styles.footerText}>
              {language === 'en' ? 'Serving Dubai, UAE' : 'خدمة دبي، الإمارات'}
            </Text>
          </View>
          <View style={[styles.footerBadges, isRTL && styles.rtlRow]}>
            <View style={styles.footerBadge}>
              <Ionicons name="shield-checkmark" size={iconSize.footer} color={colors.primary.accent} />
              <Text style={styles.footerBadgeText}>{language === 'en' ? 'Secure' : 'آمن'}</Text>
            </View>
            <View style={styles.footerBadge}>
              <Ionicons name="time" size={iconSize.footer} color={colors.primary.accent} />
              <Text style={styles.footerBadgeText}>{language === 'en' ? '24/7' : '٢٤/٧'}</Text>
            </View>
            <View style={styles.footerBadge}>
              <Ionicons name="heart" size={iconSize.footer} color={colors.primary.accent} />
              <Text style={styles.footerBadgeText}>{language === 'en' ? 'Free' : 'مجاني'}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// ========================================
// Styles
// ========================================

// Dynamic values
const dynamicSpacing = {
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
};

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
  },

  // RTL helpers
  rtlRow: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  // ================================
  // HERO SECTION
  // ================================
  heroContainer: {
    backgroundColor: colors.primary.dark,
    marginHorizontal: -layout.screenPadding,
    paddingHorizontal: layout.screenPadding,
    paddingTop: dynamicSpacing.sm,
    paddingBottom: dynamicSpacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    marginBottom: dynamicSpacing.md,
  },

  // Header Bar
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dynamicSpacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dynamicSpacing.sm,
  },
  langToggle: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langToggleText: {
    fontSize: scale(12),
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },
  notificationBtn: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtn: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  heroTitle: {
    fontSize: scale(24),
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    textAlign: 'center',
    marginBottom: dynamicSpacing.xs,
  },
  heroSubtitle: {
    fontSize: scale(13),
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: scale(18),
    paddingHorizontal: spacing.sm,
  },

  // ================================
  // QUICK ACTIONS - 3 buttons in one row
  // ================================
  quickActionsSection: {
    flexDirection: 'row',
    gap: dynamicSpacing.sm,
    marginBottom: dynamicSpacing.md,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: dynamicSpacing.md,
    paddingHorizontal: dynamicSpacing.xs,
    borderRadius: borderRadius.md,
  },
  lostBtn: {
    backgroundColor: colors.primary.dark,
  },
  foundBtn: {
    backgroundColor: colors.primary.accent,
  },
  matchesBtn: {
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  actionBtnIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: dynamicSpacing.xs,
  },
  matchesBtnIcon: {
    backgroundColor: colors.primary.accentLight,
  },
  actionBtnText: {
    fontSize: scale(12),
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    textAlign: 'center',
  },
  matchesBtnText: {
    fontSize: scale(12),
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },

  // ================================
  // CATEGORIES
  // ================================
  categoriesSection: {
    marginBottom: dynamicSpacing.md,
  },
  sectionTitle: {
    fontSize: scale(15),
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: dynamicSpacing.sm,
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryItem: {
    alignItems: 'center',
    width: '16%',
  },
  categoryIcon: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: dynamicSpacing.xs,
  },
  categoryLabel: {
    fontSize: scale(11),
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // ================================
  // HOW IT WORKS - Vertical list
  // ================================
  howItWorksSection: {
    flex: 1,
    marginBottom: dynamicSpacing.sm,
  },
  stepsCard: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: dynamicSpacing.md,
    ...shadows.sm,
  },
  stepRow: {
    flexDirection: 'row',
    flex: 1,
  },
  stepNumberCol: {
    alignItems: 'center',
    width: scale(28),
    marginRight: dynamicSpacing.sm,
  },
  stepNumCircle: {
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontSize: scale(11),
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },
  stepConnector: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border.light,
    marginVertical: 3,
  },
  stepContent: {
    flex: 1,
    paddingBottom: dynamicSpacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dynamicSpacing.xs,
  },
  stepIconBox: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(8),
    backgroundColor: colors.primary.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: dynamicSpacing.sm,
  },
  stepTitle: {
    fontSize: scale(13),
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  stepDesc: {
    fontSize: scale(11),
    color: colors.text.secondary,
    lineHeight: scale(16),
    marginLeft: scale(34),
  },

  // ================================
  // FOOTER
  // ================================
  footer: {
    paddingVertical: dynamicSpacing.md,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dynamicSpacing.xs,
    marginBottom: dynamicSpacing.sm,
  },
  footerText: {
    fontSize: scale(13),
    color: colors.text.secondary,
  },
  footerBadges: {
    flexDirection: 'row',
    gap: dynamicSpacing.lg,
  },
  footerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dynamicSpacing.xs,
  },
  footerBadgeText: {
    fontSize: scale(12),
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
});
