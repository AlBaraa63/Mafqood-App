/**
 * Match Detail Screen
 * Side-by-side comparison with clear CTA
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Button, Card, Loading, ConfidenceBadge, TypeChip, Divider } from '../../components/common';
import { useTranslation, useFormatDate } from '../../hooks';
import api from '../../api';
import { MatchesStackParamList, Match } from '../../types';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

type NavigationProp = NativeStackNavigationProp<MatchesStackParamList, 'MatchDetail'>;
type RouteProps = RouteProp<MatchesStackParamList, 'MatchDetail'>;

export const MatchDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const { formatDateTime } = useFormatDate();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { matchId } = route.params;
  
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    loadMatch();
  }, [matchId]);
  
  const loadMatch = async () => {
    try {
      const response = await api.getMatchById(matchId);
      if (response.success && response.data) {
        setMatch(response.data);
      }
    } catch (error) {
      console.error('Error loading match:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClaimMatch = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.claimMatch(matchId);
      if (response.success) {
        Alert.alert(
          match?.userItem.type === 'lost' ? t('this_is_my_item') : t('contact_owner'),
          t('contact_sent'),
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Alert.alert(t('error_generic'), t('error_generic'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return t('confidence_high');
      case 'medium': return t('confidence_medium');
      case 'low': return t('confidence_low');
      default: return confidence;
    }
  };
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <Loading text={t('loading')} />
      </SafeAreaView>
    );
  }
  
  if (!match) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{t('error_not_found')}</Text>
          <Button title={t('back')} onPress={() => navigation.goBack()} />
        </View>
      </SafeAreaView>
    );
  }
  
  const { userItem, matchedItem, similarity, confidence } = match;
  const isUserLost = userItem.type === 'lost';
  
  const renderItemCard = (label: string, itemSide: typeof userItem) => (
    <Card style={styles.itemCard} variant="outlined">
      <Text style={styles.itemLabel}>{label}</Text>
      <Image source={{ uri: itemSide.imageUrl }} style={styles.itemImage} />
      <TypeChip
        type={itemSide.type}
        label={itemSide.type === 'lost' ? t('lost_item') : t('found_item')}
      />
      <Text style={styles.itemTitle}>{itemSide.title}</Text>
      <View style={styles.itemMetaRow}>
        <MaterialCommunityIcons name="map-marker-radius" size={14} color={colors.accent[600]} />
        <Text style={styles.itemMeta}>{itemSide.location}</Text>
      </View>
      <View style={styles.itemMetaRow}>
        <MaterialCommunityIcons name="calendar-clock" size={14} color={colors.text.secondary} />
        <Text style={styles.itemMeta}>{formatDateTime(itemSide.dateTime)}</Text>
      </View>
      {itemSide.category && (
        <View style={styles.itemMetaRow}>
          <MaterialCommunityIcons name="tag-outline" size={14} color={colors.text.secondary} />
          <Text style={styles.itemMeta}>{t(`category_${itemSide.category}`)}</Text>
        </View>
      )}
    </Card>
  );
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Confidence Header */}
        <Card style={styles.headerCard} variant="elevated">
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.confidenceTitle}>{t('match_detail_title')}</Text>
              <Text style={styles.confidenceSubtitle}>{t('match_explanation')}</Text>
            </View>
            <ConfidenceBadge
              confidence={confidence}
              label={getConfidenceLabel(confidence)}
              percentage={similarity}
            />
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${similarity}%` }]} />
          </View>
          <Text style={styles.progressValue}>{Math.round(similarity)}%</Text>
        </Card>
        
        {/* Items Comparison */}
        <View style={styles.comparison}>
          {renderItemCard(t('your_item'), userItem)}
          {renderItemCard(t('matched_item'), matchedItem)}
        </View>
        
        <Divider />
        
        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title={isUserLost ? t('this_is_my_item') : t('contact_owner')}
            onPress={handleClaimMatch}
            loading={isSubmitting}
            fullWidth
            icon={<MaterialCommunityIcons name="check-decagram" size={18} color={colors.neutral.white} />}
          />
          <Button
            title={t('back')}
            onPress={() => navigation.goBack()}
            variant="outline"
            fullWidth
            style={styles.backButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  headerCard: {
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  confidenceTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  confidenceSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'left',
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent[500],
    borderRadius: borderRadius.full,
  },
  progressValue: {
    alignSelf: 'flex-end',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent[700],
  },
  comparison: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  itemCard: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
  },
  itemImage: {
    width: '100%',
    height: 150,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.neutral[200],
  },
  itemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  itemMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  itemMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'left',
  },
  actions: {
    gap: spacing.md,
  },
  backButton: {
    marginTop: spacing.xs,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
});

export default MatchDetailScreen;
