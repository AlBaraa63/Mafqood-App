/**
 * Compact Progress Stepper - Native Mobile Design
 * Minimal vertical space, animated progress, haptic feedback
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../theme';
import { useDynamicStyles, useHaptics } from '../../hooks';

interface ProgressStepperProps {
  currentStep: number;
  totalSteps: number;
  onStepPress?: (step: number) => void;
  showLabels?: boolean;
  labels?: string[];
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  currentStep,
  totalSteps,
  onStepPress,
  showLabels = false,
  labels = [],
}) => {
  const { typography, spacing, layout, isSmallDevice } = useDynamicStyles();
  const haptics = useHaptics();
  
  // Animated progress value
  const progress = useSharedValue(0);
  
  useEffect(() => {
    const targetProgress = (currentStep - 1) / (totalSteps - 1);
    progress.value = withSpring(targetProgress, { damping: 15, stiffness: 100 });
    haptics.selection();
  }, [currentStep, totalSteps]);
  
  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));
  
  const stepSize = isSmallDevice ? 24 : 28;
  const connectorHeight = 3;
  
  return (
    <View style={{ paddingVertical: spacing.md }}>
      {/* Progress Bar Background */}
      <View style={{ paddingHorizontal: spacing.sm }}>
        <View
          style={{
            height: connectorHeight,
            backgroundColor: colors.neutral[200],
            borderRadius: connectorHeight / 2,
            overflow: 'hidden',
          }}
        >
          {/* Animated Progress Fill */}
          <Animated.View
            style={[
              {
                height: '100%',
                backgroundColor: colors.primary[500],
                borderRadius: connectorHeight / 2,
              },
              animatedProgressStyle,
            ]}
          />
        </View>
        
        {/* Step Indicators */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: -connectorHeight / 2 - stepSize / 2,
          }}
        >
          {Array.from({ length: totalSteps }).map((_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isAccessible = stepNumber <= currentStep;
            
            return (
              <StepIndicator
                key={index}
                stepNumber={stepNumber}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                size={stepSize}
                onPress={isAccessible && onStepPress ? () => onStepPress(stepNumber) : undefined}
                label={showLabels ? labels[index] : undefined}
              />
            );
          })}
        </View>
      </View>
      
      {/* Current Step Label */}
      {labels[currentStep - 1] && (
        <Text
          style={[
            typography.labelSmall,
            {
              textAlign: 'center',
              marginTop: spacing.sm,
              color: colors.primary[600],
            },
          ]}
        >
          {`${currentStep}/${totalSteps} • ${labels[currentStep - 1]}`}
        </Text>
      )}
    </View>
  );
};

interface StepIndicatorProps {
  stepNumber: number;
  isCompleted: boolean;
  isCurrent: boolean;
  size: number;
  onPress?: () => void;
  label?: string;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  stepNumber,
  isCompleted,
  isCurrent,
  size,
  onPress,
  label,
}) => {
  const { typography, spacing } = useDynamicStyles();
  const haptics = useHaptics();
  const scale = useSharedValue(1);
  
  useEffect(() => {
    if (isCurrent) {
      scale.value = withSpring(1.1, { damping: 10 });
    } else {
      scale.value = withSpring(1, { damping: 15 });
    }
  }, [isCurrent]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePress = () => {
    if (onPress) {
      haptics.light();
      onPress();
    }
  };
  
  const backgroundColor = isCompleted
    ? colors.primary[500]
    : isCurrent
    ? colors.neutral.white
    : colors.neutral[100];
  
  const borderColor = isCompleted || isCurrent
    ? colors.primary[500]
    : colors.neutral[300];
  
  const content = (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderWidth: 2,
          borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: isCurrent ? colors.primary[500] : 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: isCurrent ? 4 : 0,
        },
        animatedStyle,
      ]}
    >
      {isCompleted ? (
        <MaterialCommunityIcons
          name="check"
          size={size * 0.5}
          color={colors.neutral.white}
        />
      ) : (
        <Text
          style={{
            fontSize: size * 0.4,
            fontWeight: '600',
            color: isCurrent ? colors.primary[500] : colors.neutral[400],
          }}
        >
          {stepNumber}
        </Text>
      )}
    </Animated.View>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  
  return content;
};

export default ProgressStepper;
