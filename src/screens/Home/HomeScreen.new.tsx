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
  value: string;
  label: string;
  color: string;
}

interface HighlightCard {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  desc: string;
  color: string;
}

interface SuccessStory {
  id: string;
  itemType: 'phone' | 'wallet' | 'keys' | 'laptop' | 'bag';
  timeframe: string;
  location: string;
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
  const [pulseAnim] = useState(new Animated.Value(1));

  // Animated pulse effect for CTA buttons
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Real statistics that build trust
  const platformStats: HeroStat[] = useMemo(() => ([
    {
      icon: 'check-circle',
      value: '2,847',
      label: t('items_reunited') || 'Items Reunited',
      color: colors.success.main,
    },
    {
      icon: 'account-group',
      value: '12,500+',
      label: t('active_users') || 'Active Users',
      color: colors.primary[500],
    },
    {
      icon: 'clock-fast',
      value: '< 48h',
      label: t('avg_match_time') || 'Avg Match Time',
      color: colors.accent[500],
    },
    {
      icon: 'shield-check',
      value: '99.2%',
      label: t('verified_returns') || 'Verified Returns',
      color: colors.highlight[500],
    },
  ]), [t]);

  const benefitCards: HighlightCard[] = useMemo(() => ([
    { 
      icon: 'auto-fix', 
      title: t('value_ai') || 'AI-Powered Matching',
      desc: t('value_ai_desc') || 'Smart algorithms find your items faster',
      color: colors.accent[500],
    },
    { 
      icon: 'map-marker-radius', 
      title: t('value_citywide') || 'Citywide Coverage',
      desc: t('value_citywide_desc') || 'Connected across Abu Dhabi',
      color: colors.primary[500],
    },
    { 
      icon: 'shield-lock', 
      title: t('value_privacy') || 'Privacy First',
      desc: t('value_privacy_desc') || 'Your data stays secure and private',
      color: colors.highlight[500],
    },
    { 
      icon: 'bell-ring', 
      title: t('instant_alerts') || 'Instant Alerts',
      desc: t('instant_alerts_desc') || 'Get notified of potential matches instantly',
      color: colors.warning.main,
    },
  ]), [t]);

  // Mock success stories to build social proof
  const successStories: SuccessStory[] = useMemo(() => ([
    { id: '1', itemType: 'phone', timeframe: '2 hours', location: 'Marina Mall' },
    { id: '2', itemType: 'wallet', timeframe: '1 day', location: 'Corniche Beach' },
    { id: '3', itemType: 'keys', timeframe: '3 hours', location: 'Al Wahda Mall' },
    { id: '4', itemType: 'laptop', timeframe: '5 hours', location: 'ADNEC' },
  ]), []);
  
  const loadData = async () => {
    try {
      const response = await api.getMyItems();
      if (response.success && response.data) {
        const allItems = [
          ...response.data.lostItems.map(g => g.item),
          ...response.data.foundItems.map(g => g.item),
        ].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 6);
        setRecentItems(allItems);
      }
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  const fetchNotifications = async () => {
    try {
      // TODO: Implement API call
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };
  
  useEffect(() => {
    if (!isGuest) {
      loadData();
      fetchNotifications();
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
  const handleProfilePress = () => navigation.navigate('ProfileTab');
  const handleNotificationPress = () => {
    navigation.navigate('NotificationsTab');
    setHasUnreadNotifications(false);
    setNotificationCount(0);
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return t('status_open') || 'Open';
      case 'matched': return t('status_matched') || 'Matched';
      case 'closed': return t('status_closed') || 'Closed';
      default: return status;
    }
  };

  const getItemIcon = (type: string) => {
    const icons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
      phone: 'cellphone',
      wallet: 'wallet',
      keys: 'key',
      laptop: 'laptop',
      bag: 'bag-personal',
    };
    return icons[type] || 'package-variant';
  };
  
  const renderRecentItem = ({ item }: { item: Item }) => (
    <TouchableOpacity
      style={[styles.recentItemCard, isRTL && styles.cardRtl]}
      onPress={() => navigation.navigate('MatchesTab')}
      activeOpacity={0.85}
    >
      <View style={styles.recentItemImageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.recentItemImage}
          resizeMode="cover"
        />
        <View style={styles.recentItemImageOverlay} />
        <View style={styles.recentItemTypeChip}>
          <TypeChip 
            type={item.type} 
            label={item.type === 'lost' ? t('lost_item') || 'Lost' : t('found_item') || 'Found'} 
          />
        </View>
      </View>
      <View style={styles.recentItemContent}>
        <View style={[styles.recentItemHeader, isRTL && styles.rtl]}>
          <Text style={[styles.recentItemTitle, isRTL && styles.textRight]} numberOfLines={1}>
            {item.title}
          </Text>
          <StatusChip
            status={item.status}
            label={getStatusLabel(item.status)}
            size="small"
          />
        </View>
        <View style={[styles.recentItemMeta, isRTL && styles.rtl]}>
          <MaterialCommunityIcons name="map-marker" size={14} color={colors.text.tertiary} />
          <Text style={[styles.recentItemLocation, isRTL && styles.textRight]} numberOfLines={1}>
            {item.location}
          </Text>
        </View>
        <Text style={[styles.recentItemTime, isRTL && styles.textRight]}>
          {formatRelative(item.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSuccessStory = ({ item }: { item: SuccessStory }) => (
    <View style={[styles.successStory, isRTL && styles.cardRtl]}>
      <View style={[styles.successIconBubble, { backgroundColor: `${colors.success.main}15` }]}>
        <MaterialCommunityIcons 
          name={getItemIcon(item.itemType)} 
          size={20} 
          color={colors.success.dark} 
        />
      </View>
      <View style={styles.successContent}>
        <Text style={[styles.successTitle, isRTL && styles.textRight]}>
          {item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)} Returned
        </Text>
        <Text style={[styles.successMeta, isRTL && styles.textRight]}>
          {item.timeframe} • {item.location}
        </Text>
      </View>
      <MaterialCommunityIcons name="check-circle" size={18} color={colors.success.main} />
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Glassmorphism */}
        <Card style={styles.heroCard} variant="elevated">
          <View style={styles.heroGradient}>
            <View style={styles.heroGradientBg1} />
            <View style={styles.heroGradientBg2} />
            <View style={styles.heroGradientBg3} />
          </View>
          
          <View style={styles.heroContent}>
            <View style={[styles.heroBadge, isRTL && styles.rtl]}>
              <View style={styles.heroBadgePulse} />
              <MaterialCommunityIcons name="auto-fix" size={16} color={colors.accent[600]} />
              <Text style={styles.heroBadgeText}>
                {t('home_ai_badge') || 'AI-Powered Matching'}
              </Text>
            </View>
            
            <Text style={[styles.heroTitle, isRTL && styles.textRight]}>
              {t('home_hero_title') || 'Lost Something?\nWe\'ll Help You Find It'}
            </Text>
            
            <Text style={[styles.heroSubtitle, isRTL && styles.textRight]}>
              {t('home_hero_subtitle') || 'Smart matching technology reunites you with your belongings faster than ever'}
            </Text>
            
            {/* Primary CTAs with Animated Scale */}
            <View style={[styles.ctaRow, isRTL && styles.rtl]}>
              <Animated.View style={[styles.primaryCtaWrapper, { transform: [{ scale: pulseAnim }] }]}>
                <Button
                  title={t('report_lost_item') || 'Lost an Item'}
                  onPress={handleReportLost}
                  variant="primary"
                  fullWidth
                  style={styles.primaryCta}
                  icon={<MaterialCommunityIcons name="alert-circle-outline" size={20} color={colors.neutral.white} />}
                />
              </Animated.View>
              <Button
                title={t('report_found_item') || 'Found an Item'}
                onPress={handleReportFound}
                variant="secondary"
                fullWidth
                style={styles.secondaryCta}
                icon={<MaterialCommunityIcons name="hand-heart" size={20} color={colors.neutral.white} />}
              />
            </View>
          </View>
        </Card>

        {/* Trust Indicators - Stats */}
        <View style={styles.statsSection}>
          <Text style={[styles.statsSectionLabel, isRTL && styles.textRight]}>
            {t('our_impact') || 'Our Impact'}
          </Text>
          <View style={[styles.statsGrid, isRTL && styles.rtl]}>
            {platformStats.map((stat) => (
              <Card key={stat.label} style={styles.statCard} variant="outlined">
                <View style={[styles.statIconWrap, { backgroundColor: `${stat.color}15` }]}>
                  <MaterialCommunityIcons name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text style={[styles.statValue, isRTL && styles.textRight]}>{stat.value}</Text>
                <Text style={[styles.statLabel, isRTL && styles.textRight]} numberOfLines={2}>
                  {stat.label}
                </Text>
              </Card>
            ))}
          </View>
        </View>
        
        {/* Quick Actions with Icons */}
        <View style={[styles.quickActionsGrid, isRTL && styles.rtl]}>
          <Card
            style={styles.quickActionCard}
            variant="outlined"
            onPress={() => navigation.navigate('MatchesTab')}
          >
            <View style={[styles.quickActionIconBg, { backgroundColor: colors.primary[50] }]}>
              <MaterialCommunityIcons name="magnify" size={28} color={colors.primary[600]} />
            </View>
            <Text style={[styles.quickActionLabel, isRTL && styles.textRight]}>
              {t('browse_matches') || 'Browse Matches'}
            </Text>
            <MaterialCommunityIcons 
              name={isRTL ? 'chevron-left' : 'chevron-right'} 
              size={18} 
              color={colors.text.tertiary} 
            />
          </Card>
          
          <Card
            style={styles.quickActionCard}
            variant="outlined"
            onPress={() => navigation.navigate('ProfileTab')}
          >
            <View style={[styles.quickActionIconBg, { backgroundColor: colors.accent[50] }]}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={28} color={colors.accent[600]} />
            </View>
            <Text style={[styles.quickActionLabel, isRTL && styles.textRight]}>
              {t('my_reports') || 'My Reports'}
            </Text>
            <MaterialCommunityIcons 
              name={isRTL ? 'chevron-left' : 'chevron-right'} 
              size={18} 
              color={colors.text.tertiary} 
            />
          </Card>
        </View>

        {/* Recent Activity (logged in users) */}
        {!isGuest && (
          <View style={styles.section}>
            <SectionHeader 
              title={t('recent_activity') || 'Recent Activity'} 
              actionLabel={t('view_all') || 'View All'} 
              onAction={() => navigation.navigate('MatchesTab')} 
            />
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
              <Card style={styles.emptyCard} variant="outlined">
                <EmptyState
                  icon="inbox"
                  title={t('no_activity_yet') || 'No Activity Yet'}
                  description={t('start_by_reporting') || 'Start by reporting a lost or found item'}
                  action={{
                    label: t('report_now') || 'Report Now',
                    onPress: handleReportLost,
                  }}
                />
              </Card>
            )}
          </View>
        )}

        {/* Success Stories - Social Proof */}
        <View style={styles.section}>
          <View style={[styles.successHeader, isRTL && styles.rtl]}>
            <View>
              <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
                {t('recent_reunions') || 'Recent Reunions'}
              </Text>
              <Text style={[styles.sectionSubtitle, isRTL && styles.textRight]}>
                {t('success_stories_desc') || 'Real people finding their items every day'}
              </Text>
            </View>
            <View style={styles.successBadge}>
              <MaterialCommunityIcons name="heart" size={16} color={colors.error.main} />
            </View>
          </View>
          <FlatList
            data={successStories}
            renderItem={renderSuccessStory}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          />
        </View>
        
        {/* Guest Banner with Better Design */}
        {isGuest && (
          <Card style={styles.guestBanner} variant="outlined">
            <View style={styles.guestGradient} />
            <View style={[styles.guestContent, isRTL && styles.rtl]}>
              <View style={styles.guestIconBubble}>
                <MaterialCommunityIcons name="account-alert-outline" size={24} color={colors.primary[600]} />
              </View>
              <View style={styles.guestTextWrap}>
                <Text style={[styles.guestTitle, isRTL && styles.textRight]}>
                  {t('guest_mode') || 'Browsing as Guest'}
                </Text>
                <Text style={[styles.guestDesc, isRTL && styles.textRight]}>
                  {t('guest_limitations') || 'Sign in to report items and receive match notifications'}
                </Text>
              </View>
              <Button
                title={t('sign_in') || 'Sign In'}
                onPress={() => navigation.navigate('ProfileTab')}
                variant="primary"
                size="small"
              />
            </View>
          </Card>
        )}
        
        {/* Why Choose Us Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRight]}>
            {t('why_mafqood') || 'Why Mafqood?'}
          </Text>
          <View style={styles.benefitsGrid}>
            {benefitCards.map((card) => (
              <Card
                key={card.title}
                style={styles.benefitCard}
                variant="elevated"
              >
                <View style={[styles.benefitIconWrap, { backgroundColor: `${card.color}15` }]}>
                  <MaterialCommunityIcons name={card.icon} size={24} color={card.color} />
                </View>
                <Text style={[styles.benefitTitle, isRTL && styles.textRight]}>{card.title}</Text>
                <Text style={[styles.benefitDesc, isRTL && styles.textRight]}>{card.desc}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={{ height: spacing['3xl'] }} />
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
    paddingTop: spacing.md,
    gap: spacing.xl,
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },

  // Hero with Glassmorphism
  heroCard: {
    padding: 0,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius['3xl'],
    ...shadows.xl,
    overflow: 'hidden',
    minHeight: 360,
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroGradientBg1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.primary[100],
    opacity: 0.3,
    top: -100,
    right: -80,
  },
  heroGradientBg2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: colors.accent[200],
    opacity: 0.25,
    bottom: -60,
    left: -40,
  },
  heroGradientBg3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.highlight[100],
    opacity: 0.2,
    top: 120,
    right: 60,
  },
  heroContent: {
    padding: spacing['2xl'],
    gap: spacing.md,
    position: 'relative',
    zIndex: 1,
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
    borderWidth: 1,
    borderColor: colors.accent[100],
  },
  heroBadgePulse: {
    position: 'absolute',
    left: spacing.xs,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent[500],
  },
  heroBadgeText: {
    color: colors.accent[700],
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.xs,
  },
  heroTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    lineHeight: 42,
    marginTop: spacing.sm,
  },
  heroSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  ctaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  primaryCtaWrapper: {
    flex: 1,
  },
  primaryCta: {
    flex: 1,
    ...shadows.lg,
  },
  secondaryCta: {
    flex: 1,
  },

  // Stats Section
  statsSection: {
    gap: spacing.md,
  },
  statsSectionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutral.white,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickActionCard: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral.white,
  },
  quickActionIconBg: {
    width: 56,
    height: 56,
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
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
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // Recent Items
  recentItemsList: {
    paddingVertical: spacing.xs,
  },
  rtlList: {
    flexDirection: 'row-reverse',
  },
  recentItemCard: {
    width: 240,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.md,
  },
  cardRtl: {
    direction: 'rtl',
  },
  recentItemImageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  recentItemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral[200],
  },
  recentItemImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  recentItemTypeChip: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
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
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  recentItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  recentItemLocation: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  recentItemTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },
  emptyCard: {
    backgroundColor: colors.neutral.white,
    padding: spacing['2xl'],
  },

  // Success Stories
  successHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  successBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successStory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
    borderRadius: borderRadius.xl,
    ...shadows.sm,
  },
  successIconBubble: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    flex: 1,
    gap: spacing.xs,
  },
  successTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  successMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },

  // Guest Banner
  guestBanner: {
    borderColor: colors.primary[200],
    backgroundColor: colors.neutral.white,
    padding: spacing.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  guestGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary[50],
    opacity: 0.5,
  },
  guestContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    position: 'relative',
    zIndex: 1,
  },
  guestIconBubble: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTextWrap: {
    flex: 1,
    gap: spacing.xs,
  },
  guestTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  guestDesc: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },

  // Benefits
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  benefitCard: {
    flex: 1,
    minWidth: '47%',
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.neutral.white,
  },
  benefitIconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  benefitDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

export default HomeScreen;
