/**
 * Home Screen
 * Modern, on-brand landing page aligned with Mafqood web style
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
  const { isGuest, user } = useAuthStore();
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
    navigation.navigate('ProfileTab' as any);
  };
  
  const handleNotificationPress = () => {
    // Navigate to notifications screen (to be implemented)
    // For now, just clear the badge
    setHasUnreadNotifications(false);
    setNotificationCount(0);
    // TODO: Navigate to notifications screen when it's implemented
    console.log('Navigate to notifications');
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return t('status_open');
      case 'matched': return t('status_matched');
      case 'closed': return t('status_closed');
      default: return status;
    }
  };
  
  const renderRecentItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={[styles.recentItemCard, isRTL && styles.cardRtl]}
      onPress={() => navigation.navigate('MatchesTab' as any)}
      activeOpacity={0.85}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.recentItemImage}
        resizeMode="cover"
      />
      <View style={styles.recentItemContent}>
        <View style={[styles.recentItemHeader, isRTL && styles.rtl]}>
          <TypeChip type={item.type} label={item.type === 'lost' ? t('lost_item') : t('found_item')} />
          <StatusChip
            status={item.status}
            label={getStatusLabel(item.status)}
            size="small"
          />
        </View>
        <Text style={[styles.recentItemTitle, isRTL && styles.textRight]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.recentItemLocation, isRTL && styles.textRight]} numberOfLines={1}>
          {item.location}
        </Text>
        <Text style={[styles.recentItemMeta, isRTL && styles.textRight]}>{formatRelative(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Profile and Notifications */}
      <Header
        avatarUrl={user?.avatarUrl}
        userName={user?.fullName || 'Guest'}
        hasUnreadNotifications={hasUnreadNotifications}
        notificationCount={notificationCount}
        onProfilePress={handleProfilePress}
        onNotificationPress={handleNotificationPress}
      />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        <Card style={styles.heroCard} variant="elevated">
          <View style={styles.heroBackdrop} />
          <View style={styles.heroBackdropAccent} />
          <View style={styles.heroContent}>
            <View style={[styles.heroBadge, isRTL && styles.rtl]}>
              <MaterialCommunityIcons name="auto-fix" size={18} color={colors.accent[600]} />
              <Text style={styles.heroBadgeText}>{t('home_ai_badge')}</Text>
            </View>
            <Text style={[styles.heroTitle, isRTL && styles.textRight]}>{t('home_hero_title')}</Text>
            <Text style={[styles.heroSubtitle, isRTL && styles.textRight]}>{t('home_hero_subtitle')}</Text>
            <View style={[styles.ctaRow, isRTL && styles.rtl]}>
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
            <View style={[styles.heroStatsRow, isRTL && styles.rtl]}>
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
        
        {/* Quick Links */}
        <View style={[styles.quickLinks, isRTL && styles.rtl]}>
          <Card
            style={StyleSheet.flatten([styles.quickLinkCard, isRTL && styles.cardRtl])}
            variant="outlined"
            onPress={() => navigation.navigate('MatchesTab' as any)}
          >
            <View style={styles.quickLinkIconWrap}>
              <MaterialCommunityIcons name="magnify-scan" size={22} color={colors.primary[500]} />
            </View>
            <View style={styles.quickLinkTextWrap}>
              <Text style={[styles.quickLinkLabel, isRTL && styles.textRight]}>{t('view_matches')}</Text>
              <Text style={[styles.quickLinkSub, isRTL && styles.textRight]}>{t('matches_subtitle')}</Text>
            </View>
            <MaterialCommunityIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={colors.text.tertiary} />
          </Card>
          <Card
            style={StyleSheet.flatten([styles.quickLinkCard, isRTL && styles.cardRtl])}
            variant="outlined"
            onPress={() => navigation.navigate('ProfileTab' as any)}
          >
            <View style={[styles.quickLinkIconWrap, { backgroundColor: colors.highlight[50] }]}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={22} color={colors.highlight[500]} />
            </View>
            <View style={styles.quickLinkTextWrap}>
              <Text style={[styles.quickLinkLabel, isRTL && styles.textRight]}>{t('my_reports')}</Text>
              <Text style={[styles.quickLinkSub, isRTL && styles.textRight]}>{t('home_reports_shortcut')}</Text>
            </View>
            <MaterialCommunityIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={colors.text.tertiary} />
          </Card>
        </View>
        
        {/* Recent Items (only for logged in users) */}
        {!isGuest && (
          <View style={styles.section}>
            <SectionHeader title={t('recent_items')} actionLabel={t('view_matches')} onAction={() => navigation.navigate('MatchesTab' as any)} />
            {isLoading ? (
              <Loading size="small" />
            ) : recentItems.length > 0 ? (
              <FlatList
                data={recentItems}
                renderItem={renderRecentItem}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
                contentContainerStyle={[styles.recentItemsList, isRTL && styles.rtlList]}
              />
            ) : (
              <Card style={styles.emptyRecentCard} variant="outlined">
                <EmptyState
                  icon='dY"-'
                  title={t('no_recent_items')}
                  description={t('home_empty_recent')}
                />
              </Card>
            )}
          </View>
        )}
        
        {/* Guest Mode Banner */}
        {isGuest && (
          <Card style={styles.guestBanner} variant="outlined">
            <View style={[styles.guestRow, isRTL && styles.rtl]}>
              <View style={styles.guestIconBubble}>
                <MaterialCommunityIcons name="account-off-outline" size={22} color={colors.primary[500]} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.guestBannerText, isRTL && styles.textRight]}>{t('guest_mode_limited')}</Text>
                <Text style={[styles.guestBannerSub, isRTL && styles.textRight]}>{t('guest_cannot_report')}</Text>
              </View>
              <MaterialCommunityIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={colors.text.tertiary} />
            </View>
          </Card>
        )}
        
        {/* Brand Pillars */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>{t('home_pillars_title')}</Text>
          <View style={styles.pillarsGrid}>
            {valueCards.map((card) => (
              <Card
                key={card.title}
                style={StyleSheet.flatten([styles.pillarCard, isRTL && styles.cardRtl])}
                variant="elevated"
              >
                <View style={styles.pillarIconBubble}>
                  <MaterialCommunityIcons name={card.icon} size={22} color={colors.primary[500]} />
                </View>
                <Text style={[styles.pillarTitle, isRTL && styles.textRight]}>{card.title}</Text>
                <Text style={[styles.pillarDesc, isRTL && styles.textRight]}>{card.desc}</Text>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.xl,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },

  // Hero
  heroCard: {
    padding: spacing['2xl'],
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius['2xl'],
    ...shadows.lg,
    overflow: 'hidden',
  },
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
  heroContent: {
    gap: spacing.sm,
    position: 'relative',
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent[50],
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  heroBadgeText: {
    color: colors.accent[700],
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
  },
  heroTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing['2xl'],
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    alignItems: 'stretch',
    marginBottom: spacing.lg,
  },
  primaryCta: {
    flex: 1,
  },
  secondaryCta: {
    flex: 1,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  heroStat: {
    flex: 1,
    minWidth: 140,
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
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  heroStatSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },

  // Quick Links
  quickLinks: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  quickLinkCard: {
    flex: 1,
    minWidth: '48%',
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quickLinkIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinkTextWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  quickLinkLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  quickLinkSub: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },

  // Section
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  
  // Recent Items
  recentItemsList: {
    paddingVertical: spacing.sm,
  },
  rtlList: {
    flexDirection: 'row-reverse',
  },
  recentItemCard: {
    width: 220,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.md,
  },
  cardRtl: {
    direction: 'rtl',
  },
  recentItemImage: {
    width: '100%',
    height: 140,
    backgroundColor: colors.neutral[200],
  },
  recentItemContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  recentItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recentItemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  recentItemLocation: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  recentItemMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  emptyRecentCard: {
    backgroundColor: colors.neutral.white,
  },
  
  // Guest Banner
  guestBanner: {
    borderColor: colors.accent[200],
    backgroundColor: colors.accent[50],
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  guestIconBubble: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestBannerText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  guestBannerSub: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  
  // Pillars
  pillarsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  pillarCard: {
    flexBasis: '48%',
    flexGrow: 1,
    gap: spacing.sm,
  },
  pillarIconBubble: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  pillarDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});

export default HomeScreen;
