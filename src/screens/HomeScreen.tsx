/**
 * Mafqood Mobile - Home Screen
 * RTL-first, native-quality smart city app design
 * Follows DubaiNow-level polish with bilingual Arabic/English support
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  I18nManager,
  Animated,
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

// ========================================
// Reusable Components
// ========================================

interface FeatureChipProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  accentColor: string;
}

function FeatureChip({ icon, label, accentColor }: FeatureChipProps) {
  return (
    <View style={[styles.featureChip, { borderColor: accentColor + '30' }]}>
      <View style={[styles.featureChipIcon, { backgroundColor: accentColor + '15' }]}>
        <Ionicons name={icon} size={14} color={accentColor} />
      </View>
      <Text style={styles.featureChipText}>{label}</Text>
    </View>
  );
}

interface StepRowProps {
  stepNumber: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isLast: boolean;
  isRTL: boolean;
}

function StepRow({ stepNumber, icon, title, description, isLast, isRTL }: StepRowProps) {
  return (
    <View style={[styles.stepRow, isRTL && styles.rtlRow]}>
      {/* Step Number Column */}
      <View style={styles.stepNumberCol}>
        <View style={styles.stepNumberCircle}>
          <Text style={styles.stepNumberText}>{stepNumber}</Text>
        </View>
        {!isLast && <View style={styles.stepConnectorLine} />}
      </View>
      
      {/* Step Content */}
      <View style={[styles.stepContentCol, isRTL && styles.rtlTextAlign]}>
        <View style={[styles.stepHeader, isRTL && styles.rtlRow]}>
          <View style={styles.stepIconBox}>
            <Ionicons name={icon} size={16} color={colors.primary.accent} />
          </View>
          <Text style={[styles.stepTitle, isRTL && styles.rtlText]}>{title}</Text>
        </View>
        <Text style={[styles.stepDesc, isRTL && styles.rtlText]}>{description}</Text>
      </View>
    </View>
  );
}

// ========================================
// Main Home Screen
// ========================================

// Animated stat counter component
function AnimatedStat({ value, label, icon }: { value: string; label: string; icon: keyof typeof Ionicons.glyphMap }) {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.statItem, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={14} color={colors.primary.accent} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const { t, language, isRTL, setLanguage } = useLanguage();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  // Mock stats data (in real app, fetch from API)
  const stats = {
    reunited: '1,247',
    locations: '45+',
    avgTime: '2.5h',
  };

  // Feature chips data (3 chips that fit in one row)
  const featureChips: FeatureChipProps[] = [
    { icon: 'shield-checkmark', label: t('badge_privacy'), accentColor: colors.primary.dark },
    { icon: 'sparkles', label: t('badge_ai'), accentColor: '#8B5CF6' },
    { icon: 'globe', label: t('badge_citywide'), accentColor: '#F59E0B' },
  ];

  // How it works steps
  const howItWorksSteps = [
    { num: '1', icon: 'camera' as const, title: t('how_step1_title'), desc: t('how_step1_desc') },
    { num: '2', icon: 'location' as const, title: t('home_step_2_heading'), desc: t('home_step_2_desc') },
    { num: '3', icon: 'sparkles' as const, title: t('home_step_3_heading'), desc: t('home_step_3_desc') },
    { num: '4', icon: 'notifications' as const, title: t('home_step_4_heading'), desc: t('home_step_4_desc') },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bouncesZoom={false}
        maximumZoomScale={1}
        minimumZoomScale={1}
      >
        {/* ================================
            HERO SECTION
            ================================ */}
        <View style={styles.heroContainer}>
          {/* Top Header Bar */}
          <View style={[styles.headerBar, isRTL && styles.rtlRow]}>
            {/* Logo */}
            <MafqoodLogo size={36} showText />

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
                <Ionicons name="notifications-outline" size={20} color={colors.text.white} />
                {/* Notification badge */}
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>3</Text>
                </View>
              </TouchableOpacity>

              {/* Profile Avatar Placeholder */}
              <TouchableOpacity
                style={styles.profileBtn}
                onPress={() => navigation.navigate('Settings')}
                activeOpacity={0.7}
              >
                <Ionicons name="person" size={18} color={colors.text.white} />
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

          {/* Live Stats Row */}
          <View style={[styles.statsRow, isRTL && styles.rtlRow]}>
            <AnimatedStat value={stats.reunited} label={t('stats_reunited')} icon="checkmark-circle" />
            <View style={styles.statDivider} />
            <AnimatedStat value={stats.locations} label={t('stats_locations')} icon="location" />
            <View style={styles.statDivider} />
            <AnimatedStat value={stats.avgTime} label={t('stats_avg_time')} icon="time" />
          </View>
        </View>

        {/* ================================
            FEATURE CHIPS ROW (3 chips in one row)
            ================================ */}
        <View style={[styles.featuresRow, isRTL && styles.rtlRow]}>
          {featureChips.map((chip, index) => (
            <FeatureChip key={index} {...chip} />
          ))}
        </View>

        {/* ================================
            HOW MAFQOOD WORKS CARD
            ================================ */}
        <View style={styles.howItWorksSection}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
            {t('home_how_it_works_title')}
          </Text>

          <View style={styles.howItWorksCard}>
            {howItWorksSteps.map((step, index) => (
              <StepRow
                key={index}
                stepNumber={step.num}
                icon={step.icon}
                title={step.title}
                description={step.desc}
                isLast={index === howItWorksSteps.length - 1}
                isRTL={isRTL}
              />
            ))}
          </View>
        </View>

        {/* ================================
            QUICK ACTIONS ROW (All 3 in one row)
            ================================ */}
        <View style={styles.quickActionsSection}>
          <TouchableOpacity
            style={[styles.actionButtonCompact, { backgroundColor: colors.primary.dark }]}
            onPress={() => navigation.navigate('Report', { type: 'lost' })}
            activeOpacity={0.85}
          >
            <View style={styles.actionButtonIconCompact}>
              <Ionicons name="search" size={20} color={colors.text.white} />
            </View>
            <Text style={styles.actionButtonTextCompact} numberOfLines={2}>{t('nav_report_lost')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButtonCompact, { backgroundColor: colors.primary.accent }]}
            onPress={() => navigation.navigate('Report', { type: 'found' })}
            activeOpacity={0.85}
          >
            <View style={styles.actionButtonIconCompact}>
              <Ionicons name="hand-left" size={20} color={colors.text.white} />
            </View>
            <Text style={styles.actionButtonTextCompact} numberOfLines={2}>{t('nav_report_found')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.matchesButtonCompact}
            onPress={() => navigation.navigate('Matches')}
            activeOpacity={0.8}
          >
            <View style={styles.matchesIconCompact}>
              <Ionicons name="git-compare" size={20} color={colors.primary.accent} />
            </View>
            <Text style={styles.matchesTextCompact} numberOfLines={2}>{t('nav_matches')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ========================================
// Styles
// ========================================

const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  rtlTextAlign: {
    alignItems: 'flex-end',
  },

  // ================================
  // HERO SECTION
  // ================================
  heroContainer: {
    backgroundColor: colors.primary.dark,
    marginHorizontal: -layout.screenPadding,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
    marginBottom: spacing.lg,
  },

  // Header Bar
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  langToggle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  langToggleText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },
  notificationBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary.dark,
  },
  notificationBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },
  profileBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  heroTitle: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 36,
  },
  heroSubtitle: {
    fontSize: typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },

  // ================================
  // QUICK ACTIONS ROW (Compact)
  // ================================
  quickActionsSection: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButtonCompact: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  actionButtonIconCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  actionButtonTextCompact: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    textAlign: 'center',
  },
  matchesButtonCompact: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadows.sm,
  },
  matchesIconCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  matchesTextCompact: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },

  // ================================
  // FEATURE CHIPS
  // ================================
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  featureChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    ...shadows.sm,
  },
  featureChipIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureChipText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },

  // ================================
  // HOW IT WORKS
  // ================================
  howItWorksSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  howItWorksCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  stepNumberCol: {
    alignItems: 'center',
    width: 32,
    marginRight: spacing.sm,
  },
  stepNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },
  stepConnectorLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border.light,
    marginTop: spacing.xs,
    marginBottom: -spacing.xs,
  },
  stepContentCol: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stepIconBox: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  stepDesc: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    lineHeight: 18,
    marginLeft: 36, // Align with title after icon
   },
});
