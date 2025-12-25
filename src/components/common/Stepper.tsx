/**
 * Stepper Component
 * Progress stepper for multi-step forms
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../../theme';
import { useTranslation } from '../../hooks';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  totalSteps,
  labels,
}) => {
  const { t, isRTL } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={[styles.stepsContainer, isRTL && styles.rtl]}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <View
                style={[
                  styles.step,
                  isCompleted && styles.stepCompleted,
                  isCurrent && styles.stepCurrent,
                ]}
              >
                {isCompleted ? (
                  <Text style={styles.checkmark}>✓</Text>
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      (isCompleted || isCurrent) && styles.stepNumberActive,
                    ]}
                  >
                    {stepNumber}
                  </Text>
                )}
              </View>
              
              {/* Connector Line */}
              {index < totalSteps - 1 && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                  ]}
                />
              )}
            </React.Fragment>
          );
        })}
      </View>
      
      {/* Labels */}
      {labels && labels.length > 0 && (
        <View style={[styles.labelsContainer, isRTL && styles.rtl]}>
          {labels.map((label, index) => (
            <Text
              key={index}
              style={[
                styles.label,
                index + 1 === currentStep && styles.labelActive,
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          ))}
        </View>
      )}
      
      {/* Progress Text */}
      <Text style={styles.progressText}>
        {t('step_progress', { current: currentStep.toString(), total: totalSteps.toString() })}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rtl: {
    flexDirection: 'row-reverse',
  },
  step: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  stepCompleted: {
    backgroundColor: colors.accent[500],
    borderColor: colors.accent[500],
  },
  stepCurrent: {
    backgroundColor: colors.neutral.white,
    borderColor: colors.primary[500],
  },
  stepNumber: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[500],
  },
  stepNumberActive: {
    color: colors.primary[500],
  },
  checkmark: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.neutral[200],
    marginHorizontal: spacing.xs,
    maxWidth: 40,
  },
  connectorCompleted: {
    backgroundColor: colors.primary[500],
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    flex: 1,
    textAlign: 'center',
  },
  labelActive: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  progressText: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});

export default Stepper;
