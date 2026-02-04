/**
 * Home Screen - Professional Lost and Found App
 * Enhanced with modern 2025 UI/UX trends and lost & found best practices
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, StatusChip, EmptyState, Loading, SectionHeader, TypeChip, Header } from '../../components/common';
import { useTranslation, useFormatDate } from '../../hooks';
import { useAuthStore, useReportFormStore } from '../../hooks/useStore';
import api from '../../api';
import { Item, ItemType, MainTabParamList } from '../../types';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

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

export const HomeScreen: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const { formatRelative } = useFormatDate();
  const navigation = useNavigation<NavigationProp>();
  const { isGuest, user, token } = useAuthStore();
  const { setType, resetForm } = useReportFormStore();
  
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
  
  const valueCards = benefitCards;
  
  const loadData = async () => {
    try {
      const response = await api.getMyItems(token);
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
  
  // TODO: Implement notification fetching from API
  const fetchNotifications = async () => {
    try {
      // const response = await api.getNotifications();
      // if (response.success && response.data) {
      //   setHasUnreadNotifications(response.data.hasUnread);
      //   setNotificationCount(response.data.unreadCount);
      // }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };
  
  useEffect(() => {
    if (!isGuest) {
      loadData();
      // TODO: Fetch notification data from API
      // fetchNotifications();
    } else {
      setIsLoading(false);
    }
  }, [isGuest]);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };
  
  const startReport = (type: ItemType) => {
    resetForm();
    setType(type);
    navigation.navigate('ReportTab' as any, {
      screen: 'ReportPhoto',
      params: { type },
    });
  };
  
  const handleReportLost = () => startReport('lost');
  
  const handleReportFound = () => startReport('found');
  
  const handleProfilePress = () => {
    navigation.navigate('ProfileTab');
  };
  
  const handleNotificationPress = () => {
    // Navigate to notifications screen
    navigation.navigate('Notifications' as any);
    setHasUnreadNotifications(false);
    setNotificationCount(0);
  };
  

  
  return (
    <SafeAreaView className="flex-1 bg-background-primary" edges={['top']}>
      {/* Header with Profile and Notifications */}
      <View className="px-4 md:px-6 lg:px-8">
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
        className="flex-1"
        contentContainerClassName="px-4 md:px-6 lg:px-8 py-4 md:py-6"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.accent[500]]}
            tintColor={colors.accent[500]}
          />
        }
      >
        {/* Hero Section */}
        <View className="mb-6 md:mb-8">
          <Card variant="elevated">
            <View style={styles.heroBackdrop} />
            <View style={styles.heroBackdropAccent} />
            <View className="p-6 md:p-8 lg:p-10">
              <View className={`flex-row items-center mb-3 md:mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MaterialCommunityIcons name="auto-fix" size={18} color={colors.accent[600]} />
                <Text className="ml-2 text-sm font-medium text-accent-600">{t('home_ai_badge')}</Text>
              </View>
              <Text className={`text-3xl md:text-4xl font-bold text-text-primary mb-2 md:mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('home_hero_title')}
              </Text>
              <Text className={`text-base md:text-lg text-text-secondary mb-6 md:mb-8 ${isRTL ? 'text-right' : ''}`}>
                {t('home_hero_subtitle')}
              </Text>
              <View className={`flex-row gap-3 md:gap-4 mb-6 md:mb-8 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Button
                  title={t('report_lost_item')}
                  onPress={handleReportLost}
                  variant="primary"
                  fullWidth
                  style={styles.primaryCta}
                  icon={<MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.neutral.white} />}
                />
                <Button
                  title={t('report_found_item')}
                  onPress={handleReportFound}
                  variant="secondary"
                  fullWidth
                  style={styles.secondaryCta}
                  icon={<MaterialCommunityIcons name="hand-heart" size={20} color={colors.neutral.white} />}
                />
              </View>
              <View className={`flex-row gap-2 md:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {heroStats.map((stat) => (
                  <View key={stat.title} style={styles.heroStat}>
                    <View style={[styles.heroStatIcon, { backgroundColor: `${stat.color}1A` }]}>
                      <MaterialCommunityIcons name={stat.icon} size={18} color={stat.color} />
                    </View>
                    <Text style={[styles.heroStatTitle, isRTL && styles.textRight]}>{stat.title}</Text>
                    <Text style={[styles.heroStatSubtitle, isRTL && styles.textRight]} numberOfLines={2}>{stat.subtitle}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </View>
        
        {/* How It Works - Step by Step */}
        <View className="mb-6 md:mb-8">
          <Text className={`text-xl md:text-2xl font-bold text-text-primary mb-4 md:mb-6 ${isRTL ? 'text-right' : ''}`}>
            {t('how_it_works')}
          </Text>
          <View className="gap-4 md:gap-5">
            {/* Step 1 */}
            <Card variant="outlined">
              <View className={`flex-row items-start p-4 md:p-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary-100 items-center justify-center mr-4">
                  <Text className="text-lg md:text-xl font-bold text-primary-600">1</Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-base md:text-lg font-semibold text-text-primary mb-1 ${isRTL ? 'text-right' : ''}`}>
                    📸 {t('step_report_title')}
                  </Text>
                  <Text className={`text-sm md:text-base text-text-secondary ${isRTL ? 'text-right' : ''}`}>
                    {t('step_report_desc')}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Step 2 */}
            <Card variant="outlined">
              <View className={`flex-row items-start p-4 md:p-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent-100 items-center justify-center mr-4">
                  <Text className="text-lg md:text-xl font-bold text-accent-600">2</Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-base md:text-lg font-semibold text-text-primary mb-1 ${isRTL ? 'text-right' : ''}`}>
                    🤖 {t('step_ai_title')}
                  </Text>
                  <Text className={`text-sm md:text-base text-text-secondary ${isRTL ? 'text-right' : ''}`}>
                    {t('step_ai_desc')}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Step 3 */}
            <Card variant="outlined">
              <View className={`flex-row items-start p-4 md:p-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View className="w-10 h-10 md:w-12 md:h-12 rounded-full items-center justify-center mr-4" style={{backgroundColor: colors.success.main + '1A'}}>
                  <Text className="text-lg md:text-xl font-bold" style={{color: colors.success.main}}>3</Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-base md:text-lg font-semibold text-text-primary mb-1 ${isRTL ? 'text-right' : ''}`}>
                    ✨ {t('step_match_title')}
                  </Text>
                  <Text className={`text-sm md:text-base text-text-secondary ${isRTL ? 'text-right' : ''}`}>
                    {t('step_match_desc')}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Step 4 */}
            <Card variant="outlined">
              <View className={`flex-row items-start p-4 md:p-5 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <View className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-highlight-100 items-center justify-center mr-4">
                  <Text className="text-lg md:text-xl font-bold text-highlight-600">4</Text>
                </View>
                <View className="flex-1">
                  <Text className={`text-base md:text-lg font-semibold text-text-primary mb-1 ${isRTL ? 'text-right' : ''}`}>
                    🤝 {t('step_reunite_title')}
                  </Text>
                  <Text className={`text-sm md:text-base text-text-secondary ${isRTL ? 'text-right' : ''}`}>
                    {t('step_reunite_desc')}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        </View>

        {/* Features */}
        <View className="mb-2">
          <Text className={`text-xl md:text-2xl font-bold text-text-primary mb-4 md:mb-6 ${isRTL ? 'text-right' : ''}`}>
            {t('why_choose_us')}
          </Text>
          <View className="flex-row flex-wrap gap-3 md:gap-4">
            {valueCards.map((card) => (
              <Card key={card.title} variant="elevated" style={{flex: 1, minWidth: '45%', padding: spacing.lg, alignItems: 'center'}}>
                <View style={{width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primary[50], alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md}}>
                  <MaterialCommunityIcons name={card.icon} size={24} color={colors.primary[500]} />
                </View>
                <Text className={`text-sm md:text-base font-semibold text-text-primary text-center mb-1 ${isRTL ? 'text-right' : ''}`}>
                  {card.title}
                </Text>
                <Text className={`text-xs md:text-sm text-text-secondary text-center ${isRTL ? 'text-right' : ''}`}>
                  {card.desc}
                </Text>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rtl: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },

  // Hero
  heroBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.primary[50],
  },
  heroBackdropAccent: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 140,
    backgroundColor: colors.accent[100],
    opacity: 0.35,
    top: -80,
    right: -60,
    transform: [{ rotate: '25deg' }],
  },
  primaryCta: {
    flex: 1,
  },
  secondaryCta: {
    flex: 1,
  },
  heroStat: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.xl,
    padding: spacing.md,
  },
  heroStatIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroStatTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  heroStatSubtitle: {
    marginTop: spacing.xs,
    fontSize: 10,
    color: colors.text.tertiary,
    textAlign: 'left',
  },
});

export default HomeScreen;
