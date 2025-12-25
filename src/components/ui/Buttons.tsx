import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../../theme';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  iconLeft?: React.ReactNode;
}

const baseStyles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  md: {
    paddingVertical: spacing.md,
  },
  lg: {
    paddingVertical: spacing.lg,
  },
  primary: {
    backgroundColor: colors.primary[500],
    ...shadows.md,
  },
  primaryText: {
    color: colors.neutral.white,
  },
  secondary: {
    backgroundColor: colors.accent[500],
  },
  secondaryText: {
    color: colors.text.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.primary[500],
  },
  text: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  disabled: {
    opacity: 0.6,
  },
});

export const PrimaryButton: React.FC<ButtonProps> = (props) => (
  <BaseButton {...props} variant="primary" />
);

export const SecondaryButton: React.FC<ButtonProps> = (props) => (
  <BaseButton {...props} variant="secondary" />
);

export const GhostButton: React.FC<ButtonProps> = (props) => (
  <BaseButton {...props} variant="ghost" />
);

const BaseButton: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  style,
  textStyle,
  iconLeft,
}) => {
  const container = StyleSheet.flatten([
    baseStyles.button,
    size === 'lg' ? baseStyles.lg : baseStyles.md,
    variant === 'primary' && baseStyles.primary,
    variant === 'secondary' && baseStyles.secondary,
    variant === 'ghost' && baseStyles.ghost,
    (disabled || loading) && baseStyles.disabled,
    style,
  ]);

  const text = StyleSheet.flatten([
    baseStyles.text,
    variant === 'primary' && baseStyles.primaryText,
    variant === 'secondary' && baseStyles.secondaryText,
    variant === 'ghost' && baseStyles.ghostText,
    textStyle,
  ]);

  return (
    <TouchableOpacity
      style={container}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? colors.neutral.white : colors.primary[500]} />
      ) : (
        <>
          {iconLeft}
          <Text style={text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;
