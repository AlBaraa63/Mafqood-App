/**
 * Home Screen - Bento Grid Dashboard (2025)
 * Premium, minimalist dashboard with AI-powered insights
 * Optimized for all screen sizes with minimal scrolling
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Header } from '../../components/common/Header';
import { HeroCard, StatusCard, QuickActionCard, RecentActivityCarousel } from '../../components/home';
import { useAuthStore, useReportFormStore } from '../../hooks/useStore';
import api from '../../api';
import { Item, MainTabParamList } from '../../types';
import { colors, spacing } from '../../theme';

type NavigationProp = NativeStackNavigationProp<MainTabParamList>;

export const HomeScreenBento: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isGuest, user } = useAuthStore();
  const { setType, resetForm } = useReportFormStore();

  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [activeReports, setActiveReports] = useState(0);
  const [newMatches, setNewMatches] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const loadData = async () => {
    try {
      const response = await api.getMyItems();
      if (response.success && response.data) {
        // Get all items and sort by creation date
        const allItems = [
          ...response.data.lostItems.map(g => g.item),
          ...response.data.foundItems.map(g => g.item),
        ].sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Set recent items (limit to 5 for carousel)
        setRecentItems(allItems.slice(0, 5));

        // Calculate stats
        const activeCount = allItems.filter(item => item.status === 'open').length;
        const matchCount = allItems.filter(item => item.status === 'matched').length;

        setActiveReports(activeCount);
        setNewMatches(matchCount);
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
    loadData();
  };

  const handleReportLost = () => {
    resetForm();
    setType('lost');
    navigation.navigate('ReportTab' as any, {
      screen: 'ReportPhoto',
      params: { type: 'lost' },
    });
  };

  const handleReportFound = () => {
    resetForm();
    setType('found');
    navigation.navigate('ReportTab' as any, {
      screen: 'ReportPhoto',
      params: { type: 'found' },
    });
  };

  const handleProfilePress = () => {
    navigation.navigate('ProfileTab');
  };

  const handleNotificationPress = () => {
    navigation.navigate('NotificationsTab');
    setHasUnreadNotifications(false);
    setNotificationCount(0);
  };

  const handleViewMatches = () => {
    navigation.navigate('MatchesTab');
  };

  const handleViewReports = () => {
    navigation.navigate('ProfileTab', { screen: 'MyReports' });
  };

  const handleItemPress = (item: Item) => {
    navigation.navigate('MatchesTab', { screen: 'MatchDetail', params: { itemId: item.id } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Header
        avatarUrl={user?.avatarUrl}
        userName={user?.fullName || 'Guest'}
        hasUnreadNotifications={hasUnreadNotifications}
        notificationCount={notificationCount}
        onProfilePress={handleProfilePress}
        onNotificationPress={handleNotificationPress}
      />

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      >
        {/* 1. Hero Card - Primary Actions */}
        <View style={styles.section}>
          <HeroCard
            onReportLost={handleReportLost}
            onReportFound={handleReportFound}
          />
        </View>

        {/* 2. Status Card - Active Reports & Matches */}
        <View style={styles.section}>
          <StatusCard
            activeReports={activeReports}
            newMatches={newMatches}
          />
        </View>

        {/* 3. Quick Action Cards - Secondary Navigation */}
        <View style={styles.section}>
          <QuickActionCard
            onViewMatches={handleViewMatches}
            onViewReports={handleViewReports}
          />
        </View>

        {/* 4. Recent Activity Carousel - Horizontal Scroll */}
        {recentItems.length > 0 && (
          <View style={styles.carouselSection}>
            <RecentActivityCarousel
              items={recentItems}
              onItemPress={handleItemPress}
            />
          </View>
        )}

        {/* 5. Empty State or Community Impact */}
        {recentItems.length === 0 && !isLoading && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="inbox-outline"
              size={48}
              color={colors.neutral[300]}
            />
            <Text style={styles.emptyStateTitle}>No Reports Yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Start by reporting a lost or found item
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  section: {
    marginBottom: spacing.lg,
  },
  carouselSection: {
    marginHorizontal: -spacing.lg,
    marginBottom: spacing.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

export default HomeScreenBento;
