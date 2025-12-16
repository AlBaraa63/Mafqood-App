/**
 * SegmentedControl - Native-style segmented toggle
 * For switching between tabs/options within a screen
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { colors, borderRadius, typography, spacing } from '../../theme/theme';
import { haptics } from '../../utils/haptics';

interface Segment {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps {
  segments: Segment[];
  selectedKey: string;
  onSelect: (key: string) => void;
  /** Optional accent color for the selected segment */
  accentColor?: string;
}

export default function SegmentedControl({
  segments,
  selectedKey,
  onSelect,
  accentColor = colors.primary.dark,
}: SegmentedControlProps) {
  const handleSelect = (key: string) => {
    if (key !== selectedKey) {
      haptics.tap();
      onSelect(key);
    }
  };

  return (
    <View style={styles.container}>
      {segments.map((segment) => {
        const isSelected = segment.key === selectedKey;
        return (
          <TouchableOpacity
            key={segment.key}
            style={[
              styles.segment,
              isSelected && [styles.segmentSelected, { backgroundColor: accentColor }],
            ]}
            onPress={() => handleSelect(segment.key)}
            activeOpacity={0.7}
          >
            {segment.icon && (
              <View style={styles.iconWrapper}>
                {segment.icon}
              </View>
            )}
            <Text
              style={[
                styles.label,
                isSelected && styles.labelSelected,
              ]}
              numberOfLines={1}
            >
              {segment.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.lg,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  segmentSelected: {
    backgroundColor: colors.primary.dark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  iconWrapper: {
    marginRight: 4,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: 'rgba(255,255,255,0.7)',
  },
  labelSelected: {
    color: colors.text.white,
    fontWeight: typography.weights.bold,
  },
});
