/**
 * Enhanced Button Component
 * Premium animations, haptics, and responsive design
 */

import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { useHaptics } from '../../hooks/useHaptics';
import { useResponsive, useResponsiveSpacing, useResponsiveFontSize } from '../../hooks/useResponsive';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  haptic?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const EnhancedButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  haptic = true,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;
  const haptics = useHaptics();
  const { isSmallDevice } = useResponsive();
  const responsiveSpacing = useResponsiveSpacing();
  const responsiveFontSize = useResponsiveFontSize();

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    scale.value = withSpring(0.96, { damping: 15 });
    opacity.value = withTiming(0.9, { duration: 100 });
    if (haptic) haptics.light();
  }, [isDisabled, haptic]);

  const handlePressOut = useCallback(() => {
    if (isDisabled) return;
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 100 });
  }, [isDisabled]);

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    if (haptic) haptics.medium();
    onPress();
  }, [isDisabled, onPress, haptic]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getContainerStyle = (): ViewStyle[] => {
    const baseSize = {
      small: {
        paddingVertical: responsiveSpacing.sm,
        paddingHorizontal: responsiveSpacing.md,
        minHeight: isSmallDevice ? 40 : 44,
      },
      medium: {
        paddingVertical: responsiveSpacing.md,
        paddingHorizontal: responsiveSpacing.xl,
        minHeight: isSmallDevice ? 48 : 52,
      },
      large: {
        paddingVertical: responsiveSpacing.lg,
        paddingHorizontal: responsiveSpacing['2xl'],
        minHeight: isSmallDevice ? 54 : 60,
      },
    };

    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.xl,
      gap: responsiveSpacing.sm,
      ...baseSize[size],
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    let variantStyle: ViewStyle = {};
    switch (variant) {
      case 'primary':
        variantStyle = {
          backgroundColor: colors.primary[500],
          ...shadows.lg,
        };
        if (isDisabled) {
          variantStyle.backgroundColor = colors.primary[200];
          variantStyle.opacity = 0.6;
        }
        break;
      case 'secondary':
        variantStyle = {
          backgroundColor: colors.highlight[500],
          ...shadows.md,
        };
        if (isDisabled) {
          variantStyle.backgroundColor = colors.highlight[200];
          variantStyle.opacity = 0.6;
        }
        break;
      case 'outline':
        variantStyle = {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary[500],
        };
        if (isDisabled) {
          variantStyle.borderColor = colors.neutral[300];
          variantStyle.opacity = 0.5;
        }
        break;
      case 'ghost':
        variantStyle = {
          backgroundColor: 'transparent',
        };
        if (isDisabled) {
          variantStyle.opacity = 0.4;
        }
        break;
      case 'gradient':
        variantStyle = {
          backgroundColor: colors.accent[500],
          ...shadows.premium,
        };
        if (isDisabled) {
          variantStyle.opacity = 0.5;
        }
        break;
    }

    return [baseStyle, variantStyle, style].filter(Boolean) as ViewStyle[];
  };

  const getTextStyle = (): TextStyle[] => {
    const fontSizes = {
      small: responsiveFontSize.sm,
      medium: responsiveFontSize.md,
      large: responsiveFontSize.lg,
    };

    const baseStyle: TextStyle = {
      fontSize: fontSizes[size],
      fontWeight: typography.fontWeight.semibold,
    };

    let variantTextStyle: TextStyle = {};
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'gradient':
        variantTextStyle = { color: colors.neutral.white };
        break;
      case 'outline':
      case 'ghost':
        variantTextStyle = { color: colors.primary[500] };
        break;
    }

    if (isDisabled) {
      variantTextStyle.color = colors.neutral[400];
    }

    return [baseStyle, variantTextStyle, textStyle].filter(Boolean) as TextStyle[];
  };

  return (
    <AnimatedTouchable
      style={[getContainerStyle(), animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      activeOpacity={1}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary' || variant === 'secondary' || variant === 'gradient'
              ? colors.neutral.white
              : colors.primary[500]
          }
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={getTextStyle()}>{title}</Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </AnimatedTouchable>
  );
};

export default EnhancedButton;
