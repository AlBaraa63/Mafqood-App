/**
 * Match Detail Screen - Native Mobile Design
 * - iOS-style navigation with large title
 * - Native card layouts matching platform conventions
 * - Side-by-side comparison with native styling
 * - Platform-specific icons and visual feedback
 * - Real AI-calculated match data from backend
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Alert,
  StatusBar,
  TouchableOpacity,
  TouchableHighlight,
  Platform,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated';

import { Loading } from '../../components/common';
import { EnhancedButton } from '../../components/ui';
import { useDynamicStyles, useTranslation, useFormatDate, useHaptics } from '../../hooks';
import api from '../../api';
import { MatchesStackParamList, Match } from '../../types';
import { colors } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

type NavigationProp = NativeStackNavigationProp<MatchesStackParamList, 'MatchDetail'>;
type RouteProps = RouteProp<MatchesStackParamList, 'MatchDetail'>;

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

// Animated Progress Ring (Native-style)
interface ProgressRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ 
  percentage, 
  size = 100, 
  strokeWidth = 8 
}) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percentage / 100, { duration: 1000 });
  }, [percentage]);

  const getConfidenceColor = () => {
    if (percentage >= 80) return colors.success.main;
    if (percentage >= 60) return colors.warning.main;
    return colors.error.light;
  };

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + progress.value * 0.1 }],
  }));

  return (
    <View style={[styles.progressRing, { width: size, height: size }]}>
      <Animated.View entering={ZoomIn.delay(300).springify()} style={animatedScale}>
        <View style={styles.progressContent}>
          <Text style={[styles.progressPercentage, { color: getConfidenceColor() }]}>
            {percentage}%
          </Text>
          <Text style={styles.progressLabel}>Match</Text>
        </View>
      </Animated.View>
      {/* Background circle */}
      <View
        style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.neutral[200],
          },
        ]}
      />
      {/* Progress indicator (simplified visual) */}
      <View
        style={[
          styles.progressIndicator,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: getConfidenceColor(),
            borderTopColor: 'transparent',
            borderRightColor: percentage > 25 ? getConfidenceColor() : 'transparent',
            borderBottomColor: percentage > 50 ? getConfidenceColor() : 'transparent',
            borderLeftColor: percentage > 75 ? getConfidenceColor() : 'transparent',
            transform: [{ rotate: '-45deg' }],
          },
        ]}
      />
    </View>
  );
};

// Native Item Card Component
interface ItemCardProps {
  label: string;
  item: {
    type: 'lost' | 'found';
    imageUrl: string;
    title: string;
    location: string;
    dateTime: string;
    category?: string;
  };
  direction: 'left' | 'right';
}

const ItemCard: React.FC<ItemCardProps> = ({ label, item, direction }) => {
  const { t } = useTranslation();
  const { formatDateTime } = useFormatDate();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const EnteringAnimation = direction === 'left' ? SlideInLeft : SlideInRight;
  const isLost = item.type === 'lost';

  return (
    <Animated.View
      entering={EnteringAnimation.delay(400).springify()}
      style={[styles.itemCard, animatedStyle]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.itemCardContent}>
          {/* Label */}
          <Text style={styles.itemCardLabel}>{label}</Text>

          {/* Image */}
          <View style={styles.itemImageContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            {/* Type Badge */}
            <View style={[
              styles.typeBadge,
              { backgroundColor: isLost ? colors.error.main : colors.success.main }
            ]}>
              <PlatformIcon
                iosName={isLost ? 'search' : 'gift'}
                androidName={isLost ? 'magnify' : 'hand-heart'}
                size={12}
                color={colors.neutral.white}
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>

          {/* Location */}
          <View style={styles.itemMeta}>
            <PlatformIcon
              iosName="location-outline"
              androidName="map-marker-outline"
              size={14}
              color={colors.accent[600]}
            />
            <Text style={styles.itemMetaText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>

          {/* Date */}
          <View style={styles.itemMeta}>
            <PlatformIcon
              iosName="time-outline"
              androidName="clock-outline"
              size={14}
              color={colors.text.tertiary}
            />
            <Text style={styles.itemMetaText}>
              {formatDateTime(item.dateTime)}
            </Text>
          </View>

          {/* Category */}
          {item.category && (
            <View style={styles.itemMeta}>
              <PlatformIcon
                iosName="pricetag-outline"
                androidName="tag-outline"
                size={14}
                color={colors.text.tertiary}
              />
              <Text style={styles.itemMetaText}>
                {t(`category_${item.category}`) || item.category}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Match Info Row Component
interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, valueColor }) => {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoRowLeft}>
        <PlatformIcon
          iosName={icon as any}
          androidName={icon as any}
          size={18}
          color={colors.text.tertiary}
        />
        <Text style={styles.infoRowLabel}>{label}</Text>
      </View>
      <Text style={[styles.infoRowValue, valueColor && { color: valueColor }]}>
        {value}
      </Text>
    </View>
  );
};

// Main Screen Component
export const MatchDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const { formatDateTime } = useFormatDate();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { matchId } = route.params;
  const haptics = useHaptics();

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values
  const buttonScale = useSharedValue(1);

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

  const handleClaimMatch = useCallback(async () => {
    haptics.medium();
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    setIsSubmitting(true);

    try {
      const response = await api.claimMatch(matchId);
      if (response.success) {
        haptics.success();
        Alert.alert(
          t('success') || 'Success',
          t('contact_sent') || 'Your contact request has been sent!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      haptics.error();
      Alert.alert(t('error_generic') || 'Error', t('try_again') || 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [matchId, haptics, navigation, t, buttonScale]);

  const handleBack = useCallback(() => {
    haptics.light();
    navigation.goBack();
  }, [navigation, haptics]);

  const getConfidenceLabel = (confidence: string) => {
    switch (confidence) {
      case 'high': return t('confidence_high') || 'High Confidence';
      case 'medium': return t('confidence_medium') || 'Medium Confidence';
      case 'low': return t('confidence_low') || 'Low Confidence';
      default: return confidence;
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return colors.success.main;
      case 'medium': return colors.warning.main;
      case 'low': return colors.error.light;
      default: return colors.text.tertiary;
    }
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
        <Loading text={t('loading')} />
      </SafeAreaView>
    );
  }

  // Error State
  if (!match) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
        <View style={styles.errorContainer}>
          <View style={styles.errorIconContainer}>
            <PlatformIcon
              iosName="alert-circle-outline"
              androidName="alert-circle-outline"
              size={56}
              color={colors.text.tertiary}
            />
          </View>
          <Text style={styles.errorTitle}>{t('error_not_found') || 'Match not found'}</Text>
          <Text style={styles.errorDescription}>
            {t('error_not_found_desc') || 'This match may have been removed or is no longer available.'}
          </Text>
          <TouchableOpacity onPress={handleBack} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>{t('go_back') || 'Go Back'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { userItem, matchedItem, similarity, confidence } = match;
  const isUserLost = userItem.type === 'lost';

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

      {/* Native Navigation Header */}
      <Animated.View entering={FadeIn} style={styles.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <PlatformIcon
            iosName="chevron-back"
            androidName="arrow-left"
            size={24}
            color={colors.primary[500]}
          />
          {isIOS && <Text style={styles.backButtonText}>{t('back') || 'Back'}</Text>}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('match_detail_title') || 'Match Details'}</Text>
        <View style={styles.headerRight} />
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Match Score Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.scoreCard}>
          <View style={styles.scoreHeader}>
            <View style={styles.scoreInfo}>
              <Text style={styles.scoreTitle}>{t('match_found') || 'Match Found!'}</Text>
              <Text style={styles.scoreSubtitle}>
                {t('ai_analyzed') || 'AI analyzed this potential match'}
              </Text>
            </View>
            <View style={[
              styles.confidenceBadge,
              { backgroundColor: `${getConfidenceColor(confidence)}15` }
            ]}>
              <View style={[
                styles.confidenceDot,
                { backgroundColor: getConfidenceColor(confidence) }
              ]} />
              <Text style={[
                styles.confidenceText,
                { color: getConfidenceColor(confidence) }
              ]}>
                {getConfidenceLabel(confidence)}
              </Text>
            </View>
          </View>

          {/* Progress Ring */}
          <View style={styles.progressContainer}>
            <ProgressRing percentage={Math.round(similarity)} />
          </View>

          {/* Match Explanation */}
          <View style={styles.explanationBox}>
            <PlatformIcon
              iosName="information-circle"
              androidName="information"
              size={18}
              color={colors.primary[500]}
            />
            <Text style={styles.explanationText}>
              {t('match_explanation') || 'Our AI found visual similarities between these items based on image analysis.'}
            </Text>
          </View>
        </Animated.View>

        {/* VS Indicator */}
        <Animated.View
          entering={ZoomIn.delay(300).springify()}
          style={styles.vsContainer}
        >
          <View style={styles.vsCircle}>
            <Text style={styles.vsText}>VS</Text>
          </View>
        </Animated.View>

        {/* Items Comparison */}
        <View style={styles.comparisonContainer}>
          <ItemCard 
            label={t('your_item') || 'Your Item'} 
            item={userItem} 
            direction="left" 
          />
          <ItemCard 
            label={t('matched_item') || 'Matched Item'} 
            item={matchedItem} 
            direction="right" 
          />
        </View>

        {/* Match Details Section */}
        <Animated.View entering={FadeInUp.delay(500).springify()} style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>{t('match_info') || 'Match Information'}</Text>
          
          <View style={styles.detailsCard}>
            <InfoRow
              icon="analytics-outline"
              label={t('similarity_score') || 'Similarity Score'}
              value={`${Math.round(similarity)}%`}
              valueColor={getConfidenceColor(confidence)}
            />
            <View style={styles.infoRowDivider} />
            <InfoRow
              icon="shield-checkmark-outline"
              label={t('confidence_level') || 'Confidence Level'}
              value={getConfidenceLabel(confidence)}
              valueColor={getConfidenceColor(confidence)}
            />
            <View style={styles.infoRowDivider} />
            <InfoRow
              icon="sparkles"
              label={t('analyzed_by') || 'Analyzed By'}
              value="AI Vision"
            />
          </View>
        </Animated.View>

        {/* Potential Matches Info */}
        <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.tipSection}>
          <View style={styles.tipCard}>
            <PlatformIcon
              iosName="bulb"
              androidName="lightbulb-outline"
              size={20}
              color={colors.warning.main}
            />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>{t('tip') || 'Tip'}</Text>
              <Text style={styles.tipText}>
                {t('verify_item_tip') || 'Verify the item details match before claiming. Look for unique identifying features.'}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <Animated.View entering={FadeInUp.delay(700).springify()} style={styles.bottomActions}>
        <Animated.View style={[styles.primaryButtonContainer, buttonAnimatedStyle]}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isSubmitting && styles.primaryButtonDisabled
            ]}
            onPress={handleClaimMatch}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <PlatformIcon
              iosName={isUserLost ? 'checkmark-circle' : 'chatbubble'}
              androidName={isUserLost ? 'check-circle' : 'message-text'}
              size={20}
              color={colors.neutral.white}
            />
            <Text style={styles.primaryButtonText}>
              {isSubmitting 
                ? (t('sending') || 'Sending...') 
                : (isUserLost ? t('this_is_my_item') || 'This is My Item' : t('contact_owner') || 'Contact Owner')
              }
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryButtonText}>{t('back') || 'Back'}</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isIOS ? colors.neutral[100] : colors.background.primary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 70,
  },
  backButtonText: {
    fontSize: 17,
    color: colors.primary[500],
    marginLeft: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerRight: {
    minWidth: 70,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Score Card
  scoreCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  scoreSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  confidenceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  explanationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.primary[50],
    padding: 12,
    borderRadius: 8,
  },
  explanationText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },

  // Progress Ring
  progressRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 28,
    fontWeight: '700',
  },
  progressLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  progressCircle: {
    position: 'absolute',
  },
  progressIndicator: {
    position: 'absolute',
  },

  // VS Container
  vsContainer: {
    alignItems: 'center',
    marginVertical: -12,
    zIndex: 10,
  },
  vsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  vsText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.neutral.white,
  },

  // Comparison Container
  comparisonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },

  // Item Card
  itemCard: {
    flex: 1,
  },
  itemCardContent: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  itemCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  itemImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  itemImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: colors.neutral[200],
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  itemMetaText: {
    fontSize: 12,
    color: colors.text.secondary,
    flex: 1,
  },

  // Details Section
  detailsSection: {
    marginHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  detailsCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoRowLabel: {
    fontSize: 15,
    color: colors.text.primary,
  },
  infoRowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  infoRowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.neutral[200],
    marginLeft: 44,
  },

  // Tip Section
  tipSection: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: colors.warning.light,
    padding: 16,
    borderRadius: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning.dark,
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: colors.warning.dark,
    lineHeight: 18,
  },

  // Bottom Actions
  bottomActions: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: isIOS ? 8 : 16,
    backgroundColor: colors.background.primary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.neutral[200],
    gap: 10,
  },
  primaryButtonContainer: {
    width: '100%',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary[500],
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.neutral.white,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.primary[500],
  },

  // Error State
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  errorDescription: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary[500],
    borderRadius: 10,
  },
  errorButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral.white,
  },
});

export default MatchDetailScreen;
