/**
 * Report Type Select Screen - Native Mobile Design
 * Step 1: Choose between lost or found item
 * Dynamic fonts, haptics, animations
 */

import React, { useCallback } from 'react';
import { View, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { GlassCard, ProgressStepper } from '../../components/ui';
import { useTranslation, useHaptics, useDynamicStyles } from '../../hooks';
import { useReportFormStore } from '../../hooks/useStore';
import { ReportStackParamList } from '../../types';
import { colors, shadows } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportTypeSelect'>;

const AnimatedView = Animated.View;

interface TypeCardProps {
  type: 'lost' | 'found';
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
  hint: string;
  color: string;
  bgColor: string;
  onPress: () => void;
  delay: number;
}

const TypeCard: React.FC<TypeCardProps> = ({
  type,
  icon,
  title,
  description,
  hint,
  color,
  bgColor,
  onPress,
  delay,
}) => {
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    haptics.medium();
    onPress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <GlassCard
        variant="elevated"
        onPress={handlePress}
        style={{ marginBottom: spacing.md }}
      >
        <Animated.View style={animatedStyle}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: spacing.lg,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: layout.avatarLg,
                height: layout.avatarLg,
                borderRadius: layout.avatarLg / 2,
                backgroundColor: bgColor,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.lg,
              }}
            >
              <MaterialCommunityIcons name={icon} size={layout.iconXl} color={color} />
            </View>

            {/* Content */}
            <View style={{ flex: 1 }}>
              <Text style={[typography.h3, { marginBottom: spacing.xs }]}>{title}</Text>
              <Text style={[typography.body, { marginBottom: spacing.sm }]}>{description}</Text>
              
              {/* Hint Badge */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.neutral[100],
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  borderRadius: layout.radiusFull,
                  alignSelf: 'flex-start',
                }}
              >
                <MaterialCommunityIcons
                  name="lightbulb-outline"
                  size={layout.iconSm}
                  color={color}
                />
                <Text
                  style={[
                    typography.caption,
                    { marginLeft: spacing.xs, color: colors.text.secondary },
                  ]}
                >
                  {hint}
                </Text>
              </View>
            </View>

            {/* Arrow */}
            <MaterialCommunityIcons
              name="chevron-right"
              size={layout.iconLg}
              color={colors.neutral[400]}
            />
          </View>
        </Animated.View>
      </GlassCard>
    </Animated.View>
  );
};

export const ReportTypeSelectScreen: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { setType, resetForm } = useReportFormStore();
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();

  React.useEffect(() => {
    resetForm();
  }, []);

  const stepLabels = [
    t('step_label_type'),
    t('step_label_photo'),
    t('step_label_details'),
    t('step_label_where'),
    t('step_label_contact'),
    t('step_label_review'),
  ];

  const handleSelectType = useCallback((type: 'lost' | 'found') => {
    haptics.success();
    setType(type);
    navigation.navigate('ReportPhoto', { type });
  }, [setType, navigation, haptics]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
      
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View style={{ flex: 1, paddingHorizontal: spacing.screenPadding }}>
          {/* Progress Stepper */}
          <ProgressStepper
            currentStep={1}
            totalSteps={6}
            labels={stepLabels}
          />

          {/* Header */}
          <AnimatedView entering={FadeInUp.delay(100).springify()}>
            <View style={{ marginBottom: spacing.sectionGap }}>
              <Text style={[typography.h1, { textAlign: 'center', marginBottom: spacing.sm }]}>
                {t('report_type_title')}
              </Text>
              <Text style={[typography.body, { textAlign: 'center', color: colors.text.secondary }]}>
                {t('report_intro_subtitle')}
              </Text>
            </View>
          </AnimatedView>

          {/* Type Cards */}
          <View style={{ flex: 1 }}>
            <TypeCard
              type="lost"
              icon="alert-circle-outline"
              title={t('report_type_lost')}
              description={t('report_type_lost_desc')}
              hint={t('report_type_lost_hint')}
              color={colors.error.main}
              bgColor={colors.error.light}
              onPress={() => handleSelectType('lost')}
              delay={200}
            />

            <TypeCard
              type="found"
              icon="hand-heart"
              title={t('report_type_found')}
              description={t('report_type_found_desc')}
              hint={t('report_type_found_hint')}
              color={colors.success.main}
              bgColor={colors.success.light}
              onPress={() => handleSelectType('found')}
              delay={300}
            />
          </View>

          {/* Help Text */}
          <AnimatedView entering={FadeInDown.delay(400).springify()}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: spacing.lg,
              }}
            >
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={layout.iconMd}
                color={colors.primary[500]}
              />
              <Text
                style={[
                  typography.caption,
                  { marginLeft: spacing.sm, color: colors.text.tertiary },
                ]}
              >
                {t('value_privacy_desc')}
              </Text>
            </View>
          </AnimatedView>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default ReportTypeSelectScreen;
