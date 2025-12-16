/**
 * Button components - Native-first button variants
 * Includes haptic feedback for native feel
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
import { Ionicons } from '@expo/vector-icons';
import { colors, borderRadius, typography, spacing, shadows } from '../../theme/theme';
import { haptics } from '../../utils/haptics';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

// Base button component with shared logic
function BaseButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
  size = 'md',
  variant,
}: ButtonProps & { variant: 'primary' | 'secondary' | 'outline' | 'ghost' }) {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    haptics.tap();
    onPress();
  };

  const sizeStyles = SIZE_STYLES[size];
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <TouchableOpacity
      style={[
        styles.base,
        sizeStyles.button,
        variantStyle.button,
        isDisabled && styles.disabled,
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variantStyle.loaderColor}
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons 
              name={icon} 
              size={sizeStyles.iconSize} 
              color={isDisabled ? colors.text.light : variantStyle.textColor} 
              style={styles.iconLeft}
            />
          )}
          <Text 
            style={[
              styles.text, 
              sizeStyles.text,
              { color: isDisabled ? colors.text.light : variantStyle.textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons 
              name={icon} 
              size={sizeStyles.iconSize} 
              color={isDisabled ? colors.text.light : variantStyle.textColor} 
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

// Exported button variants
export function PrimaryButton(props: ButtonProps) {
  return <BaseButton {...props} variant="primary" />;
}

export function SecondaryButton(props: ButtonProps) {
  return <BaseButton {...props} variant="secondary" />;
}

export function OutlineButton(props: ButtonProps) {
  return <BaseButton {...props} variant="outline" />;
}

export function GhostButton(props: ButtonProps) {
  return <BaseButton {...props} variant="ghost" />;
}

// Size configurations
const SIZE_STYLES = {
  sm: {
    button: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 36,
    } as ViewStyle,
    text: {
      fontSize: typography.sizes.sm,
    } as TextStyle,
    iconSize: 16,
  },
  md: {
    button: {
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      minHeight: 48,
    } as ViewStyle,
    text: {
      fontSize: typography.sizes.md,
    } as TextStyle,
    iconSize: 18,
  },
  lg: {
    button: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
      minHeight: 56,
    } as ViewStyle,
    text: {
      fontSize: typography.sizes.lg,
    } as TextStyle,
    iconSize: 20,
  },
};

// Variant configurations
const VARIANT_STYLES = {
  primary: {
    button: {
      backgroundColor: colors.primary.dark,
      ...shadows.sm,
    } as ViewStyle,
    textColor: colors.text.white,
    loaderColor: colors.text.white,
  },
  secondary: {
    button: {
      backgroundColor: colors.primary.accent,
      ...shadows.sm,
    } as ViewStyle,
    textColor: colors.text.white,
    loaderColor: colors.text.white,
  },
  outline: {
    button: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.primary.dark,
    } as ViewStyle,
    textColor: colors.primary.dark,
    loaderColor: colors.primary.dark,
  },
  ghost: {
    button: {
      backgroundColor: 'transparent',
    } as ViewStyle,
    textColor: colors.primary.dark,
    loaderColor: colors.primary.dark,
  },
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  text: {
    fontWeight: typography.weights.semibold,
  },
  disabled: {
    backgroundColor: colors.border.default,
    borderColor: colors.border.default,
    opacity: 0.6,
  },
  fullWidth: {
    width: '100%',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});
