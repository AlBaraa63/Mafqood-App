/**
 * Mafqood Mobile - Matches Screen
 * Shows history of lost and found items with their matches
 * Native-first design with segmented control
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, borderRadius, typography, spacing, shadows, layout } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';
import { fetchHistory, buildImageUrl } from '../api/client';
import { MATCH_THRESHOLD, HIGH_MATCH_THRESHOLD } from '../api/config';
import { ItemInDBBase, Match, Item as ItemType, RootStackParamList, MatchResult, ItemWithMatches as BackendItemWithMatches } from '../types/itemTypes';
import { Screen, SegmentedControl } from '../components/ui';
import { SimpleHeader } from '../components/ui/Header';
import ItemCard from '../components/ItemCard';

type TabType = 'lost' | 'found';
type ItemWithMatches = ItemType & { matches: Match[] };
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function MatchesScreen() {
  const { t } = useLanguage();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('lost');

  const { data: history, isLoading, isError, refetch } = useQuery({
    queryKey: ['history'],
    queryFn: fetchHistory,
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ['history'] });
    await refetch();
    setRefreshing(false);
  }, [queryClient, refetch]);

  // Convert backend item to app Item type
  const convertToItem = (item: ItemInDBBase, type: 'lost' | 'found'): ItemType => ({
    id: item.id.toString(),
    type,
    imageUrl: buildImageUrl(item.image_url),
    where: item.location_type || 'Unknown',
    specificPlace: item.location_detail || undefined,
    when: item.time_frame || 'Unknown',
    description: item.description || item.title || t('no_description'),
    timestamp: new Date(item.created_at),
  });

  // Convert backend matches to app Match type
  const convertMatchResult = (matchResult: MatchResult, oppositeType: 'lost' | 'found'): Match => ({
    id: matchResult.item.id.toString(),
    item: convertToItem(matchResult.item, oppositeType),
    similarity: Math.round(matchResult.similarity * 100),
    status: matchResult.similarity >= HIGH_MATCH_THRESHOLD ? 'high' : 'possible',
  });

  // Get items with their matches from backend response
  const getItemsWithMatches = (type: 'lost' | 'found'): ItemWithMatches[] => {
    if (!history) return [];

    // Support both API formats: lost_items/found_items (new) and lost/found (legacy)
    const rawItems = type === 'lost' 
      ? (history.lost_items || history.lost || [])
      : (history.found_items || history.found || []);
    const oppositeType: 'lost' | 'found' = type === 'lost' ? 'found' : 'lost';

    return rawItems.map((rawItem: any) => {
      // Check if this is the new format (ItemWithMatches) or legacy format (ItemInDBBase)
      const item: ItemInDBBase = rawItem.item ? rawItem.item : rawItem;
      const backendMatches: MatchResult[] = rawItem.matches || [];

      // Convert backend matches to frontend format, filtering by threshold
      const matches: Match[] = backendMatches
        .filter((m: MatchResult) => m.similarity >= MATCH_THRESHOLD)
        .map((m: MatchResult) => convertMatchResult(m, oppositeType));

      return {
        ...convertToItem(item, type),
        matches: matches.sort((a, b) => b.similarity - a.similarity),
      };
    });
  };

  const lostItems = getItemsWithMatches('lost');
  const foundItems = getItemsWithMatches('found');
  const currentItems = activeTab === 'lost' ? lostItems : foundItems;

  const handleItemPress = (item: ItemWithMatches) => {
    navigation.navigate('MatchDetails', { item, matches: item.matches || [] });
  };

  const renderItem = ({ item }: { item: ItemWithMatches }) => (
    <TouchableOpacity onPress={() => handleItemPress(item)} activeOpacity={0.7}>
      <ItemCard item={item} matches={item.matches || []} />
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons 
          name={activeTab === 'lost' ? 'search-outline' : 'hand-left-outline'} 
          size={40} 
          color={colors.text.light} 
        />
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === 'lost' ? t('matches_no_lost_items') : t('matches_no_found_items')}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'lost' ? t('matches_no_lost_subtitle') : t('matches_no_found_subtitle')}
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { backgroundColor: activeTab === 'lost' ? colors.primary.dark : colors.primary.accent }]}
        onPress={() => navigation.navigate('MainTabs', { screen: 'Report', params: { type: activeTab } } as any)}
      >
        <Ionicons name="add" size={18} color={colors.text.white} />
        <Text style={styles.emptyButtonText}>
          {activeTab === 'lost' ? t('home_cta_lost') : t('home_cta_found')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Loading state
  if (isLoading) {
    return (
      <Screen backgroundColor={colors.background.secondary} statusBarStyle="dark-content" scroll={false}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={colors.primary.accent} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </Screen>
    );
  }

  // Error state
  if (isError) {
    return (
      <Screen backgroundColor={colors.background.secondary} statusBarStyle="dark-content" scroll={false}>
        <View style={styles.centeredContainer}>
          <Ionicons name="cloud-offline-outline" size={48} color={colors.status.error} />
          <Text style={styles.errorTitle}>{t('error_loading')}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    );
  }

  // Calculate stats
  const totalMatches = currentItems.reduce((sum, item) => sum + (item.matches?.length || 0), 0);
  const highMatches = currentItems.reduce((sum, item) => 
    sum + (item.matches?.filter(m => m.status === 'high').length || 0), 0
  );

  return (
    <Screen backgroundColor={colors.background.secondary} statusBarStyle="dark-content" scroll={false} bottomPadding={false}>
      {/* Header */}
      <SimpleHeader title={t('matches_page_title')} subtitle={t('matches_page_subtitle')} />

      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        <SegmentedControl
          segments={[
            { 
              key: 'lost', 
              label: `${t('tab_lost_items')} (${lostItems.length})`,
            },
            { 
              key: 'found', 
              label: `${t('tab_found_items')} (${foundItems.length})`,
            },
          ]}
          selectedKey={activeTab}
          onSelect={(key: string) => setActiveTab(key as TabType)}
          accentColor={activeTab === 'lost' ? colors.primary.dark : colors.primary.accent}
        />
      </View>

      {/* Quick Stats */}
      {currentItems.length > 0 && (
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Ionicons name="albums-outline" size={14} color={colors.primary.dark} />
            <Text style={styles.statText}>{currentItems.length} {t('stats_total_items').toLowerCase()}</Text>
          </View>
          <View style={styles.statChip}>
            <Ionicons name="git-compare-outline" size={14} color={colors.primary.accent} />
            <Text style={styles.statText}>{totalMatches} {t('stats_total_matches').toLowerCase()}</Text>
          </View>
          {highMatches > 0 && (
            <View style={[styles.statChip, { backgroundColor: colors.status.successBg }]}>
              <Ionicons name="star" size={14} color={colors.status.success} />
              <Text style={[styles.statText, { color: colors.status.success }]}>{highMatches}</Text>
            </View>
          )}
        </View>
      )}

      {/* Items List */}
      <FlatList
        data={currentItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          currentItems.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.accent]}
            tintColor={colors.primary.accent}
          />
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  // Segment
  segmentContainer: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.sm,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.background.tertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },

  // List
  listContent: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.tabBarHeight + spacing.lg,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  itemSeparator: {
    height: spacing.sm,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  emptyButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.white,
  },

  // Centered states
  centeredContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary.accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.white,
  },
});
