/**
 * Matches List Screen - Native Mobile Design
 * - iOS-style grouped sections with proper disclosure indicators
 * - Platform-specific visual feedback (iOS highlights / Android ripple)
 * - Native segmented control for filtering
 * - Proper list item patterns matching iOS/Android conventions
 * - Real AI-calculated match percentages from backend
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  TouchableHighlight,
  Image,
  RefreshControl,
  StatusBar,
  Platform,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  Layout,
} from 'react-native-reanimated';

import { Loading, EmptyState } from '../../components/common';
import { useDynamicStyles, useTranslation, useFormatDate, useHaptics } from '../../hooks';
import { useAuthStore } from '../../hooks/useStore';
import api from '../../api';
import { MatchesStackParamList, MatchGroup } from '../../types';
import { colors } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

type NavigationProp = NativeStackNavigationProp<MatchesStackParamList, 'MatchesList'>;
type TabType = 'lost' | 'found';
type FilterType = 'all' | 'high' | 'medium' | 'low';

// Platform-specific icon component
interface PlatformIconProps {
  iosName: keyof typeof Ionicons.glyphMap;
  androidName: keyof typeof MaterialCommunityIcons.glyphMap;
  size: number;
  color: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ iosName, androidName, size, color }) => {
  if (isIOS) {
    return <Ionicons name={iosName} size={size} color={color} />;
  }
  return <MaterialCommunityIcons name={androidName} size={size} color={color} />;
};

// Native Segmented Control Component
interface SegmentedControlProps {
  segments: { key: string; label: string; count?: number }[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({ segments, selectedKey, onSelect }) => {
  const haptics = useHaptics();
  
  return (
    <View style={styles.segmentedControl}>
      {segments.map((segment, index) => {
        const isSelected = segment.key === selectedKey;
        const isFirst = index === 0;
        const isLast = index === segments.length - 1;
        
        return (
          <TouchableOpacity
            key={segment.key}
            onPress={() => {
              haptics.selection();
              onSelect(segment.key);
            }}
            activeOpacity={0.7}
            style={[
              styles.segmentButton,
              isSelected && styles.segmentButtonActive,
              isFirst && styles.segmentButtonFirst,
              isLast && styles.segmentButtonLast,
            ]}
          >
            <Text style={[
              styles.segmentText,
              isSelected && styles.segmentTextActive,
            ]}>
              {segment.label}
            </Text>
            {segment.count !== undefined && segment.count > 0 && (
              <View style={[
                styles.segmentBadge,
                isSelected && styles.segmentBadgeActive,
              ]}>
                <Text style={[
                  styles.segmentBadgeText,
                  isSelected && styles.segmentBadgeTextActive,
                ]}>
                  {segment.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// Native Tab Bar (iOS style)
interface TabBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  lostCount: number;
  foundCount: number;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange, lostCount, foundCount }) => {
  const { t } = useTranslation();
  const haptics = useHaptics();
  
  return (
    <View style={styles.tabBar}>
      <TouchableOpacity
        onPress={() => {
          haptics.selection();
          onTabChange('lost');
        }}
        style={[styles.tab, activeTab === 'lost' && styles.tabActive]}
        activeOpacity={0.7}
      >
        <PlatformIcon
          iosName="search"
          androidName="magnify"
          size={20}
          color={activeTab === 'lost' ? colors.error.main : colors.text.tertiary}
        />
        <Text style={[
          styles.tabText,
          activeTab === 'lost' && styles.tabTextActive,
          activeTab === 'lost' && { color: colors.error.main },
        ]}>
          {t('tab_lost_items')}
        </Text>
        {lostCount > 0 && (
          <View style={[styles.tabBadge, { backgroundColor: colors.error.main }]}>
            <Text style={styles.tabBadgeText}>{lostCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => {
          haptics.selection();
          onTabChange('found');
        }}
        style={[styles.tab, activeTab === 'found' && styles.tabActive]}
        activeOpacity={0.7}
      >
        <PlatformIcon
          iosName="gift-outline"
          androidName="hand-heart"
          size={20}
          color={activeTab === 'found' ? colors.success.main : colors.text.tertiary}
        />
        <Text style={[
          styles.tabText,
          activeTab === 'found' && styles.tabTextActive,
          activeTab === 'found' && { color: colors.success.main },
        ]}>
          {t('tab_found_items')}
        </Text>
        {foundCount > 0 && (
          <View style={[styles.tabBadge, { backgroundColor: colors.success.main }]}>
            <Text style={styles.tabBadgeText}>{foundCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

// Stats Summary Component (iOS-style grouped card)
interface StatsSummaryProps {
  totalItems: number;
  totalMatches: number;
  highConfidence: number;
  avgConfidence: number;
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ 
  totalItems, 
  totalMatches, 
  highConfidence,
  avgConfidence 
}) => {
  const { t } = useTranslation();
  
  return (
    <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalItems}</Text>
          <Text style={styles.statLabel}>{t('your_items') || 'Your Items'}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalMatches}</Text>
          <Text style={styles.statLabel}>{t('total_matches') || 'Matches'}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.success.main }]}>{highConfidence}</Text>
          <Text style={styles.statLabel}>{t('high_conf') || 'High Conf.'}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.accent[600] }]}>{avgConfidence}%</Text>
          <Text style={styles.statLabel}>{t('avg_score') || 'Avg Score'}</Text>
        </View>
      </View>
    </Animated.View>
  );
};

// Native Match List Item (iOS TableView cell style)
interface MatchListItemProps {
  matchGroup: MatchGroup;
  onPress: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const MatchListItem: React.FC<MatchListItemProps> = ({ matchGroup, onPress, isFirst, isLast }) => {
  const { t } = useTranslation();
  const { formatRelative } = useFormatDate();
  const haptics = useHaptics();
  
  const { item, matches } = matchGroup;
  const topMatch = matches[0];
  
  const handlePress = () => {
    haptics.light();
    onPress();
  };
  
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return colors.success.main;
      case 'medium': return colors.warning.main;
      case 'low': return colors.error.light;
      default: return colors.text.tertiary;
    }
  };
  
  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return t('high_match') || 'High Match';
      case 'medium': return t('medium_match') || 'Medium Match';
      case 'low': return t('possible_match') || 'Possible Match';
      default: return '';
    }
  };
  
  const Wrapper = isIOS ? TouchableHighlight : TouchableOpacity;
  const wrapperProps = isIOS 
    ? { underlayColor: colors.neutral[100], onPress: handlePress }
    : { onPress: handlePress, activeOpacity: 0.7 };
  
  return (
    <Wrapper {...wrapperProps}>
      <View style={[
        styles.listItem,
        isFirst && styles.listItemFirst,
        isLast && styles.listItemLast,
        !isLast && styles.listItemBorder,
      ]}>
        {/* Item Image with Match Preview */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.itemImage}
            resizeMode="cover"
          />
          {topMatch && (
            <View style={styles.matchImageOverlay}>
              <Image
                source={{ uri: topMatch.matchedItem.imageUrl }}
                style={styles.matchImageSmall}
                resizeMode="cover"
              />
            </View>
          )}
        </View>
        
        {/* Content */}
        <View style={styles.listItemContent}>
          <View style={styles.listItemHeader}>
            <Text style={styles.listItemTitle} numberOfLines={1}>
              {item.title}
            </Text>
            {matches.length > 1 && (
              <View style={styles.matchCountBadge}>
                <Text style={styles.matchCountText}>+{matches.length - 1}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.listItemMeta}>
            <PlatformIcon
              iosName="location-outline"
              androidName="map-marker-outline"
              size={14}
              color={colors.text.tertiary}
            />
            <Text style={styles.listItemLocation} numberOfLines={1}>
              {item.location}
            </Text>
            <Text style={styles.listItemTime}>
              {formatRelative(item.createdAt)}
            </Text>
          </View>
          
          {topMatch && (
            <View style={styles.matchInfo}>
              <View style={[
                styles.confidenceIndicator,
                { backgroundColor: getConfidenceColor(topMatch.confidence) }
              ]} />
              <Text style={[
                styles.confidenceText,
                { color: getConfidenceColor(topMatch.confidence) }
              ]}>
                {getConfidenceLabel(topMatch.confidence)} ({topMatch.similarity}%)
              </Text>
            </View>
          )}
          
          {/* Show pending status only for items not yet processed by AI */}
          {!topMatch && item.aiProcessed === false && (
            <View style={styles.matchInfo}>
              <View style={[
                styles.confidenceIndicator,
                { backgroundColor: colors.accent[500] }
              ]} />
              <Text style={[
                styles.confidenceText,
                { color: colors.accent[500] }
              ]}>
                {t('pending_ai_analysis') || 'Pending AI analysis...'}
              </Text>
            </View>
          )}
          
          {/* Show "No matches" for processed items with no matches */}
          {!topMatch && item.aiProcessed === true && (
            <View style={styles.matchInfo}>
              <View style={[
                styles.confidenceIndicator,
                { backgroundColor: colors.text.tertiary }
              ]} />
              <Text style={[
                styles.confidenceText,
                { color: colors.text.tertiary }
              ]}>
                {t('no_matches_yet') || 'No matches yet'}
              </Text>
            </View>
          )}
        </View>
        
        {/* Disclosure Indicator (iOS style) */}
        <View style={styles.disclosure}>
          <PlatformIcon
            iosName="chevron-forward"
            androidName="chevron-right"
            size={20}
            color={colors.text.tertiary}
          />
        </View>
      </View>
    </Wrapper>
  );
};

// Native Section Header
interface SectionHeaderProps {
  title: string;
  count: number;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, count }) => {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <Text style={styles.sectionHeaderCount}>{count} {count === 1 ? 'item' : 'items'}</Text>
    </View>
  );
};

// Native Empty State
interface NativeEmptyStateProps {
  activeTab: TabType;
}

const NativeEmptyState: React.FC<NativeEmptyStateProps> = ({ activeTab }) => {
  const { t } = useTranslation();
  
  return (
    <Animated.View entering={FadeIn.delay(200)} style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <PlatformIcon
          iosName={activeTab === 'lost' ? 'search' : 'gift-outline'}
          androidName={activeTab === 'lost' ? 'magnify' : 'hand-heart'}
          size={48}
          color={colors.text.tertiary}
        />
      </View>
      <Text style={styles.emptyTitle}>{t('no_matches_yet')}</Text>
      <Text style={styles.emptyDescription}>{t('no_matches_desc')}</Text>
    </Animated.View>
  );
};

// Guest State View
const GuestStateView: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <View style={styles.guestContainer}>
      <View style={styles.guestIconContainer}>
        <PlatformIcon
          iosName="lock-closed"
          androidName="account-lock"
          size={56}
          color={colors.text.tertiary}
        />
      </View>
      <Text style={styles.guestTitle}>{t('guest_cannot_match')}</Text>
      <Text style={styles.guestDescription}>{t('guest_mode_limited')}</Text>
    </View>
  );
};

// Main Screen Component
export const MatchesListScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const haptics = useHaptics();
  const { isGuest, token } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabType>('lost');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [lostMatches, setLostMatches] = useState<MatchGroup[]>([]);
  const [foundMatches, setFoundMatches] = useState<MatchGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadMatches = useCallback(async () => {
    try {
      const response = await api.getMatches(token);
      if (response.success && response.data) {
        setLostMatches(response.data.lostMatches || []);
        setFoundMatches(response.data.foundMatches || []);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isGuest) {
      loadMatches();
    } else {
      setIsLoading(false);
    }
  }, [isGuest, loadMatches]);

  const handleRefresh = useCallback(() => {
    haptics.light();
    setIsRefreshing(true);
    loadMatches();
  }, [loadMatches, haptics]);

  const handleMatchPress = useCallback((matchId: string) => {
    haptics.medium();
    navigation.navigate('MatchDetail', { matchId });
  }, [navigation, haptics]);

  // Current data based on active tab
  const currentData = activeTab === 'lost' ? lostMatches : foundMatches;

  // Filter data
  const filteredData = useMemo(() => {
    if (filterType === 'all') return currentData;
    if (filterType === 'pending') {
      return currentData.filter(group => group.matches.length === 0);
    }
    return currentData.filter(group => {
      const topMatch = group.matches[0];
      return topMatch && topMatch.confidence === filterType;
    });
  }, [currentData, filterType]);

  // Group data by confidence for section list
  const sectionedData = useMemo(() => {
    const grouped = {
      high: filteredData.filter(g => g.matches[0]?.confidence === 'high'),
      medium: filteredData.filter(g => g.matches[0]?.confidence === 'medium'),
      low: filteredData.filter(g => g.matches[0]?.confidence === 'low'),
      pending: filteredData.filter(g => g.matches.length === 0),
    };

    const sections = [];
    if (grouped.high.length > 0) {
      sections.push({ 
        title: t('high_confidence') || 'High Confidence', 
        data: grouped.high,
        confidence: 'high' as const
      });
    }
    if (grouped.medium.length > 0) {
      sections.push({ 
        title: t('medium_confidence') || 'Medium Confidence', 
        data: grouped.medium,
        confidence: 'medium' as const
      });
    }
    if (grouped.low.length > 0) {
      sections.push({ 
        title: t('low_confidence') || 'Possible Matches', 
        data: grouped.low,
        confidence: 'low' as const
      });
    }
    // Show items waiting for AI matching
    if (grouped.pending.length > 0) {
      sections.push({ 
        title: t('pending_matches') || 'Awaiting AI Matching', 
        data: grouped.pending,
        confidence: 'pending' as const
      });
    }

    return sections;
  }, [filteredData, t]);

  // Calculate statistics
  const stats = useMemo(() => {
    // Count all items (regardless of whether they have matches)
    const totalItems = currentData.length;
    // Only count items that actually have matches for match-related stats
    const itemsWithMatches = currentData.filter(group => group.matches.length > 0);
    const totalMatches = itemsWithMatches.reduce((sum, group) => sum + group.matches.length, 0);
    const highConfidence = itemsWithMatches.filter(group =>
      group.matches.some(m => m.confidence === 'high')
    ).length;
    const avgConfidence = itemsWithMatches.length > 0
      ? Math.round(
          itemsWithMatches.reduce((sum, group) => {
            const topMatch = group.matches[0];
            return sum + (topMatch?.similarity || 0);
          }, 0) / itemsWithMatches.length
        )
      : 0;

    return {
      total: totalItems,
      matches: totalMatches,
      high: highConfidence,
      avgConfidence,
    };
  }, [currentData]);

  // Filter counts - only count items that have matches
  const filterCounts = useMemo(() => {
    const itemsWithMatches = currentData.filter(g => g.matches.length > 0);
    return {
      all: itemsWithMatches.length,
      high: itemsWithMatches.filter(g => g.matches[0]?.confidence === 'high').length,
      medium: itemsWithMatches.filter(g => g.matches[0]?.confidence === 'medium').length,
      low: itemsWithMatches.filter(g => g.matches[0]?.confidence === 'low').length,
    };
  }, [currentData]);

  const lostCount = lostMatches.reduce((acc, mg) => acc + mg.matches.length, 0);
  const foundCount = foundMatches.reduce((acc, mg) => acc + mg.matches.length, 0);

  // Guest State
  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
        <View style={styles.header}>
          <Animated.Text entering={FadeIn} style={styles.headerTitle}>
            {t('matches_title')}
          </Animated.Text>
          <Animated.Text entering={FadeIn.delay(100)} style={styles.headerSubtitle}>
            {t('matches_subtitle')}
          </Animated.Text>
        </View>
        <GuestStateView />
      </SafeAreaView>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('matches_title')}</Text>
          <Text style={styles.headerSubtitle}>{t('matches_subtitle')}</Text>
        </View>
        <Loading text={t('loading')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.springify()}>
          <Text style={styles.headerTitle}>{t('matches_title')}</Text>
          <Text style={styles.headerSubtitle}>{t('matches_dashboard_subtitle')}</Text>
        </Animated.View>
      </View>

      {/* Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        lostCount={lostCount}
        foundCount={foundCount}
      />

      {/* Stats Summary */}
      <StatsSummary
        totalItems={stats.total}
        totalMatches={stats.matches}
        highConfidence={stats.high}
        avgConfidence={stats.avgConfidence}
      />

      {/* Filter Segmented Control */}
      <View style={styles.filterContainer}>
        <SegmentedControl
          segments={[
            { key: 'all', label: t('all') || 'All', count: filterCounts.all },
            { key: 'high', label: t('high') || 'High', count: filterCounts.high },
            { key: 'medium', label: t('medium') || 'Med', count: filterCounts.medium },
            { key: 'low', label: t('low') || 'Low', count: filterCounts.low },
          ]}
          selectedKey={filterType}
          onSelect={(key) => setFilterType(key as FilterType)}
        />
      </View>

      {/* Section List */}
      <SectionList
        sections={sectionedData}
        keyExtractor={(item) => item.item.id}
        renderItem={({ item, index, section }) => (
          <Animated.View entering={FadeInUp.delay(index * 30).springify()} layout={Layout.springify()}>
            <MatchListItem
              matchGroup={item}
              onPress={() => {
                // Only navigate if there are actual matches
                if (item.matches.length > 0 && item.matches[0].id) {
                  handleMatchPress(item.matches[0].id);
                }
                // If no matches, could show a toast or do nothing
              }}
              isFirst={index === 0}
              isLast={index === section.data.length - 1}
            />
          </Animated.View>
        )}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} count={section.data.length} />
        )}
        stickySectionHeadersEnabled={isIOS}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.accent[500]}
            colors={[colors.accent[500]]}
          />
        }
        ListEmptyComponent={<NativeEmptyState activeTab={activeTab} />}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => null}
        SectionSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isIOS ? colors.neutral[100] : colors.background.primary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.background.primary,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: isIOS ? 0.4 : 0,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.text.secondary,
    marginTop: 4,
  },
  
  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.neutral[100],
  },
  tabActive: {
    backgroundColor: colors.neutral[200],
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.tertiary,
  },
  tabTextActive: {
    fontWeight: '600',
  },
  tabBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral.white,
  },

  // Stats
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.neutral[200],
  },

  // Filter
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[200],
    borderRadius: 8,
    padding: 2,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: colors.background.primary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  segmentButtonFirst: {},
  segmentButtonLast: {},
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  segmentTextActive: {
    color: colors.text.primary,
    fontWeight: '600',
  },
  segmentBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[300],
    paddingHorizontal: 5,
  },
  segmentBadgeActive: {
    backgroundColor: colors.primary[500],
  },
  segmentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  segmentBadgeTextActive: {
    color: colors.neutral.white,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: isIOS ? colors.neutral[100] : colors.background.primary,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionHeaderCount: {
    fontSize: 13,
    color: colors.text.tertiary,
  },

  // List Items
  listContent: {
    paddingBottom: 100,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.primary,
    marginHorizontal: 16,
  },
  listItemFirst: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  listItemLast: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  listItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  imageContainer: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.neutral[200],
  },
  matchImageOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.background.primary,
    overflow: 'hidden',
  },
  matchImageSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral[200],
  },
  listItemContent: {
    flex: 1,
    marginRight: 8,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  matchCountBadge: {
    backgroundColor: colors.accent[500],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  matchCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  listItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  listItemLocation: {
    fontSize: 13,
    color: colors.text.tertiary,
    flex: 1,
  },
  listItemTime: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  matchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  confidenceIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
  },
  disclosure: {
    marginLeft: 4,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Guest State
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  guestIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  guestDescription: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default MatchesListScreen;
