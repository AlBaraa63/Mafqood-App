/**
 * Animated Value Hook
 * Simplifies complex animations with Reanimated
 */

import { useEffect } from 'react';
import { useSharedValue, withSpring, withTiming, withSequence } from 'react-native-reanimated';

export const useAnimatedValue = (initialValue: number = 0) => {
  const value = useSharedValue(initialValue);

  const animate = {
    spring: (toValue: number, config?: any) => {
      value.value = withSpring(toValue, config);
    },
    timing: (toValue: number, config?: any) => {
      value.value = withTiming(toValue, config);
    },
    sequence: (...values: number[]) => {
      value.value = withSequence(...values.map(v => withTiming(v)));
    },
  };

  return { value, animate };
};

/**
 * Fade In Animation Hook
 */
export const useFadeIn = (delay: number = 0) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 400,
    });
  }, [delay]);

  return opacity;
};

/**
 * Scale Animation Hook
 */
export const useScale = () => {
  const scale = useSharedValue(1);

  const scaleIn = () => {
    scale.value = withSpring(1.05, { damping: 10 });
  };

  const scaleOut = () => {
    scale.value = withSpring(1, { damping: 10 });
  };

  const pulse = () => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
  };

  return { scale, scaleIn, scaleOut, pulse };
};

export default useAnimatedValue;
