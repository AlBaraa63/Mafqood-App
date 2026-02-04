/**
 * Matches List Screen
 * Modern, on-brand list of AI matches
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Loading, EmptyState, ConfidenceBadge, TypeChip } from '../../components/common';
import { useTranslation, useFormatDate } from '../../hooks';
import { useAuthStore } from '../../hooks/useStore';
import api from '../../api';
import { MatchesStackParamList, MatchGroup } from '../../types';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

type NavigationProp = NativeStackNavigationProp<MatchesStackParamList, 'MatchesList'>;
type TabType = 'lost' | 'found';

export const MatchesListScreen: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const { formatRelative } = useFormatDate();
  const navigation = useNavigation<NavigationProp>();
  const { isGuest, token } = useAuthStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('lost');
  const [lostMatches, setLostMatches] = useState<MatchGroup[]>([]);
  const [foundMatches, setFoundMatches] = useState<MatchGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const loadMatches = async () => {
    try {
      const response = await api.getMatches(token);
      if (response.success && response.data) {
        setLostMatches(response.data.lostMatches);
        setFoundMatches(response.data.foundMatches);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  useEffect(() => {
    if (!isGuest) {
      loadMatches();
    } else {
      setIsLoading(false);
    }
  }, [isGuest]);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadMatches();
  };
  
  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return t('confidence_high');
      case 'medium': return t('confidence_medium');
      case 'low': return t('confidence_low');
      default: return confidence;
    }
  };
  
  const renderMatchCard = ({ item: matchGroup }: { item: MatchGroup }) => {
    const { item, matches } = matchGroup;
    const hasMatches = matches.length > 0;
    const topMatch = hasMatches ? matches[0] : null;
    
    return (
      <Card style={styles.matchCard} variant="elevated">
        <View style={[styles.cardHeader, isRTL && styles.rtl]}>
          <TypeChip
            type={item.type}
            label={item.type === 'lost' ? t('lost_item') : t('found_item')}
          />
          <Text style={[styles.metaText, isRTL && styles.textRight]}>{formatRelative(item.createdAt)}</Text>
        </View>

        <View style={[styles.cardBody, isRTL && styles.rtl]}>
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
          <View style={styles.itemInfo}>
            <Text style={[styles.itemTitle, isRTL && styles.textRight]} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={[styles.itemRow, isRTL && styles.rtl]}>
              <MaterialCommunityIcons name="map-marker-radius" size={16} color={colors.accent[600]} />
              <Text style={[styles.itemLocation, isRTL && styles.textRight]} numberOfLines={1}>
                {item.location}
              </Text>
            </View>
            {topMatch && (
              <View style={styles.confidenceRow}>
                <ConfidenceBadge
                  confidence={topMatch.confidence}
                  label={getConfidenceLabel(topMatch.confidence)}
                  percentage={topMatch.similarity}
                />
              </View>
            )}
          </View>
        </View>

        {hasMatches ? (
          <View style={styles.matchList}>
            {matches.slice(0, 3).map((match) => (
              <TouchableOpacity
                key={match.id}
                style={[styles.matchItem, isRTL && styles.rtl]}
                onPress={() => navigation.navigate('MatchDetail', { matchId: match.id })}
                activeOpacity={0.8}
              >
                <Image
                  source={{ uri: match.matchedItem.imageUrl }}
                  style={styles.matchImage}
                />
                <View style={styles.matchDetails}>
                  <Text style={[styles.matchTitle, isRTL && styles.textRight]} numberOfLines={1}>{match.matchedItem.title}</Text>
                  <Text style={[styles.matchMeta, isRTL && styles.textRight]} numberOfLines={1}>
                    {match.matchedItem.location}
                  </Text>
                </View>
                <ConfidenceBadge
                  confidence={match.confidence}
                  label={getConfidenceLabel(match.confidence)}
                  percentage={match.similarity}
                />
              </TouchableOpacity>
            ))}
            {matches.length > 3 && (
              <Text style={[styles.moreText, isRTL && styles.textLeft]}>
                {t('matches_more_count', { count: (matches.length - 3).toString() })}
              </Text>
            )}
          </View>
        ) : (
          <View style={[styles.noMatchesSection, isRTL && styles.rtl]}>
            <MaterialCommunityIcons name="radar" size={18} color={colors.text.tertiary} />
            <Text style={[styles.noMatchesText, isRTL && styles.textRight]}>{t('no_matches_desc')}</Text>
          </View>
        )}
      </Card>
    );
  };
  
  const currentData = activeTab === 'lost' ? lostMatches : foundMatches;
  
  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, isRTL && styles.textRight]}>{t('matches_title')}</Text>
          <Text style={[styles.subtitle, isRTL && styles.textRight]}>{t('matches_subtitle')}</Text>
        </View>
        <EmptyState
          icon='dY"`'
          title={t('guest_cannot_match')}
          description={t('guest_mode_limited')}
        />
      </SafeAreaView>
    );
  }
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={[styles.title, isRTL && styles.textRight]}>{t('matches_title')}</Text>
          <Text style={[styles.subtitle, isRTL && styles.textRight]}>{t('matches_subtitle')}</Text>
        </View>
        <Loading text={t('loading')} />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, isRTL && styles.textRight]}>{t('matches_title')}</Text>
          <Text style={[styles.subtitle, isRTL && styles.textRight]}>{t('matches_dashboard_subtitle')}</Text>
        </View>
      </View>
      
      {/* Tabs */}
      <View style={[styles.tabs, isRTL && styles.rtl]}>
        <TouchableOpacity
          style={[styles.tab, isRTL && styles.rtl, activeTab === 'lost' && styles.tabActive]}
          onPress={() => setActiveTab('lost')}
        >
          <MaterialCommunityIcons name="magnify" size={16} color={activeTab === 'lost' ? colors.neutral.white : colors.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'lost' && styles.tabTextActive]}>
            {t('tab_lost_items')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, isRTL && styles.rtl, activeTab === 'found' && styles.tabActive]}
          onPress={() => setActiveTab('found')}
        >
          <MaterialCommunityIcons name="package-variant-closed" size={16} color={activeTab === 'found' ? colors.neutral.white : colors.text.secondary} />
          <Text style={[styles.tabText, activeTab === 'found' && styles.tabTextActive]}>
            {t('tab_found_items')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* List */}
      <FlatList
        data={currentData}
        renderItem={renderMatchCard}
        keyExtractor={(item) => item.item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.accent[500]]}
            tintColor={colors.accent[500]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="dYZ_"
            title={t('no_matches_yet')}
            description={t('no_matches_desc')}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.primary,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'left',
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  textRight: {
    textAlign: 'right',
  },
  textLeft: {
    textAlign: 'left',
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
  },
  tabActive: {
    backgroundColor: colors.primary[500],
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.neutral.white,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },
  matchCard: {
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  cardBody: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemImage: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.neutral[200],
  },
  itemInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  itemTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemLocation: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  confidenceRow: {
    marginTop: spacing.xs,
  },
  matchList: {
    gap: spacing.sm,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.neutral[50],
  },
  matchImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[200],
  },
  matchDetails: {
    flex: 1,
    gap: 2,
  },
  matchTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  matchMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  moreText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textAlign: 'right',
  },
  noMatchesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.neutral[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  noMatchesText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'left',
  },
});

export default MatchesListScreen;
