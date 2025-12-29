/**
 * Component Showcase Screen
 * Demo all premium components for testing and reference
 */

import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  EnhancedButton,
  GlassCard,
  Skeleton,
  CardSkeleton,
  ResponsiveContainer,
  EnhancedInput,
  FloatingActionButton,
} from '../../components/ui';
import { useResponsive, useResponsiveSpacing, useResponsiveFontSize } from '../../hooks';
import { colors, typography, borderRadius } from '../../theme';

export const ComponentShowcaseScreen: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');
  
  const { isSmallDevice } = useResponsive();
  const spacing = useResponsiveSpacing();
  const fontSize = useResponsiveFontSize();

  const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <View style={{ marginBottom: spacing['2xl'] }}>
      <Text style={{
        fontSize: fontSize.xl,
        fontWeight: typography.fontWeight.bold,
        color: colors.text.primary,
        marginBottom: spacing.lg,
      }}>
        {title}
      </Text>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        
        {/* Header */}
        <View style={{ marginBottom: spacing['2xl'] }}>
          <Text style={{
            fontSize: fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginBottom: spacing.sm,
          }}>
            Component Showcase
          </Text>
          <Text style={{
            fontSize: fontSize.md,
            color: colors.text.secondary,
          }}>
            Premium UI components demo
          </Text>
        </View>

        {/* Buttons Section */}
        <Section title="Enhanced Buttons">
          <View style={{ gap: spacing.md }}>
            <EnhancedButton
              title="Primary Button"
              onPress={() => console.log('Primary')}
              variant="primary"
              fullWidth
            />
            <EnhancedButton
              title="Secondary Button"
              onPress={() => console.log('Secondary')}
              variant="secondary"
              fullWidth
            />
            <EnhancedButton
              title="Gradient Button"
              onPress={() => console.log('Gradient')}
              variant="gradient"
              fullWidth
              icon={<MaterialCommunityIcons name="star" size={20} color={colors.neutral.white} />}
            />
            <EnhancedButton
              title="Outline Button"
              onPress={() => console.log('Outline')}
              variant="outline"
              fullWidth
            />
            <EnhancedButton
              title="Ghost Button"
              onPress={() => console.log('Ghost')}
              variant="ghost"
              fullWidth
            />
          </View>
        </Section>

        {/* Cards Section */}
        <Section title="Glass Cards">
          <View style={{ gap: spacing.md }}>
            <GlassCard variant="glass" intensity="light">
              <Text style={{ fontSize: fontSize.md, fontWeight: typography.fontWeight.semibold }}>
                Glass Card (Light)
              </Text>
              <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 }}>
                Modern glassmorphism effect
              </Text>
            </GlassCard>
            
            <GlassCard variant="premium" onPress={() => console.log('Premium pressed')}>
              <Text style={{ fontSize: fontSize.md, fontWeight: typography.fontWeight.semibold }}>
                Premium Card (Tappable)
              </Text>
              <Text style={{ fontSize: fontSize.sm, color: colors.text.secondary, marginTop: 4 }}>
                Maximum shadow elevation
              </Text>
            </GlassCard>
          </View>
        </Section>

        {/* Bottom Spacing for FAB */}
        <View style={{ height: spacing['6xl'] }} />
      </ScrollView>

      {/* Floating Action Button */}
      <FloatingActionButton
        actions={[
          {
            icon: 'reload',
            label: 'Refresh',
            onPress: () => setIsLoading(!isLoading),
            color: colors.primary[500],
          },
          {
            icon: 'information',
            label: 'Info',
            onPress: () => console.log('Info'),
            color: colors.accent[500],
          },
        ]}
      />
    </SafeAreaView>
  );
};

export default ComponentShowcaseScreen;
