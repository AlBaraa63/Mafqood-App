/**
 * Report Success Screen - Native Mobile Version
 * Celebration screen with animations after successful report submission
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
  withTiming,
  withRepeat,
  FadeIn,
  FadeInUp,
  FadeInDown,
  ZoomIn,
  BounceIn,
} from 'react-native-reanimated';
import { EnhancedButton, GlassCard } from '../../components/ui';
import { useDynamicStyles, useTranslation, useHaptics } from '../../hooks';
import { ReportStackParamList } from '../../types';
import { colors } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportSuccess'>;
type RouteProps = RouteProp<ReportStackParamList, 'ReportSuccess'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Confetti particle component
const ConfettiParticle: React.FC<{
  delay: number;
  startX: number;
  color: string;
  size: number;
}> = ({ delay, startX, color, size }) => {
  const translateY = useSharedValue(-50);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 200 }));
    scale.value = withDelay(delay, withSpring(1));
    translateY.value = withDelay(
      delay,
      withTiming(400, { duration: 2500 })
    );
    translateX.value = withDelay(
      delay,
      withSequence(
        withTiming(Math.random() * 40 - 20, { duration: 500 }),
        withRepeat(
          withSequence(
            withTiming(Math.random() * 30 - 15, { duration: 400 }),
            withTiming(Math.random() * 30 - 15, { duration: 400 })
          ),
          -1,
          true
        )
      )
    );
    rotate.value = withDelay(
      delay,
      withRepeat(withTiming(360, { duration: 1500 }), -1, false)
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: startX,
          top: 0,
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: size / 4,
        },
        animatedStyle,
      ]}
    />
  );
};

// Celebration ring animation
const CelebrationRing: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withDelay(delay, withTiming(3, { duration: 1000 }));
    opacity.value = withDelay(delay, withTiming(0, { duration: 1000 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: 120,
          height: 120,
          borderRadius: 60,
          borderWidth: 3,
          borderColor: colors.success.main,
        },
        animatedStyle,
      ]}
    />
  );
};

export const ReportSuccessScreen: React.FC = () => {
  const { t } = useTranslation();
  const haptics = useHaptics();
  const { typography, spacing, layout } = useDynamicStyles();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { type, item, matchCount } = route.params;
  
  const isLost = type === 'lost';

  // Celebration animation values
  const iconScale = useSharedValue(0);

  // Confetti configuration
  const confettiColors = [
    colors.accent[400],
    colors.success.main,
    colors.primary[400],
    '#FFD700', // Gold
    '#FF6B6B', // Coral
    '#4ECDC4', // Teal
  ];

  useEffect(() => {
    // Trigger haptics on mount
    haptics.success();
    
    // Start celebration animations
    iconScale.value = withSpring(1, { damping: 10, stiffness: 100 });
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const handleViewMatches = () => {
    haptics.selection();
    // Navigate to the Matches tab in the main navigator
    navigation.getParent()?.navigate('MatchesTab' as never);
  };

  const handleGoHome = () => {
    haptics.selection();
    // Navigate to the Home tab in the main navigator
    navigation.getParent()?.navigate('HomeTab' as never);
  };

  // Generate confetti particles
  const confettiParticles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 1000,
    startX: Math.random() * (SCREEN_WIDTH - 20),
    color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    size: Math.random() * 8 + 6,
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
      
      {/* Confetti Animation */}
      <View style={styles.confettiContainer}>
        {confettiParticles.map((particle) => (
          <ConfettiParticle
            key={particle.id}
            delay={particle.delay}
            startX={particle.startX}
            color={particle.color}
            size={particle.size}
          />
        ))}
      </View>

      <View style={[styles.content, { paddingHorizontal: spacing.screenPadding }]}>
        {/* Success Icon with Celebration Rings */}
        <Animated.View
          entering={ZoomIn.delay(200).springify()}
          style={[
            styles.iconContainer,
            { 
              width: layout.avatarLg * 2, 
              height: layout.avatarLg * 2, 
              borderRadius: layout.avatarLg,
              backgroundColor: isLost ? colors.primary[50] : colors.success.light,
              marginBottom: spacing['2xl'],
            }
          ]}
        >
          {/* Celebration rings */}
          <View style={styles.ringsContainer}>
            <CelebrationRing delay={400} />
            <CelebrationRing delay={600} />
            <CelebrationRing delay={800} />
          </View>
          
          <Animated.Text style={[typography.hero, iconAnimatedStyle]}>
            {isLost ? '🔍' : '🎉'}
          </Animated.Text>
        </Animated.View>

        {/* Success Title */}
        <Animated.Text
          entering={FadeInUp.delay(400).springify()}
          style={[typography.h1, styles.title]}
        >
          {isLost ? t('success_lost_title') : t('success_found_title')}
        </Animated.Text>

        {/* Success Message */}
        <Animated.Text
          entering={FadeInUp.delay(500).springify()}
          style={[typography.body, styles.message, { marginBottom: spacing.xl }]}
        >
          {isLost ? t('success_lost_message') : t('success_found_message')}
        </Animated.Text>

        {/* Match Count Banner */}
        {matchCount > 0 && (
          <Animated.View
            entering={BounceIn.delay(700)}
            style={[
              styles.matchBanner,
              { 
                borderRadius: layout.radiusLg, 
                padding: spacing.md, 
                marginBottom: spacing.xl 
              }
            ]}
          >
            <Text style={[typography.h2, { marginRight: spacing.sm }]}>✨</Text>
            <View style={styles.matchTextContainer}>
              <Text style={[typography.h3, { color: colors.accent[700] }]}>{matchCount}</Text>
              <Text style={[typography.caption, { color: colors.accent[600], marginTop: 2 }]}>
                {t('success_matches_found').replace('{count}', '')}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Item Preview Card */}
        <Animated.View entering={FadeInUp.delay(800).springify()} style={{ width: '100%' }}>
          <GlassCard style={{ ...styles.itemPreview, padding: spacing.lg, borderRadius: layout.radiusLg, marginBottom: spacing['2xl'] }}>
            <Text style={[typography.h3, styles.itemTitle]}>{item.title}</Text>
            <View style={styles.locationRow}>
              <Text style={typography.body}>📍</Text>
              <Text style={[typography.body, styles.itemLocation, { marginLeft: spacing.xs }]}>{item.location}</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Tips */}
        <Animated.View
          entering={FadeIn.delay(1000)}
          style={[styles.tipsContainer, { marginTop: spacing.md, paddingHorizontal: spacing.lg }]}
        >
          <Text style={[typography.caption, styles.tipText]}>
            {isLost
              ? t('tip_lost_check_notifications') || "We'll notify you when potential matches are found"
              : t('tip_found_owner_contact') || "The owner will be able to contact you soon"}
          </Text>
        </Animated.View>
      </View>

      {/* Action Buttons */}
      <Animated.View
        entering={FadeInDown.delay(900).springify()}
        style={[
          styles.buttonsContainer, 
          { 
            paddingHorizontal: spacing.screenPadding, 
            paddingBottom: spacing['2xl'],
            paddingTop: spacing.md,
            gap: spacing.md,
          }
        ]}
      >
        {matchCount > 0 && (
          <EnhancedButton
            title={t('view_potential_matches')}
            onPress={handleViewMatches}
            variant="primary"
            size="large"
            icon="👁️"
          />
        )}
        <EnhancedButton
          title={t('go_home')}
          onPress={handleGoHome}
          variant={matchCount > 0 ? 'outline' : 'primary'}
          size="large"
          icon="🏠"
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
    overflow: 'hidden',
    zIndex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.success.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  ringsContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
  matchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accent[50],
    borderWidth: 1.5,
    borderColor: colors.accent[300],
    shadowColor: colors.accent[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  matchTextContainer: {
    flex: 1,
  },
  itemPreview: {
    width: '100%',
    alignItems: 'center',
  },
  itemTitle: {
    textAlign: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLocation: {
    color: colors.text.secondary,
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background.primary,
  },
  tipsContainer: {
  },
  tipText: {
    textAlign: 'center',
    color: colors.text.tertiary,
  },
});

export default ReportSuccessScreen;
