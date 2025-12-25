/**
 * Report Contact Screen
 * Step 5: Contact preferences and terms acceptance
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Input, Stepper } from '../../components/common';
import { useTranslation } from '../../hooks';
import { useReportFormStore, useAuthStore } from '../../hooks/useStore';
import { ReportStackParamList, ContactMethod, ItemFormData } from '../../types';
import { colors, typography, spacing, borderRadius } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ReportStackParamList, 'ReportContact'>;
type RouteProps = RouteProp<ReportStackParamList, 'ReportContact'>;

interface ContactOption {
  value: ContactMethod;
  labelKey: string;
  icon: string;
}

const contactOptions: ContactOption[] = [
  { value: 'phone', labelKey: 'contact_phone', icon: '📞' },
  { value: 'email', labelKey: 'contact_email', icon: '📧' },
  { value: 'in_app', labelKey: 'contact_in_app', icon: '💬' },
];

export const ReportContactScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { type, imageUri, details } = route.params;
  const { formData, setFormData } = useReportFormStore();
  const { user } = useAuthStore();
  
  const [contactMethod, setContactMethod] = useState<ContactMethod>(formData.contactMethod || 'in_app');
  const [phone, setPhone] = useState(formData.contactPhone || user?.phone || '');
  const [email, setEmail] = useState(formData.contactEmail || user?.email || '');
  const [termsAccepted, setTermsAccepted] = useState(formData.termsAccepted || false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (): boolean => {
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
  };
  
  const handleNext = () => {
    if (!validate()) return;
    
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
    
    navigation.navigate('ReportReview', {
      formData: updatedFormData,
    });
  };
  
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Stepper currentStep={5} totalSteps={6} />
        
        <View style={styles.header}>
          <Text style={styles.title}>{t('report_contact_title')}</Text>
          <Text style={styles.subtitle}>{t('report_contact_subtitle')}</Text>
        </View>
        
        {/* Contact Method Selector */}
        <View style={styles.field}>
          <Text style={styles.label}>
            {t('preferred_contact')}
            <Text style={styles.required}> *</Text>
          </Text>
          <View style={styles.contactOptions}>
            {contactOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.contactOption,
                  contactMethod === option.value && styles.contactOptionSelected,
                ]}
                onPress={() => setContactMethod(option.value)}
              >
                <Text style={styles.contactOptionIcon}>{option.icon}</Text>
                <Text style={[
                  styles.contactOptionText,
                  contactMethod === option.value && styles.contactOptionTextSelected,
                ]}>
                  {t(option.labelKey)}
                </Text>
                {contactMethod === option.value && (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkMark}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Phone Input */}
        {(contactMethod === 'phone' || phone) && (
          <Input
            label={t('your_phone')}
            placeholder="+971 50 XXX XXXX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={errors.phone}
            required={contactMethod === 'phone'}
          />
        )}
        
        {/* Email Input */}
        {(contactMethod === 'email' || email) && (
          <Input
            label={t('your_email')}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
            required={contactMethod === 'email'}
          />
        )}
        
        {/* Privacy Assurance */}
        <View style={styles.privacyNote}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>{t('privacy_assurance')}</Text>
        </View>
        
        {/* Terms Checkbox */}
        <TouchableOpacity
          style={styles.termsContainer}
          onPress={() => setTermsAccepted(!termsAccepted)}
        >
          <View style={[
            styles.checkbox,
            termsAccepted && styles.checkboxChecked,
            errors.terms && styles.checkboxError,
          ]}>
            {termsAccepted && <Text style={styles.checkboxMark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>{t('terms_checkbox')}</Text>
        </TouchableOpacity>
        {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
        
        {/* Navigation Buttons */}
        <View style={styles.footer}>
          <Button
            title={t('back')}
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            title={t('next')}
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error.main,
  },
  contactOptions: {
    gap: spacing.sm,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    backgroundColor: colors.neutral.white,
  },
  contactOptionSelected: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  contactOptionIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  contactOptionText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  contactOptionTextSelected: {
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkMark: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.info.light,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  privacyIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  privacyText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.info.dark,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.neutral[400],
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkboxError: {
    borderColor: colors.error.main,
  },
  checkboxMark: {
    color: colors.neutral.white,
    fontSize: 14,
    fontWeight: typography.fontWeight.bold,
  },
  termsText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error.main,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});

export default ReportContactScreen;
