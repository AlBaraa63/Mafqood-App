/**
 * Mafqood Mobile - Item Card Component
 * Enhanced display with larger images, colored badges, and subtle shadows
 */

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, fontSize, fontWeight, spacing, shadows } from '../theme/theme';
import { Item, Match } from '../types/itemTypes';
import { useLanguage } from '../context/LanguageContext';
import MatchCard from './MatchCard';

interface ItemCardProps {
  item: Item;
  matches: Match[];
  onMatchPress?: (match: Match) => void;
}

export default function ItemCard({ item, matches, onMatchPress }: ItemCardProps) {
  const { t } = useLanguage();

  const isLost = item.type === 'lost';
  const hasHighMatch = matches.some(m => m.similarity >= 75);
  const accentColor = isLost ? colors.primary.dark : colors.primary.accent;
  
  const formattedDate = item.timestamp.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View style={[
      styles.container,
      hasHighMatch && styles.highlightContainer,
    ]}>
      {/* High Match Indicator */}
      {hasHighMatch && (
        <LinearGradient
          colors={[accentColor, accentColor + 'DD']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.highMatchIndicator}
        >
          <Ionicons name="sparkles" size={14} color={colors.text.white} />
          <Text style={styles.highMatchText}>{t('matches_high_match_badge')}</Text>
        </LinearGradient>
      )}

      <View style={styles.content}>
        {/* Top Section: Image + Details */}
        <View style={styles.topSection}>
          {/* Larger Image with Badge Overlay */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            {/* Type Badge Overlay */}
            <View style={[
              styles.typeBadgeOverlay,
              { backgroundColor: accentColor },
            ]}>
              <Ionicons 
                name={isLost ? "search" : "hand-left"} 
                size={10} 
                color={colors.text.white} 
              />
              <Text style={styles.typeBadgeText}>
                {isLost ? t('matches_lost_badge') : t('matches_found_badge')}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View style={styles.details}>
            {/* Match Count Badge */}
            {matches.length > 0 && (
              <View style={[styles.matchCountBadge, { borderColor: accentColor + '40' }]}>
                <Ionicons name="git-compare" size={12} color={accentColor} />
                <Text style={[styles.matchCountText, { color: accentColor }]}>
                  {matches.length} {matches.length === 1 ? t('matches_match_count') : t('matches_match_count_plural')}
                </Text>
              </View>
            )}

            {/* Description */}
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>

            {/* Meta Info */}
            <View style={styles.metaContainer}>
              <View style={styles.metaRow}>
                <View style={[styles.metaIcon, { backgroundColor: accentColor + '15' }]}>
                  <Ionicons name="location" size={12} color={accentColor} />
                </View>
                <Text style={styles.metaText}>{item.where}</Text>
                {item.specificPlace && (
                  <Text style={styles.metaSubText} numberOfLines={1}>• {item.specificPlace}</Text>
                )}
              </View>

              <View style={styles.metaRow}>
                <View style={[styles.metaIcon, { backgroundColor: colors.primary.dark + '15' }]}>
                  <Ionicons name="time" size={12} color={colors.primary.dark} />
                </View>
                <Text style={styles.metaText}>{item.when}</Text>
              </View>

              <View style={styles.metaRow}>
                <View style={[styles.metaIcon, { backgroundColor: colors.text.tertiary + '15' }]}>
                  <Ionicons name="calendar-outline" size={12} color={colors.text.tertiary} />
                </View>
                <Text style={styles.metaSubText}>{formattedDate}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Bottom: Matches Section */}
        <View style={styles.matchesSection}>
          {matches.length > 0 ? (
            <>
              <View style={styles.matchesHeader}>
                <View style={styles.matchesTitleRow}>
                  <Ionicons name="sparkles" size={16} color={accentColor} />
                  <Text style={[styles.matchesTitle, { color: accentColor }]}>
                    {t('matches_ai_discovered')}
                  </Text>
                </View>
                {hasHighMatch && (
                  <View style={[styles.strongSimilarityBadge, { backgroundColor: accentColor + '15', borderColor: accentColor + '30' }]}>
                    <Text style={[styles.strongSimilarityText, { color: accentColor }]}>⚡ Strong</Text>
                  </View>
                )}
              </View>

              <View style={styles.matchesList}>
                {matches.slice(0, 2).map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    compact
                    onPress={onMatchPress ? () => onMatchPress(match) : undefined}
                  />
                ))}
              </View>

              {matches.length > 2 && (
                <TouchableOpacity style={[styles.viewAllButton, { borderColor: accentColor + '40' }]}>
                  <Text style={[styles.viewAllText, { color: accentColor }]}>
                    {t('matches_view_details')} ({matches.length}) →
                  </Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.noMatches}>
              <View style={styles.noMatchesIcon}>
                <Ionicons name="search" size={20} color={colors.text.light} />
              </View>
              <View style={styles.noMatchesContent}>
                <Text style={styles.noMatchesTitle}>{t('matches_no_matches_title')}</Text>
                <Text style={styles.noMatchesDesc}>{t('matches_no_matches_desc')}</Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  highlightContainer: {
    shadowColor: colors.primary.accent,
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  highMatchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  highMatchText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text.white,
  },
  content: {
    padding: spacing.md,
  },

  // Top Section
  topSection: {
    flexDirection: 'row',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.lg,
  },
  typeBadgeOverlay: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
    color: colors.text.white,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  details: {
    flex: 1,
    marginLeft: spacing.md,
  },
  matchCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  matchCountText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  description: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  metaContainer: {
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaIcon: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  metaSubText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
    flex: 1,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },

  // Matches Section
  matchesSection: {},
  matchesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  matchesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  matchesTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  strongSimilarityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  strongSimilarityText: {
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  matchesList: {
    gap: spacing.xs,
  },
  viewAllButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.background.tertiary,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
    borderWidth: 1,
  },
  viewAllText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },

  // No Matches
  noMatches: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  noMatchesIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMatchesContent: {
    flex: 1,
  },
  noMatchesTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  noMatchesDesc: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
    lineHeight: 16,
  },
});
