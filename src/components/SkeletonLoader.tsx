/**
 * SkeletonLoader Component
 * Animated placeholder while content is loading
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import { colors, borderRadius, spacing } from '../theme/theme';

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius: radius = borderRadius.sm,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
};

/**
 * ItemCardSkeleton - Skeleton for item cards
 */
export const ItemCardSkeleton: React.FC = () => {
  return (
    <View style={styles.itemCard}>
      <SkeletonLoader width={80} height={80} borderRadius={borderRadius.md} />
      <View style={styles.itemCardContent}>
        <SkeletonLoader width="70%" height={18} />
        <SkeletonLoader width="50%" height={14} style={{ marginTop: spacing.xs }} />
        <SkeletonLoader width="40%" height={14} style={{ marginTop: spacing.xs }} />
      </View>
    </View>
  );
};

/**
 * MatchCardSkeleton - Skeleton for match cards
 */
export const MatchCardSkeleton: React.FC = () => {
  return (
    <View style={styles.matchCard}>
      <View style={styles.matchCardImages}>
        <SkeletonLoader width={100} height={100} borderRadius={borderRadius.md} />
        <View style={styles.matchIndicator}>
          <SkeletonLoader width={40} height={40} borderRadius={20} />
        </View>
        <SkeletonLoader width={100} height={100} borderRadius={borderRadius.md} />
      </View>
      <SkeletonLoader width="60%" height={16} style={{ marginTop: spacing.md, alignSelf: 'center' }} />
      <SkeletonLoader width="40%" height={14} style={{ marginTop: spacing.sm, alignSelf: 'center' }} />
    </View>
  );
};

/**
 * ListSkeleton - Skeleton for a list of items
 */
interface ListSkeletonProps {
  count?: number;
  type?: 'item' | 'match';
}

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ count = 3, type = 'item' }) => {
  const SkeletonComponent = type === 'match' ? MatchCardSkeleton : ItemCardSkeleton;

  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.background.tertiary,
  },
  itemCard: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  itemCardContent: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  matchCard: {
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  matchCardImages: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchIndicator: {
    marginHorizontal: spacing.md,
  },
  list: {
    padding: spacing.md,
  },
});
