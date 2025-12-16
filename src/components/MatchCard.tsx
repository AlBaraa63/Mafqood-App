/**
 * Mafqood Mobile - Match Card Component
 * Displays a potential match with similarity score
 */

import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, fontSize, fontWeight, spacing, shadows } from '../theme/theme';
import { Match } from '../types/itemTypes';
import { useLanguage } from '../context/LanguageContext';

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
  compact?: boolean;
}

export default function MatchCard({ match, onPress, compact = false }: MatchCardProps) {
  const { t } = useLanguage();

  const isHighMatch = match.similarity >= 75;

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image
          source={{ uri: match.item.imageUrl }}
          style={styles.compactImage}
          resizeMode="cover"
        />
        <View style={styles.compactContent}>
          <Text style={styles.compactDescription} numberOfLines={1}>
            {match.item.description}
          </Text>
          <View style={styles.compactMeta}>
            <Ionicons name="location" size={12} color={colors.text.tertiary} />
            <Text style={styles.compactMetaText}>{match.item.where}</Text>
          </View>
        </View>
        <View style={[
          styles.compactBadge,
          isHighMatch ? styles.highMatchBadge : styles.possibleMatchBadge,
        ]}>
          <Text style={styles.compactBadgeText}>{match.similarity}%</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isHighMatch && styles.highMatchContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* High Match Badge */}
      {isHighMatch && (
        <View style={styles.highMatchBanner}>
          <Ionicons name="sparkles" size={12} color={colors.text.white} />
          <Text style={styles.highMatchBannerText}>{t('matches_match_high')}</Text>
        </View>
      )}

      <View style={styles.content}>
        {/* Image */}
        <Image
          source={{ uri: match.item.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Details */}
        <View style={styles.details}>
          {/* Type Badge */}
          <View style={[
            styles.typeBadge,
            match.item.type === 'lost' ? styles.lostBadge : styles.foundBadge,
          ]}>
            <Text style={styles.typeBadgeText}>
              {match.item.type === 'lost' ? `🔍 ${t('matches_lost_badge')}` : `✅ ${t('matches_found_badge')}`}
            </Text>
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {match.item.description || t('no_description')}
          </Text>

          {/* Meta Info */}
          <View style={styles.metaRow}>
            <Ionicons name="location" size={14} color={colors.primary.accent} />
            <Text style={styles.metaText}>{match.item.where}</Text>
            {match.item.specificPlace && (
              <Text style={styles.metaSubText}>• {match.item.specificPlace}</Text>
            )}
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="time" size={14} color={colors.primary.dark} />
            <Text style={styles.metaText}>{match.item.when}</Text>
          </View>

          {/* Similarity Score */}
          <View style={styles.similarityContainer}>
            <Text style={styles.similarityLabel}>{t('matches_similarity')}:</Text>
            <View style={styles.similarityBarContainer}>
              <View
                style={[
                  styles.similarityBar,
                  { width: `${match.similarity}%` },
                  isHighMatch ? styles.highSimilarityBar : styles.possibleSimilarityBar,
                ]}
              />
            </View>
            <Text style={[
              styles.similarityValue,
              isHighMatch && styles.highSimilarityValue,
            ]}>
              {match.similarity}%
            </Text>
          </View>
        </View>
      </View>

      {/* View Details */}
      {onPress && (
        <View style={styles.viewDetailsContainer}>
          <Text style={styles.viewDetailsText}>{t('matches_view_details')}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary.accent} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.border.light,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  highMatchContainer: {
    borderColor: colors.primary.accent,
    backgroundColor: `${colors.primary.accent}05`,
  },
  highMatchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary.accent,
    paddingVertical: spacing.xs,
  },
  highMatchBannerText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text.white,
  },
  content: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  details: {
    flex: 1,
    marginLeft: spacing.md,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xs,
  },
  lostBadge: {
    backgroundColor: colors.primary.dark,
  },
  foundBadge: {
    backgroundColor: colors.primary.accent,
  },
  typeBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text.white,
  },
  description: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    fontWeight: fontWeight.medium,
  },
  metaSubText: {
    fontSize: fontSize.sm,
    color: colors.text.tertiary,
  },
  similarityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  similarityLabel: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
  },
  similarityBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border.light,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  similarityBar: {
    height: '100%',
    borderRadius: borderRadius.full,
  },
  highSimilarityBar: {
    backgroundColor: colors.primary.accent,
  },
  possibleSimilarityBar: {
    backgroundColor: colors.primary.dark,
  },
  similarityValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text.secondary,
  },
  highSimilarityValue: {
    color: colors.primary.accent,
  },
  viewDetailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.xs,
  },
  viewDetailsText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary.accent,
  },
  // Compact styles
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  compactImage: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
  },
  compactContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  compactDescription: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text.primary,
  },
  compactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  compactMetaText: {
    fontSize: fontSize.xs,
    color: colors.text.tertiary,
  },
  compactBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  highMatchBadge: {
    backgroundColor: colors.primary.accent,
  },
  possibleMatchBadge: {
    backgroundColor: colors.primary.dark,
  },
  compactBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.text.white,
  },
});
