/**
 * Button Component
 * Primary and secondary buttons with various states
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const isDisabled = disabled || loading;
  
  const getContainerStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle[] = [styles.base, styles[`size_${size}`]];
    
    if (fullWidth) {
      baseStyle.push(styles.fullWidth);
    }
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary);
        if (isDisabled) baseStyle.push(styles.primaryDisabled);
        break;
      case 'secondary':
        baseStyle.push(styles.secondary);
        if (isDisabled) baseStyle.push(styles.secondaryDisabled);
        break;
      case 'outline':
        baseStyle.push(styles.outline);
        if (isDisabled) baseStyle.push(styles.outlineDisabled);
        break;
      case 'ghost':
        baseStyle.push(styles.ghost);
        if (isDisabled) baseStyle.push(styles.ghostDisabled);
        break;
    }
    
    if (style) baseStyle.push(style);
    
    return baseStyle;
  };
  
  const getTextStyle = (): TextStyle[] => {
    const baseStyle: TextStyle[] = [styles.text, styles[`text_${size}`]];
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.textPrimary);
        break;
      case 'secondary':
        baseStyle.push(styles.textSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.textOutline);
        break;
      case 'ghost':
        baseStyle.push(styles.textGhost);
        break;
    }
    
    if (isDisabled) {
      baseStyle.push(styles.textDisabled);
    }
    
    if (textStyle) baseStyle.push(textStyle);
    
    return baseStyle;
  };
  
  return (
    <TouchableOpacity
      style={getContainerStyle()}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? colors.neutral.white : colors.primary[500]}
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius['2xl'],
    gap: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  
  // Sizes
  size_small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  size_medium: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 48,
  },
  size_large: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing['2xl'],
    minHeight: 56,
  },
  
  // Variants
  primary: {
    backgroundColor: colors.primary[500],
    ...shadows.lg,
  },
  primaryDisabled: {
    backgroundColor: colors.primary[200],
  },
  secondary: {
    backgroundColor: colors.accent[500],
    ...shadows.md,
  },
  secondaryDisabled: {
    backgroundColor: colors.accent[200],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[500],
    ...shadows.sm,
  },
  outlineDisabled: {
    borderColor: colors.neutral[300],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostDisabled: {
    opacity: 0.5,
  },
  
  // Text
  text: {
    fontWeight: typography.fontWeight.semibold,
  },
  text_small: {
    fontSize: typography.fontSize.sm,
  },
  text_medium: {
    fontSize: typography.fontSize.md,
  },
  text_large: {
    fontSize: typography.fontSize.lg,
  },
  textPrimary: {
    color: colors.neutral.white,
  },
  textSecondary: {
    color: colors.neutral[900],
  },
  textOutline: {
    color: colors.primary[500],
  },
  textGhost: {
    color: colors.primary[500],
  },
  textDisabled: {
    color: colors.neutral[400],
  },
});

export default Button;
