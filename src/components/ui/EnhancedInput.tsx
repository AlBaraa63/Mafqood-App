/**
 * Enhanced Input Component
 * Premium input with validation, animations, and accessibility
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius } from '../../theme';
import { useResponsiveSpacing, useResponsiveFontSize } from '../../hooks/useResponsive';
import { useHaptics } from '../../hooks/useHaptics';

interface EnhancedInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  variant?: 'default' | 'filled' | 'outlined';
  accessibilityLabelOverride?: string;
}

export const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  variant = 'outlined',
  onFocus,
  onBlur,
  accessibilityLabelOverride,
  ...textInputProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const responsiveSpacing = useResponsiveSpacing();
  const responsiveFontSize = useResponsiveFontSize();
  const haptics = useHaptics();

  const borderColorValue = useSharedValue(
    error ? colors.error.main : colors.neutral[300]
  );

  const handleFocus = useCallback(
    (e: any) => {
      setIsFocused(true);
      borderColorValue.value = withTiming(colors.primary[500], { duration: 200 });
      haptics.selection();
      onFocus?.(e);
    },
    [onFocus]
  );

  const handleBlur = useCallback(
    (e: any) => {
      setIsFocused(false);
      borderColorValue.value = withTiming(
        error ? colors.error.main : colors.neutral[300],
        { duration: 200 }
      );
      onBlur?.(e);
    },
    [onBlur, error]
  );

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColorValue.value,
  }));

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: responsiveSpacing.md,
      paddingVertical: responsiveSpacing.sm,
      borderWidth: 2,
      minHeight: 52,
    };

    switch (variant) {
      case 'filled':
        return {
          ...baseStyle,
          backgroundColor: colors.neutral[50],
          borderColor: 'transparent',
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor: colors.neutral.white,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={{
            fontSize: responsiveFontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.text.primary,
            marginBottom: responsiveSpacing.sm,
          }}
        >
          {label}
        </Text>
      )}

      <Animated.View style={[getContainerStyle(), animatedBorderStyle]}>
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon}
            size={20}
            color={isFocused ? colors.primary[500] : colors.neutral[400]}
            style={{ marginRight: responsiveSpacing.sm }}
          />
        )}

        <TextInput
          {...textInputProps}
          style={[
            {
              flex: 1,
              fontSize: responsiveFontSize.md,
              color: colors.text.primary,
              paddingVertical: responsiveSpacing.sm,
            },
            inputStyle,
          ]}
          placeholderTextColor={colors.neutral[400]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessible={true}
          accessibilityLabel={accessibilityLabelOverride || label}
          accessibilityHint={helperText}
          editable={textInputProps.editable !== false}
        />

        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
            <MaterialCommunityIcons
              name={rightIcon}
              size={20}
              color={isFocused ? colors.primary[500] : colors.neutral[400]}
              style={{ marginLeft: responsiveSpacing.sm }}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {(error || helperText) && (
        <Text
          style={{
            fontSize: responsiveFontSize.sm,
            color: error ? colors.error.main : colors.text.tertiary,
            marginTop: responsiveSpacing.xs,
            marginLeft: responsiveSpacing.sm,
          }}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

export default EnhancedInput;
