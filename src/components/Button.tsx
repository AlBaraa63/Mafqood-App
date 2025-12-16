/**
 * Mafqood Mobile - Custom Button Component
 * Matches web app button styles with haptic feedback
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors, borderRadius, fontSize, fontWeight, spacing, shadows } from '../theme/theme';
import { haptics } from '../utils/haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  haptic?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  haptic = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (haptic) {
      haptics.tap();
    }
    onPress();
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.lg,
      ...shadows.md,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, minHeight: 36 },
      medium: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, minHeight: 48 },
      large: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.lg, minHeight: 56 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: { backgroundColor: colors.primary.dark },
      secondary: { backgroundColor: colors.primary.accent },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary.dark,
        ...shadows.sm,
      },
      ghost: {
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
      },
    };

    // Disabled styles
    const disabledStyle: ViewStyle = isDisabled
      ? { backgroundColor: colors.border.default, opacity: 0.7 }
      : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(variant !== 'outline' && variant !== 'ghost' ? disabledStyle : {}),
      ...(fullWidth ? { width: '100%' } : {}),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: fontWeight.bold,
    };

    // Size styles
    const sizeStyles: Record<string, TextStyle> = {
      small: { fontSize: fontSize.sm },
      medium: { fontSize: fontSize.md },
      large: { fontSize: fontSize.lg },
    };

    // Variant styles
    const variantStyles: Record<string, TextStyle> = {
      primary: { color: colors.text.white },
      secondary: { color: colors.text.white },
      outline: { color: colors.primary.dark },
      ghost: { color: colors.primary.dark },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' || variant === 'ghost' ? colors.primary.dark : colors.text.white}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={{ marginRight: spacing.sm }}>{icon}</View>
          )}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {icon && iconPosition === 'right' && (
            <View style={{ marginLeft: spacing.sm }}>{icon}</View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}
