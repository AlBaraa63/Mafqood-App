/**
 * Skeleton Loader Component
 * Provides smooth loading states with shimmer animation
 */

import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, borderRadius } from '../../theme';
import { useResponsiveSpacing } from '../../hooks/useResponsive';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'rectangular' | 'circular' | 'text';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius: customBorderRadius,
  style,
  variant = 'rectangular',
}) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-300, 300]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const getShape = (): ViewStyle => {
    switch (variant) {
      case 'circular':
        return {
          width: typeof width === 'number' ? width : 40,
          height: typeof height === 'number' ? height : 40,
          borderRadius: 9999,
        };
      case 'text':
        return {
          width,
          height: typeof height === 'number' ? height : 16,
          borderRadius: borderRadius.sm,
        };
      case 'rectangular':
      default:
        return {
          width,
          height,
          borderRadius: customBorderRadius ?? borderRadius.md,
        };
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor: colors.neutral[100],
          overflow: 'hidden',
        },
        getShape(),
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            width: '100%',
            height: '100%',
            backgroundColor: colors.neutral[200],
            opacity: 0.5,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

/**
 * Card Skeleton
 */
export const CardSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const responsiveSpacing = useResponsiveSpacing();

  return (
    <View
      style={[
        {
          padding: responsiveSpacing.lg,
          backgroundColor: colors.neutral.white,
          borderRadius: borderRadius.xl,
          gap: responsiveSpacing.md,
        },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', gap: responsiveSpacing.md }}>
        <Skeleton variant="circular" width={50} height={50} />
        <View style={{ flex: 1, gap: responsiveSpacing.sm }}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <Skeleton width="100%" height={120} />
      <Skeleton width="100%" height={14} />
      <Skeleton width="80%" height={14} />
    </View>
  );
};

/**
 * List Skeleton
 */
export const ListSkeleton: React.FC<{ count?: number; style?: ViewStyle }> = ({
  count = 3,
  style,
}) => {
  const responsiveSpacing = useResponsiveSpacing();

  return (
    <View style={[{ gap: responsiveSpacing.md }, style]}>
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </View>
  );
};

export default Skeleton;
