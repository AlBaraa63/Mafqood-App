/**
 * Glassmorphic Card Component
 * Premium card with backdrop blur and gradient effects
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, shadows } from '../../theme';
import { useResponsive, useResponsiveSpacing } from '../../hooks/useResponsive';
import { useHaptics } from '../../hooks/useHaptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GlassCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'glass' | 'elevated' | 'outlined' | 'gradient' | 'premium';
  intensity?: 'light' | 'medium' | 'strong';
  haptic?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  onPress,
  style,
  variant = 'elevated',
  intensity = 'medium',
  haptic = true,
}) => {
  const scale = useSharedValue(1);
  const haptics = useHaptics();
  const { isSmallDevice } = useResponsive();
  const responsiveSpacing = useResponsiveSpacing();

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
    if (haptic) haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    if (onPress) {
      if (haptic) haptics.medium();
      onPress();
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: isSmallDevice ? borderRadius.lg : borderRadius.xl,
      padding: responsiveSpacing.lg,
      overflow: 'hidden',
    };

    const intensityMap = {
      light: 0.85,
      medium: 0.75,
      strong: 0.65,
    };

    switch (variant) {
      case 'glass':
        return {
          ...baseStyle,
          backgroundColor: `${colors.neutral.white}${Math.round(intensityMap[intensity] * 255).toString(16).padStart(2, '0')}`,
          borderWidth: 1,
          borderColor: `${colors.neutral[200]}40`,
          ...shadows.md,
        };
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor: colors.neutral.white,
          ...shadows.lg,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: colors.neutral.white,
          borderWidth: 2,
          borderColor: colors.neutral[200],
          ...shadows.sm,
        };
      case 'gradient':
        return {
          ...baseStyle,
          backgroundColor: colors.primary[50],
          borderWidth: 1,
          borderColor: colors.primary[100],
          ...shadows.md,
        };
      case 'premium':
        return {
          ...baseStyle,
          backgroundColor: colors.neutral.white,
          ...shadows.premium,
        };
      default:
        return baseStyle;
    }
  };

  if (onPress) {
    return (
      <AnimatedTouchable
        style={[getCardStyle(), animatedStyle, style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {children}
      </AnimatedTouchable>
    );
  }

  return (
    <Animated.View style={[getCardStyle(), style]}>
      {children}
    </Animated.View>
  );
};

export default GlassCard;
