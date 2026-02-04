/**
 * Card Component
 * Reusable card container with variants
 */

import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'default',
}) => {
  const getCardStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.base];
    
    switch (variant) {
      case 'elevated':
        baseStyle.push(styles.elevated);
        break;
      case 'outlined':
        baseStyle.push(styles.outlined);
        break;
      default:
        baseStyle.push(styles.default);
    }
    
    if (style) baseStyle.push(style);
    
    return baseStyle;
  };
  
  if (onPress) {
    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {children}
      </TouchableOpacity>
    );
  }
  
  return <View style={getCardStyle()}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    backgroundColor: colors.neutral.white,
    overflow: 'hidden',
  },
  default: {
    ...shadows.sm,
  },
  elevated: {
    ...shadows.lg,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
    backgroundColor: colors.neutral.white,
    ...shadows.sm,
  },
});

export default Card;
