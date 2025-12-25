import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../theme';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  elevated?: boolean;
}

export const Card: React.FC<Props> = ({ children, style, padded = true, elevated = true }) => {
  return (
    <View
      style={StyleSheet.flatten([
        styles.base,
        padded && styles.padded,
        elevated && styles.elevated,
        style,
      ])}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.surface,
    borderRadius: borderRadius.xl,
  },
  padded: {
    padding: spacing.lg,
  },
  elevated: {
    ...shadows.md,
  },
});

export default Card;
