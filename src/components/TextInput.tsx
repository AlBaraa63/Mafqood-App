/**
 * Mafqood Mobile - Text Input Component
 */

import React from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { colors, borderRadius, fontSize, fontWeight, spacing } from '../theme/theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  required?: boolean;
  icon?: React.ReactNode;
  error?: string;
}

export default function TextInput({
  label,
  required = false,
  icon,
  error,
  style,
  ...props
}: TextInputProps) {
  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          {icon}
          <Text style={styles.label}>
            {label} {required && <Text style={styles.required}>*</Text>}
          </Text>
        </View>
      )}

      <RNTextInput
        style={[
          styles.input,
          props.multiline && styles.multilineInput,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.text.tertiary}
        {...props}
      />

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  required: {
    color: colors.status.error,
  },
  input: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderWidth: 2,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.secondary,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  inputError: {
    borderColor: colors.status.error,
  },
  errorText: {
    fontSize: fontSize.xs,
    color: colors.status.error,
    marginTop: spacing.xs,
  },
});
