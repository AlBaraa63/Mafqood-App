/**
 * Report Contact Screen - Native Mobile Design
 * Step 5: Contact preferences and terms acceptance
 * Native contact selection, dynamic inputs, haptics
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

import { GlassCard, ProgressStepper, EnhancedButton, EnhancedInput } from '../../components/ui';
import { useTranslation, useHaptics, useDynamicStyles } from '../../hooks';
import { useReportFormStore, useAuthStore } from '../../hooks/useStore';
import { ReportStackParamList, ContactMethod, ItemFormData } from '../../types';
import { colors, shadows } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportContact'>;
type RouteProps = RouteProp<ReportStackParamList, 'ReportContact'>;

interface ContactOption {
  value: ContactMethod;
  labelKey: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  description: string;
}

const contactOptions: ContactOption[] = [
  {
    value: 'phone',
    labelKey: 'contact_phone',
    icon: 'phone-outline',
    color: colors.success.main,
    description: 'Get calls or SMS',
  },
  {
    value: 'email',
    labelKey: 'contact_email',
    icon: 'email-outline',
    color: colors.primary[500],
    description: 'Receive email updates',
  },
  {
    value: 'in_app',
    labelKey: 'contact_in_app',
    icon: 'message-outline',
    color: colors.accent[500],
    description: 'Chat within the app',
  },
];

interface ContactOptionCardProps {
  option: ContactOption;
  isSelected: boolean;
  onPress: () => void;
  delay: number;
}

const ContactOptionCard: React.FC<ContactOptionCardProps> = ({
  option,
  isSelected,
  onPress,
  delay,
}) => {
  const { t } = useTranslation();
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    haptics.selection();
    onPress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: isSelected ? option.color : colors.neutral[200],
              borderRadius: layout.radiusLg,
              padding: spacing.md,
              backgroundColor: isSelected ? option.color + '10' : colors.neutral.white,
              marginBottom: spacing.sm,
            },
            animatedStyle,
          ]}
        >
          <View
            style={{
              width: layout.avatarMd,
              height: layout.avatarMd,
              borderRadius: layout.avatarMd / 2,
              backgroundColor: option.color + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: spacing.md,
            }}
          >
            <MaterialCommunityIcons
              name={option.icon}
              size={layout.iconLg}
              color={option.color}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.label, { color: colors.text.primary }]}>
              {t(option.labelKey)}
            </Text>
            <Text style={[typography.caption, { color: colors.text.tertiary }]}>
              {option.description}
            </Text>
          </View>
          {isSelected && (
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: option.color,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons
                name="check"
                size={16}
                color={colors.neutral.white}
              />
            </View>
          )}
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const ReportContactScreen: React.FC = () => {
  const { t, isRTL } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { type, imageUri, details } = route.params;
  const { formData, setFormData } = useReportFormStore();
  const { user } = useAuthStore();
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();

  const [contactMethod, setContactMethod] = useState<ContactMethod>(formData.contactMethod || 'in_app');
  const [phone, setPhone] = useState(formData.contactPhone || user?.phone || '');
  const [email, setEmail] = useState(formData.contactEmail || user?.email || '');
  const [termsAccepted, setTermsAccepted] = useState(formData.termsAccepted || false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (contactMethod === 'phone' && !phone.trim()) {
      newErrors.phone = t('required_field');
    }
    if (contactMethod === 'email' && !email.trim()) {
      newErrors.email = t('required_field');
    }
    if (!termsAccepted) {
      newErrors.terms = t('required_field');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [contactMethod, phone, email, termsAccepted, t]);

  const handleNext = useCallback(() => {
    if (!validate()) {
      haptics.error();
      return;
    }

    haptics.success();
    const updatedFormData: ItemFormData = {
      type,
      imageUri,
      imageConfirmed: true,
      category: details.category,
      title: details.title || '',
      description: details.description || '',
      brand: details.brand,
      color: details.color,
      dateTime: details.dateTime || new Date().toISOString(),
      location: details.location || '',
      locationDetail: details.locationDetail || '',
      contactMethod,
      contactPhone: phone,
      contactEmail: email,
      termsAccepted,
    };

    setFormData({
      contactMethod,
      contactPhone: phone,
      contactEmail: email,
      termsAccepted,
    });

    navigation.navigate('ReportReview', { formData: updatedFormData });
  }, [validate, haptics, type, imageUri, details, contactMethod, phone, email, termsAccepted, setFormData, navigation]);

  const handleBack = useCallback(() => {
    haptics.light();
    navigation.goBack();
  }, [navigation, haptics]);

  const toggleTerms = useCallback(() => {
    haptics.selection();
    setTermsAccepted(!termsAccepted);
  }, [termsAccepted, haptics]);

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
          <ProgressStepper currentStep={5} totalSteps={6} labels={stepLabels} />
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
                    name="account-circle-outline"
                    size={layout.iconMd}
                    color={colors.primary[500]}
                  />
                  <Text style={[typography.labelSmall, { marginLeft: spacing.xs, color: colors.primary[500] }]}>
                    {t('step_label_contact')}
                  </Text>
                </View>
                <Text style={[typography.h2, { marginBottom: spacing.xs }]}>
                  {t('report_contact_title')}
                </Text>
                <Text style={[typography.body, { color: colors.text.secondary }]}>
                  {t('report_contact_subtitle')}
                </Text>
              </View>
            </Animated.View>

            {/* Contact Method Selector */}
            <View style={{ marginBottom: spacing.lg }}>
              <Text style={[typography.label, { marginBottom: spacing.md }]}>
                {t('preferred_contact')}
                <Text style={{ color: colors.error.main }}> *</Text>
              </Text>
              {contactOptions.map((option, index) => (
                <ContactOptionCard
                  key={option.value}
                  option={option}
                  isSelected={contactMethod === option.value}
                  onPress={() => setContactMethod(option.value)}
                  delay={150 + index * 50}
                />
              ))}
            </View>

            {/* Phone Input */}
            {(contactMethod === 'phone' || phone) && (
              <Animated.View entering={FadeInDown.springify()}>
                <EnhancedInput
                  label={t('your_phone')}
                  placeholder="+971 50 XXX XXXX"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  error={errors.phone}
                  leftIcon="phone-outline"
                />
              </Animated.View>
            )}

            {/* Email Input */}
            {(contactMethod === 'email' || email) && (
              <Animated.View entering={FadeInDown.springify()}>
                <EnhancedInput
                  label={t('your_email')}
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email}
                  leftIcon="email-outline"
                />
              </Animated.View>
            )}

            {/* Privacy Assurance */}
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.primary[50],
                  padding: spacing.md,
                  borderRadius: layout.radiusMd,
                  marginBottom: spacing.lg,
                }}
              >
                <MaterialCommunityIcons
                  name="shield-lock-outline"
                  size={layout.iconLg}
                  color={colors.primary[500]}
                />
                <Text
                  style={[
                    typography.bodySmall,
                    { flex: 1, marginLeft: spacing.md, color: colors.text.secondary },
                  ]}
                >
                  {t('privacy_assurance')}
                </Text>
              </View>
            </Animated.View>

            {/* Terms Checkbox */}
            <Animated.View entering={FadeInDown.delay(350).springify()}>
              <TouchableOpacity
                onPress={toggleTerms}
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  marginBottom: spacing.sm,
                }}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: layout.radiusSm,
                    borderWidth: 2,
                    borderColor: errors.terms
                      ? colors.error.main
                      : termsAccepted
                      ? colors.primary[500]
                      : colors.neutral[300],
                    backgroundColor: termsAccepted ? colors.primary[500] : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: spacing.md,
                    marginTop: 2,
                  }}
                >
                  {termsAccepted && (
                    <MaterialCommunityIcons
                      name="check"
                      size={16}
                      color={colors.neutral.white}
                    />
                  )}
                </View>
                <Text style={[typography.body, { flex: 1 }]}>
                  {t('terms_checkbox')}
                </Text>
              </TouchableOpacity>
              {errors.terms && (
                <Text style={[typography.caption, { color: colors.error.main, marginLeft: 40 }]}>
                  {errors.terms}
                </Text>
              )}
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

export default ReportContactScreen;
