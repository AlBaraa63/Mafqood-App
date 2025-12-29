/**
 * Enhanced Home Screen
 * Premium UI/UX with full responsiveness and modern interactions
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  EnhancedButton,
  GlassCard,
  ResponsiveContainer,
  FloatingActionButton,
  PullToRefresh,
  ListSkeleton,
} from '../../components/ui';
import { Header } from '../../components/common';
import {
  useTranslation,
  useFormatDate,
  useResponsive,
  useResponsiveSpacing,
  useResponsiveFontSize,
  useHaptics,
} from '../../hooks';
import { useAuthStore, useReportFormStore } from '../../hooks/useStore';
import api from '../../api';
import { Item, ItemType, MainTabParamList } from '../../types';
import { colors, typography, borderRadius, shadows } from '../../theme';

type NavigationProp = NativeStackNavigationProp<MainTabParamList>;

interface HeroStat {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  color: string;
}

interface HighlightCard {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  desc: string;
}

export const EnhancedHomeScreen: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const { formatRelative } = useFormatDate();
  const navigation = useNavigation<NavigationProp>();
  const { isGuest, user } = useAuthStore();
  const { setType, resetForm } = useReportFormStore();
  const { isSmallDevice, isMediumDevice, isLargeDevice } = useResponsive();
  const responsiveSpacing = useResponsiveSpacing();
  const responsiveFontSize = useResponsiveFontSize();
  const haptics = useHaptics();
  
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const heroStats: HeroStat[] = useMemo(() => ([
    {
      icon: 'clock-outline',
      title: t('value_fast'),
      subtitle: t('value_fast_desc'),
      color: colors.accent[500],
    },
    {
      icon: 'shield-check-outline',
      title: t('value_trusted'),
      subtitle: t('value_trusted_desc'),
      color: colors.primary[500],
    },
    {
      icon: 'cash-multiple',
      title: t('value_free'),
      subtitle: t('value_free_desc'),
      color: colors.highlight[500],
    },
  ]), [t]);

  const benefitCards: HighlightCard[] = useMemo(() => ([
    { icon: 'auto-fix', title: t('value_ai'), desc: t('value_ai_desc') },
    { icon: 'earth', title: t('value_citywide'), desc: t('value_citywide_desc') },
    { icon: 'shield-check-outline', title: t('value_privacy'), desc: t('value_privacy_desc') },
  ]), [t]);
  
  const loadData = async () => {
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
  };
  
  useEffect(() => {
    if (!isGuest) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [isGuest]);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    haptics.light();
    loadData();
  };
  
  const startReport = (type: ItemType) => {
    resetForm();
    setType(type);
    haptics.success();
    navigation.navigate('ReportTab' as any, {
      screen: 'ReportPhoto',
      params: { type },
    });
  };
  
  const handleReportLost = () => startReport('lost');
  const handleReportFound = () => startReport('found');
  
  const handleProfilePress = () => {
    haptics.selection();
    navigation.navigate('ProfileTab');
  };
  
  const handleNotificationPress = () => {
    haptics.selection();
    navigation.navigate('Notifications' as any);
    setHasUnreadNotifications(false);
    setNotificationCount(0);
  };

  // Responsive grid columns for features
  const featureColumns = isLargeDevice ? 3 : isMediumDevice ? 2 : 1;
  
  return (
    <ResponsiveContainer
      scrollable={true}
      centered={isLargeDevice}
      refreshControl={
        <PullToRefresh
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      {/* Header with Profile and Notifications */}
      <View style={{ marginBottom: responsiveSpacing.lg }}>
        <Header
          avatarUrl={user?.avatarUrl}
          userName={user?.fullName || 'Guest'}
          hasUnreadNotifications={hasUnreadNotifications}
          notificationCount={notificationCount}
          onProfilePress={handleProfilePress}
          onNotificationPress={handleNotificationPress}
        />
      </View>
      
      {/* Hero Section - Premium Glass Card */}
      <View style={{ marginBottom: responsiveSpacing['2xl'] }}>
        <GlassCard variant="gradient">
          <View style={{ padding: isSmallDevice ? responsiveSpacing.md : responsiveSpacing.lg }}>
            <View style={{ 
              flexDirection: isRTL ? 'row-reverse' : 'row', 
              alignItems: 'center', 
              marginBottom: responsiveSpacing.md 
            }}>
              <MaterialCommunityIcons name="auto-fix" size={20} color={colors.accent[600]} />
              <Text style={{ 
                marginLeft: responsiveSpacing.sm,
                fontSize: responsiveFontSize.sm,
                fontWeight: typography.fontWeight.medium,
                color: colors.accent[600] 
              }}>
                {t('home_ai_badge')}
              </Text>
            </View>
            
            <Text style={{ 
              fontSize: isSmallDevice ? responsiveFontSize['2xl'] : responsiveFontSize['3xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: responsiveSpacing.md,
              textAlign: isRTL ? 'right' : 'left',
            }}>
              {t('home_hero_title')}
            </Text>
            
            <Text style={{ 
              fontSize: responsiveFontSize.md,
              color: colors.text.secondary,
              marginBottom: responsiveSpacing['2xl'],
              textAlign: isRTL ? 'right' : 'left',
              lineHeight: responsiveFontSize.md * 1.5,
            }}>
              {t('home_hero_subtitle')}
            </Text>
            
            {/* CTA Buttons */}
            <View style={{ 
              flexDirection: isSmallDevice ? 'column' : 'row',
              gap: responsiveSpacing.md,
              marginBottom: responsiveSpacing.xl,
            }}>
              <EnhancedButton
                title={t('report_lost_item')}
                onPress={handleReportLost}
                variant="primary"
                fullWidth={isSmallDevice}
                icon={<MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.neutral.white} />}
              />
              <EnhancedButton
                title={t('report_found_item')}
                onPress={handleReportFound}
                variant="gradient"
                fullWidth={isSmallDevice}
                icon={<MaterialCommunityIcons name="hand-heart" size={20} color={colors.neutral.white} />}
              />
            </View>
            
            {/* Hero Stats */}
            <View style={{ 
              flexDirection: isRTL ? 'row-reverse' : 'row',
              gap: responsiveSpacing.sm,
            }}>
              {heroStats.map((stat) => (
                <View key={stat.title} style={{
                  flex: 1,
                  backgroundColor: colors.neutral.white,
                  borderRadius: borderRadius.lg,
                  padding: responsiveSpacing.md,
                  ...shadows.sm,
                }}>
                  <View style={{
                    width: 36,
                    height: 36,
                    borderRadius: borderRadius.md,
                    backgroundColor: `${stat.color}15`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: responsiveSpacing.sm,
                  }}>
                    <MaterialCommunityIcons name={stat.icon} size={18} color={stat.color} />
                  </View>
                  <Text style={{
                    fontSize: responsiveFontSize.xs,
                    fontWeight: typography.fontWeight.bold,
                    color: colors.text.primary,
                    textAlign: isRTL ? 'right' : 'left',
                  }}>
                    {stat.title}
                  </Text>
                  <Text style={{
                    marginTop: 2,
                    fontSize: 10,
                    color: colors.text.tertiary,
                    textAlign: isRTL ? 'right' : 'left',
                  }} numberOfLines={2}>
                    {stat.subtitle}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </GlassCard>
      </View>
      
      {/* How It Works Section */}
      <View style={{ marginBottom: responsiveSpacing['2xl'] }}>
        <Text style={{ 
          fontSize: responsiveFontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          marginBottom: responsiveSpacing.lg,
          textAlign: isRTL ? 'right' : 'left',
        }}>
          {t('how_it_works')}
        </Text>
        
        <View style={{ gap: responsiveSpacing.md }}>
          {[
            { num: 1, icon: '📸', title: t('step_report_title'), desc: t('step_report_desc'), color: colors.primary[500] },
            { num: 2, icon: '🤖', title: t('step_ai_title'), desc: t('step_ai_desc'), color: colors.accent[500] },
            { num: 3, icon: '✨', title: t('step_match_title'), desc: t('step_match_desc'), color: colors.highlight[500] },
            { num: 4, icon: '🤝', title: t('step_reunite_title'), desc: t('step_reunite_desc'), color: colors.success.main },
          ].map((step) => (
            <GlassCard key={step.num} variant="outlined">
              <View style={{ 
                flexDirection: isRTL ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
                padding: responsiveSpacing.md,
              }}>
                <View style={{
                  width: isSmallDevice ? 44 : 52,
                  height: isSmallDevice ? 44 : 52,
                  borderRadius: 9999,
                  backgroundColor: `${step.color}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: isRTL ? 0 : responsiveSpacing.md,
                  marginLeft: isRTL ? responsiveSpacing.md : 0,
                }}>
                  <Text style={{ 
                    fontSize: responsiveFontSize.lg,
                    fontWeight: typography.fontWeight.bold,
                    color: step.color,
                  }}>
                    {step.num}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ 
                    fontSize: responsiveFontSize.md,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: 4,
                    textAlign: isRTL ? 'right' : 'left',
                  }}>
                    {step.icon} {step.title}
                  </Text>
                  <Text style={{ 
                    fontSize: responsiveFontSize.sm,
                    color: colors.text.secondary,
                    textAlign: isRTL ? 'right' : 'left',
                    lineHeight: responsiveFontSize.sm * 1.4,
                  }}>
                    {step.desc}
                  </Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>
      </View>

      {/* Features Section */}
      <View style={{ marginBottom: responsiveSpacing['4xl'] }}>
        <Text style={{ 
          fontSize: responsiveFontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: colors.text.primary,
          marginBottom: responsiveSpacing.lg,
          textAlign: isRTL ? 'right' : 'left',
        }}>
          {t('why_choose_us')}
        </Text>
        
        <View style={{ 
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: responsiveSpacing.md,
        }}>
          {benefitCards.map((card) => (
            <GlassCard 
              key={card.title} 
              variant="premium"
              style={{
                flex: featureColumns === 1 ? undefined : 1,
                minWidth: featureColumns === 1 ? '100%' : '45%',
                alignItems: 'center',
                padding: responsiveSpacing.lg,
              }}
            >
              <View style={{
                width: 56,
                height: 56,
                borderRadius: borderRadius.xl,
                backgroundColor: colors.primary[50],
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: responsiveSpacing.md,
              }}>
                <MaterialCommunityIcons name={card.icon} size={28} color={colors.primary[500]} />
              </View>
              <Text style={{
                fontSize: responsiveFontSize.md,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                textAlign: 'center',
                marginBottom: 4,
              }}>
                {card.title}
              </Text>
              <Text style={{
                fontSize: responsiveFontSize.sm,
                color: colors.text.secondary,
                textAlign: 'center',
                lineHeight: responsiveFontSize.sm * 1.4,
              }}>
                {card.desc}
              </Text>
            </GlassCard>
          ))}
        </View>
      </View>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={[
          {
            icon: 'alert-circle-outline',
            label: t('report_lost_item'),
            onPress: handleReportLost,
            color: colors.primary[500],
          },
          {
            icon: 'hand-heart',
            label: t('report_found_item'),
            onPress: handleReportFound,
            color: colors.highlight[500],
          },
        ]}
      />
    </ResponsiveContainer>
  );
};

export default EnhancedHomeScreen;
