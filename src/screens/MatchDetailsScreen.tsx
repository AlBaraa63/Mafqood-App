/**
 * Mafqood Mobile - Match Details Screen
 * Shows full details of an item and its matches
 * Native-first design with clean layout
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { colors, borderRadius, typography, spacing, shadows, layout } from '../theme/theme';
import { useLanguage } from '../context/LanguageContext';
import { Item, Match, RootStackParamList } from '../types/itemTypes';
import MatchCard from '../components/MatchCard';

type MatchDetailsRouteProp = RouteProp<RootStackParamList, 'MatchDetails'>;

export default function MatchDetailsScreen() {
  const { t } = useLanguage();
  const route = useRoute<MatchDetailsRouteProp>();
  
  const { item, matches } = route.params;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-AE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLocationLabel = (key: string) => {
    const locationLabels: { [key: string]: string } = {
      'mall': t('where_mall'),
      'airport': t('where_airport'),
      'metro': t('where_metro'),
      'taxi': t('where_taxi'),
      'bus': t('where_bus'),
      'beach': t('where_beach'),
      'hotel': t('where_hotel'),
      'restaurant': t('where_restaurant'),
      'park': t('where_park'),
      'hospital': t('where_hospital'),
      'school': t('where_school'),
      'office': t('where_office'),
      'other': t('where_other'),
    };
    return locationLabels[key] || key;
  };

  const getTimeLabel = (key: string) => {
    const timeLabels: { [key: string]: string } = {
      'today': t('when_today'),
      'yesterday': t('when_yesterday'),
      'this_week': t('when_this_week'),
      'last_week': t('when_last_week'),
      'this_month': t('when_this_month'),
      'older': t('when_older'),
    };
    return timeLabels[key] || key;
  };

  const highMatches = matches.filter(m => m.status === 'high');
  const possibleMatches = matches.filter(m => m.status === 'possible');

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Item Image with Badge */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Type Badge */}
        <View style={[
          styles.typeBadge,
          item.type === 'lost' ? styles.typeBadgeLost : styles.typeBadgeFound,
        ]}>
          <Ionicons 
            name={item.type === 'lost' ? 'search-outline' : 'hand-left-outline'} 
            size={12} 
            color={colors.text.white} 
          />
          <Text style={styles.typeBadgeText}>
            {item.type === 'lost' ? t('badge_lost') : t('badge_found')}
          </Text>
        </View>

        {/* Match Count Badge */}
        {matches.length > 0 && (
          <View style={styles.matchBadge}>
            <Ionicons name="git-compare-outline" size={12} color={colors.text.white} />
            <Text style={styles.matchBadgeText}>{matches.length}</Text>
          </View>
        )}
      </View>

      {/* Item Details */}
      <View style={styles.detailsSection}>
        {/* Description */}
        <Text style={styles.description}>{item.description}</Text>

        {/* Metadata Row */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={16} color={colors.primary.dark} />
            <Text style={styles.metaText} numberOfLines={1}>
              {getLocationLabel(item.where)}
            </Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color={colors.primary.accent} />
            <Text style={styles.metaText}>{getTimeLabel(item.when)}</Text>
          </View>
        </View>

        {/* Specific Place */}
        {item.specificPlace && (
          <View style={styles.specificPlace}>
            <Ionicons name="pin-outline" size={14} color={colors.text.secondary} />
            <Text style={styles.specificPlaceText}>{item.specificPlace}</Text>
          </View>
        )}

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {t('detail_reported')}: {formatDate(item.timestamp)}
        </Text>
      </View>

      {/* Matches Section */}
      <View style={styles.matchesSection}>
        <Text style={styles.sectionTitle}>
          {t('matches_section_title')}
        </Text>

        {matches.length > 0 ? (
          <>
            {/* High Matches */}
            {highMatches.length > 0 && (
              <View style={styles.matchGroup}>
                <View style={[styles.groupLabel, { backgroundColor: colors.status.successBg }]}>
                  <Ionicons name="star" size={12} color={colors.status.success} />
                  <Text style={[styles.groupLabelText, { color: colors.status.success }]}>
                    {t('high_confidence_matches')} ({highMatches.length})
                  </Text>
                </View>
                {highMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </View>
            )}

            {/* Possible Matches */}
            {possibleMatches.length > 0 && (
              <View style={styles.matchGroup}>
                <View style={[styles.groupLabel, { backgroundColor: colors.status.warningBg }]}>
                  <Ionicons name="help-circle-outline" size={12} color={colors.status.warning} />
                  <Text style={[styles.groupLabelText, { color: colors.status.warning }]}>
                    {t('possible_matches')} ({possibleMatches.length})
                  </Text>
                </View>
                {possibleMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </View>
            )}
          </>
        ) : (
          <View style={styles.noMatchesContainer}>
            <View style={styles.noMatchesIcon}>
              <Ionicons name="search-outline" size={28} color={colors.text.light} />
            </View>
            <Text style={styles.noMatchesTitle}>{t('no_matches_title')}</Text>
            <Text style={styles.noMatchesText}>{t('no_matches_description')}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  contentContainer: {
    paddingBottom: spacing.xxl,
  },

  // Image Section
  imageContainer: {
    height: 220,
    position: 'relative',
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  typeBadgeLost: {
    backgroundColor: colors.primary.dark,
  },
  typeBadgeFound: {
    backgroundColor: colors.primary.accent,
  },
  typeBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matchBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  matchBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text.white,
  },

  // Details Section
  detailsSection: {
    backgroundColor: colors.background.primary,
    marginHorizontal: layout.screenPadding,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    padding: layout.cardPadding,
    ...shadows.sm,
  },
  description: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    lineHeight: typography.lineHeights.relaxed,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaDivider: {
    width: 1,
    height: 16,
    backgroundColor: colors.border.light,
    marginHorizontal: spacing.sm,
  },
  metaText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    flex: 1,
  },
  specificPlace: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  specificPlaceText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.light,
  },

  // Matches Section
  matchesSection: {
    padding: layout.screenPadding,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  matchGroup: {
    marginBottom: spacing.md,
  },
  groupLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  groupLabelText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },

  // No Matches
  noMatchesContainer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  noMatchesIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  noMatchesTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  noMatchesText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
