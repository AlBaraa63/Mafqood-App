/**
 * Home Screen - Native Mobile Experience
 * Redesigned with true mobile-first patterns:
 * - Dynamic fonts that scale on every device
 * - Haptic feedback & smooth animations
 * - Horizontal carousels instead of grids
 * - FAB for primary actions
 * - Reduced padding, more content density
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
  FadeInRight,
  SlideInRight,
} from 'react-native-reanimated';

import { GlassCard, FloatingActionButton } from '../../components/ui';
import { Header } from '../../components/common';
import { useTranslation, useFormatDate, useHaptics, useDynamicStyles } from '../../hooks';
import { useAuthStore, useReportFormStore } from '../../hooks/useStore';
import api from '../../api';
import { Item, ItemType, MainTabParamList } from '../../types';
import { colors, shadows } from '../../theme';

type NavigationProp = NativeStackNavigationProp<MainTabParamList>;

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Quick Action Card Component
interface QuickActionProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  onPress: () => void;
  delay?: number;
}

const QuickActionCard: React.FC<QuickActionProps> = ({
  icon, title, subtitle, color, bgColor, onPress, delay = 0
}) => {
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    haptics.medium();
    onPress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ flex: 1 }}>
      <AnimatedTouchable
        style={[
          {
            backgroundColor: bgColor,
            borderRadius: layout.radiusXl,
            padding: spacing.lg,
            flex: 1,
            ...shadows.md,
          },
          animatedStyle,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View
          style={{
            width: layout.iconXl + 8,
            height: layout.iconXl + 8,
            borderRadius: layout.radiusMd,
            backgroundColor: color + '20',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: spacing.md,
          }}
        >
          <MaterialCommunityIcons name={icon} size={layout.iconLg} color={color} />
        </View>
        <Text style={[typography.h4, { marginBottom: spacing.xs }]}>{title}</Text>
        <Text style={[typography.bodySmall, { color: colors.text.tertiary }]} numberOfLines={2}>
          {subtitle}
        </Text>
      </AnimatedTouchable>
    </Animated.View>
  );
};

// Feature Pill Component - Horizontal scrollable
interface FeaturePillProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  color: string;
  index: number;
}

const FeaturePill: React.FC<FeaturePillProps> = ({ icon, label, color, index }) => {
  const { typography, spacing, layout } = useDynamicStyles();
  
  return (
    <Animated.View
      entering={SlideInRight.delay(index * 80).springify()}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.neutral[50],
        borderRadius: layout.radiusFull,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.neutral[100],
      }}
    >
      <MaterialCommunityIcons name={icon} size={layout.iconSm} color={color} />
      <Text style={[typography.labelSmall, { marginLeft: spacing.xs, color: colors.text.secondary }]}>
        {label}
      </Text>
    </Animated.View>
  );
};

// Step Card Component - Compact timeline style
interface StepCardProps {
  number: number;
  icon: string;
  title: string;
  description: string;
  color: string;
  isLast?: boolean;
  delay?: number;
}

const StepCard: React.FC<StepCardProps> = ({
  number, icon, title, description, color, isLast = false, delay = 0
}) => {
  const { typography, spacing, layout, isSmallDevice } = useDynamicStyles();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.98, { damping: 15 });
    haptics.selection();
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15 });
    }, 100);
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <AnimatedTouchable
        style={[{ flexDirection: 'row', marginBottom: isLast ? 0 : spacing.md }, animatedStyle]}
        onPress={handlePress}
        activeOpacity={1}
      >
        {/* Timeline indicator */}
        <View style={{ alignItems: 'center', marginRight: spacing.md }}>
          <View
            style={{
              width: layout.avatarSm,
              height: layout.avatarSm,
              borderRadius: layout.avatarSm / 2,
              backgroundColor: color + '15',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: color,
            }}
          >
            <Text style={[typography.label, { color, fontSize: typography.sizes.sm }]}>
              {number}
            </Text>
          </View>
          {!isLast && (
            <View
              style={{
                width: 2,
                flex: 1,
                backgroundColor: colors.neutral[200],
                marginTop: spacing.xs,
              }}
            />
          )}
        </View>

        {/* Content */}
        <View style={{ flex: 1, paddingBottom: isLast ? 0 : spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs }}>
            <Text style={{ marginRight: spacing.xs }}>{icon}</Text>
            <Text style={typography.h4}>{title}</Text>
          </View>
          <Text style={[typography.body, { color: colors.text.tertiary }]}>{description}</Text>
        </View>
      </AnimatedTouchable>
    </Animated.View>
  );
};

// Stat Badge - Compact inline stats
interface StatBadgeProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  value: string;
  label: string;
  color: string;
}

const StatBadge: React.FC<StatBadgeProps> = ({ icon, value, label, color }) => {
  const { typography, spacing, layout } = useDynamicStyles();
  
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View
        style={{
          width: layout.avatarMd,
          height: layout.avatarMd,
          borderRadius: layout.avatarMd / 2,
          backgroundColor: color + '15',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <MaterialCommunityIcons name={icon} size={layout.iconMd} color={color} />
      </View>
      <Text style={[typography.label, { color }]}>{value}</Text>
      <Text style={[typography.caption, { color: colors.text.tertiary, textAlign: 'center' }]}>
        {label}
      </Text>
    </View>
  );
};

// Main HomeScreen Component
export const HomeScreen: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { isGuest, user } = useAuthStore();
  const { setType, resetForm } = useReportFormStore();
  const haptics = useHaptics();
  const { typography, spacing, layout, screenSize, isSmallDevice } = useDynamicStyles();
  
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Features for horizontal scroll
  const features = useMemo(() => [
    { icon: 'robot-outline' as const, label: t('value_ai'), color: colors.primary[500] },
    { icon: 'clock-fast' as const, label: t('value_fast'), color: colors.accent[500] },
    { icon: 'shield-check' as const, label: t('value_trusted'), color: colors.highlight[500] },
    { icon: 'earth' as const, label: t('value_citywide'), color: colors.success.main },
    { icon: 'cash-remove' as const, label: t('value_free'), color: colors.primary[600] },
  ], [t]);

  // Steps data
  const steps = useMemo(() => [
    {
      number: 1,
      icon: '📸',
      title: t('step_report_title'),
      description: t('step_report_desc'),
      color: colors.primary[500],
    },
    {
      number: 2,
      icon: '🤖',
      title: t('step_ai_title'),
      description: t('step_ai_desc'),
      color: colors.accent[500],
    },
    {
      number: 3,
      icon: '✨',
      title: t('step_match_title'),
      description: t('step_match_desc'),
      color: colors.success.main,
    },
    {
      number: 4,
      icon: '🤝',
      title: t('step_reunite_title'),
      description: t('step_reunite_desc'),
      color: colors.highlight[500],
    },
  ], [t]);

  const loadData = useCallback(async () => {
    try {
      const response = await api.getMyItems();
      if (response.success && response.data) {
        const allItems = [
          ...response.data.lostItems.map(g => g.item),
          ...response.data.foundItems.map(g => g.item),
        ].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 5);
        setRecentItems(allItems);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isGuest) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [isGuest, loadData]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    haptics.light();
    loadData();
  }, [loadData, haptics]);

  const startReport = useCallback((type: ItemType) => {
    resetForm();
    setType(type);
    haptics.success();
    navigation.navigate('ReportTab' as any, {
      screen: 'ReportPhoto',
      params: { type },
    });
  }, [resetForm, setType, navigation, haptics]);

  const handleProfilePress = useCallback(() => {
    haptics.light();
    navigation.navigate('ProfileTab');
  }, [navigation, haptics]);

  const handleNotificationPress = useCallback(() => {
    haptics.medium();
    navigation.navigate('Notifications' as any);
    setHasUnreadNotifications(false);
    setNotificationCount(0);
  }, [navigation, haptics]);

  // FAB actions
  const fabActions = useMemo(() => [
    {
      icon: 'alert-circle-outline' as const,
      label: t('report_lost_item'),
      onPress: () => startReport('lost'),
      color: colors.error.main,
    },
    {
      icon: 'hand-heart' as const,
      label: t('report_found_item'),
      onPress: () => startReport('found'),
      color: colors.success.main,
    },
  ], [t, startReport]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
      
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={{ paddingHorizontal: spacing.screenPadding }}>
          <Header
            avatarUrl={user?.avatarUrl}
            userName={user?.fullName || 'Guest'}
            hasUnreadNotifications={hasUnreadNotifications}
            notificationCount={notificationCount}
            onProfilePress={handleProfilePress}
            onNotificationPress={handleNotificationPress}
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: spacing.screenPadding,
            paddingBottom: spacing['4xl'] + layout.fabSize,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[colors.accent[500]]}
              tintColor={colors.accent[500]}
            />
          }
        >
          {/* Hero Section - Compact */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            style={{ marginTop: spacing.md, marginBottom: spacing.sectionGap }}
          >
            <GlassCard variant="gradient">
              <View style={{ padding: spacing.cardPadding }}>
                {/* AI Badge */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.accent[500] + '20',
                    alignSelf: 'flex-start',
                    paddingHorizontal: spacing.md,
                    paddingVertical: spacing.xs,
                    borderRadius: layout.radiusFull,
                    marginBottom: spacing.md,
                  }}
                >
                  <MaterialCommunityIcons
                    name="auto-fix"
                    size={layout.iconSm}
                    color={colors.accent[600]}
                  />
                  <Text style={[typography.labelSmall, { color: colors.accent[600], marginLeft: spacing.xs }]}>
                    {t('home_ai_badge')}
                  </Text>
                </View>

                {/* Title */}
                <Text style={[typography.hero, { marginBottom: spacing.sm }]}>
                  {t('home_hero_title')}
                </Text>
                <Text style={[typography.bodyLarge, { marginBottom: spacing.lg }]}>
                  {t('home_hero_subtitle')}
                </Text>

                {/* Inline Stats */}
                <View
                  style={{
                    flexDirection: 'row',
                    backgroundColor: colors.neutral.white,
                    borderRadius: layout.radiusLg,
                    padding: spacing.md,
                    ...shadows.sm,
                  }}
                >
                  <StatBadge
                    icon="clock-fast"
                    value="24h"
                    label={t('value_fast')}
                    color={colors.accent[500]}
                  />
                  <View style={{ width: 1, backgroundColor: colors.neutral[200] }} />
                  <StatBadge
                    icon="shield-check"
                    value="100%"
                    label={t('value_trusted')}
                    color={colors.primary[500]}
                  />
                  <View style={{ width: 1, backgroundColor: colors.neutral[200] }} />
                  <StatBadge
                    icon="cash-remove"
                    value="$0"
                    label={t('value_free')}
                    color={colors.highlight[500]}
                  />
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Features - Horizontal Scroll */}
          <View style={{ marginBottom: spacing.sectionGap }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: spacing.xs }}
            >
              {features.map((feature, index) => (
                <FeaturePill
                  key={feature.label}
                  icon={feature.icon}
                  label={feature.label}
                  color={feature.color}
                  index={index}
                />
              ))}
            </ScrollView>
          </View>

          {/* Quick Actions */}
          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            style={{ marginBottom: spacing.sectionGap }}
          >
            <Text style={[typography.h2, { marginBottom: spacing.md }]}>
              {t('quick_actions') || 'Quick Actions'}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <QuickActionCard
                  icon="alert-circle-outline"
                  title={t('report_lost_item')}
                  subtitle={t('report_lost_desc') || 'Lost something? Report it now'}
                  color={colors.error.main}
                  bgColor={colors.error.light}
                  onPress={() => startReport('lost')}
                  delay={250}
                />
              </View>
              <View style={{ flex: 1 }}>
                <QuickActionCard
                  icon="hand-heart"
                  title={t('report_found_item')}
                  subtitle={t('report_found_desc') || 'Found something? Help return it'}
                  color={colors.success.main}
                  bgColor={colors.success.light}
                  onPress={() => startReport('found')}
                  delay={350}
                />
              </View>
            </View>
          </Animated.View>

          {/* How It Works - Timeline Style */}
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Text style={[typography.h2, { marginBottom: spacing.lg }]}>
              {t('how_it_works')}
            </Text>
            <GlassCard variant="elevated">
              <View style={{ padding: spacing.cardPadding }}>
                {steps.map((step, index) => (
                  <StepCard
                    key={step.number}
                    number={step.number}
                    icon={step.icon}
                    title={step.title}
                    description={step.description}
                    color={step.color}
                    isLast={index === steps.length - 1}
                    delay={400 + index * 100}
                  />
                ))}
              </View>
            </GlassCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Floating Action Button */}
      <FloatingActionButton
        icon="plus"
        actions={fabActions}
        position="bottom-right"
      />
    </View>
  );
};

export default HomeScreen;
