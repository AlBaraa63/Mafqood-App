/**
 * Report When & Where Screen - Native Mobile Design
 * Step 4: Date, time and location information
 * Dynamic layout, enhanced inputs, haptics
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { ProgressStepper, EnhancedButton, EnhancedInput } from '../../components/ui';
import { useTranslation, useHaptics, useDynamicStyles } from '../../hooks';
import { useReportFormStore } from '../../hooks/useStore';
import { ReportStackParamList } from '../../types';
import { colors } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportWhenWhere'>;
type RouteProps = RouteProp<ReportStackParamList, 'ReportWhenWhere'>;

export const ReportWhenWhereScreen: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { type, imageUri, details } = route.params;
  const { formData, setFormData } = useReportFormStore();
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();

  // Format initial date for display
  const formatDateForInput = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString('en-AE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const [dateTime, setDateTime] = useState(
    formData.dateTime ? formatDateForInput(formData.dateTime) : formatDateForInput(new Date().toISOString())
  );
  const [location, setLocation] = useState(formData.location || '');
  const [locationDetail, setLocationDetail] = useState(formData.locationDetail || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isLost = type === 'lost';

  const stepLabels = [
    t('step_label_type'),
    t('step_label_photo'),
    t('step_label_details'),
    t('step_label_where'),
    t('step_label_contact'),
    t('step_label_review'),
  ];

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    if (!dateTime.trim()) newErrors.dateTime = t('required_field');
    if (!location.trim()) newErrors.location = t('required_field');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [dateTime, location, t]);

  const handleNext = useCallback(() => {
    if (!validate()) {
      haptics.error();
      return;
    }

    haptics.success();
    setFormData({
      dateTime: new Date().toISOString(),
      location,
      locationDetail,
    });

    navigation.navigate('ReportContact', {
      type,
      imageUri,
      details: {
        ...details,
        dateTime: new Date().toISOString(),
        location,
        locationDetail,
      },
    });
  }, [validate, haptics, setFormData, location, locationDetail, navigation, type, imageUri, details]);

  const handleBack = useCallback(() => {
    haptics.light();
    navigation.goBack();
  }, [navigation, haptics]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        {/* Fixed Progress Stepper */}
        <View 
          style={{ 
            backgroundColor: colors.background.primary,
            paddingHorizontal: spacing.screenPadding,
            paddingTop: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.neutral[200],
          }}
        >
          <ProgressStepper currentStep={4} totalSteps={6} labels={stepLabels} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              paddingHorizontal: spacing.screenPadding,
              paddingBottom: spacing.xl,
            }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >

            {/* Header */}
            <Animated.View entering={FadeIn.delay(100)}>
              <View style={{ marginBottom: spacing.lg }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: spacing.sm,
                  }}
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={layout.iconMd}
                    color={colors.primary[500]}
                  />
                  <Text style={[typography.labelSmall, { marginLeft: spacing.xs, color: colors.primary[500] }]}>
                    {t('step_label_where')}
                  </Text>
                </View>
                <Text style={[typography.h2, { marginBottom: spacing.xs }]}>
                  {t('report_when_where_title')}
                </Text>
                <Text style={[typography.body, { color: colors.text.secondary }]}>
                  {isLost ? t('report_when_where_lost_subtitle') : t('report_when_where_found_subtitle')}
                </Text>
              </View>
            </Animated.View>

            {/* Date & Time Input */}
            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <View style={{ marginBottom: spacing.md }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.accent[50],
                    padding: spacing.md,
                    borderRadius: layout.radiusMd,
                    marginBottom: spacing.md,
                  }}
                >
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={layout.iconMd}
                    color={colors.accent[600]}
                  />
                  <Text
                    style={[
                      typography.bodySmall,
                      { flex: 1, marginLeft: spacing.md, color: colors.text.secondary },
                    ]}
                  >
                    {isLost 
                      ? 'When did you last have this item?'
                      : 'When did you find this item?'
                    }
                  </Text>
                </View>
                <EnhancedInput
                  label={t('date_time')}
                  placeholder={t('select_date_time')}
                  value={dateTime}
                  onChangeText={setDateTime}
                  error={errors.dateTime}
                  leftIcon="calendar"
                />
              </View>
            </Animated.View>

            {/* Location / Area */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <View style={{ marginBottom: spacing.md }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.primary[50],
                    padding: spacing.md,
                    borderRadius: layout.radiusMd,
                    marginBottom: spacing.md,
                  }}
                >
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={layout.iconMd}
                    color={colors.primary[600]}
                  />
                  <Text
                    style={[
                      typography.bodySmall,
                      { flex: 1, marginLeft: spacing.md, color: colors.text.secondary },
                    ]}
                  >
                    {isLost 
                      ? 'Where do you think you lost it?'
                      : 'Where did you find it?'
                    }
                  </Text>
                </View>
                <EnhancedInput
                  label={t('location_area')}
                  placeholder={t('location_area_placeholder')}
                  value={location}
                  onChangeText={setLocation}
                  error={errors.location}
                  leftIcon="map-search-outline"
                />
              </View>
            </Animated.View>

            {/* Specific Location */}
            <Animated.View entering={FadeInDown.delay(250).springify()}>
              <EnhancedInput
                label={t('location_detail')}
                placeholder={t('location_detail_placeholder')}
                value={locationDetail}
                onChangeText={setLocationDetail}
                multiline
                numberOfLines={2}
                leftIcon="map-marker-plus-outline"
              />
            </Animated.View>
          </ScrollView>

          {/* Fixed Bottom Buttons */}
          <View
            style={{
              flexDirection: 'row',
              gap: spacing.md,
              paddingHorizontal: spacing.screenPadding,
              paddingVertical: spacing.md,
              backgroundColor: colors.background.primary,
              borderTopWidth: 1,
              borderTopColor: colors.neutral[100],
            }}
          >
            <EnhancedButton
              title={t('back')}
              onPress={handleBack}
              variant="outline"
              style={{ flex: 1 }}
            />
            <EnhancedButton
              title={t('next')}
              onPress={handleNext}
              variant="primary"
              style={{ flex: 2 }}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

export default ReportWhenWhereScreen;
