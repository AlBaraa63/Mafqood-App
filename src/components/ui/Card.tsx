import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
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
        elevated && (Platform.OS === 'web' ? styles.elevatedWeb : styles.elevated),
        style,
      ])}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
  },
  padded: {
    padding: spacing.lg,
  },
  elevated: {
    ...shadows.md,
  },
  elevatedWeb: {
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
  } as any,
});

export default Card;
