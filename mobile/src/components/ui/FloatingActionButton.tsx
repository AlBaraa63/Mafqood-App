/**
 * Floating Action Button (FAB)
 * Premium animated FAB with multiple action options
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { useResponsive, useResponsiveSpacing } from '../../hooks/useResponsive';
import { useHaptics } from '../../hooks/useHaptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface FABAction {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}

interface FABProps {
  actions?: FABAction[];
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  actions = [],
  icon = 'plus',
  onPress,
  position = 'bottom-right',
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const rotation = useSharedValue(0);
  const haptics = useHaptics();
  const { isSmallDevice } = useResponsive();
  const responsiveSpacing = useResponsiveSpacing();

  const toggleExpand = useCallback(() => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    rotation.value = withSpring(newState ? 45 : 0, { damping: 15 });
    haptics.medium();

    if (onPress && !actions.length) {
      onPress();
    }
  }, [isExpanded, onPress, actions]);

  const handleActionPress = useCallback((action: FABAction) => {
    action.onPress();
    setIsExpanded(false);
    rotation.value = withSpring(0, { damping: 15 });
    haptics.success();
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const getPositionStyle = (): ViewStyle => {
    const offset = responsiveSpacing.lg;
    
    switch (position) {
      case 'bottom-left':
        return { position: 'absolute', bottom: offset, left: offset };
      case 'bottom-center':
        return { position: 'absolute', bottom: offset, alignSelf: 'center' };
      case 'bottom-right':
      default:
        return { position: 'absolute', bottom: offset, right: offset };
    }
  };

  const fabSize = isSmallDevice ? 56 : 64;

  return (
    <View style={[getPositionStyle(), style]}>
      {/* Action Items */}
      {isExpanded && actions.length > 0 && (
        <View style={{ marginBottom: responsiveSpacing.md, gap: responsiveSpacing.sm }}>
          {actions.map((action, index) => (
            <Animated.View
              key={action.label}
              entering={
                // Stagger animation
                undefined
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
              }}
            >
              <View
                style={{
                  backgroundColor: colors.neutral.white,
                  paddingHorizontal: responsiveSpacing.md,
                  paddingVertical: responsiveSpacing.sm,
                  borderRadius: borderRadius.md,
                  marginRight: responsiveSpacing.sm,
                  ...shadows.md,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.text.primary,
                  }}
                >
                  {action.label}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleActionPress(action)}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: action.color || colors.primary[500],
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...shadows.lg,
                }}
              >
                <MaterialCommunityIcons
                  name={action.icon}
                  size={24}
                  color={colors.neutral.white}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      )}

      {/* Main FAB */}
      <AnimatedTouchable
        onPress={toggleExpand}
        style={{
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          backgroundColor: colors.accent[500],
          alignItems: 'center',
          justifyContent: 'center',
          ...shadows.premium,
        }}
      >
        <Animated.View style={animatedIconStyle}>
          <MaterialCommunityIcons
            name={icon}
            size={isSmallDevice ? 28 : 32}
            color={colors.neutral.white}
          />
        </Animated.View>
      </AnimatedTouchable>
    </View>
  );
};

export default FloatingActionButton;
