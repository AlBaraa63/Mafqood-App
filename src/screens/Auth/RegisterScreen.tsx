/**
 * Register Screen
 * New user registration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Button, Input, Card } from '../../components/common';
import { useTranslation, useValidation } from '../../hooks';
import { useAuthStore } from '../../hooks/useStore';
import { colors, typography, spacing, borderRadius } from '../../theme';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { validateEmail, validatePassword, validatePhone, validateRequired, validatePasswordMatch } = useValidation();
  const { register, isLoading } = useAuthStore();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVenue, setIsVenue] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    const nameError = validateRequired(fullName);
    if (nameError) newErrors.fullName = nameError;
    
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;
    
    const phoneError = validatePhone(phone);
    if (phoneError) newErrors.phone = phoneError;
    
    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;
    
    const confirmError = validatePasswordMatch(password, confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleRegister = async () => {
    if (!validate()) return;
    
    const success = await register({
      fullName,
      email,
      phone,
      password,
      isVenue,
    });
    
    if (!success) {
      Alert.alert(t('error_generic'), t('error_generic'));
    }
    // On success, navigation will be handled by the root navigator (auto-login)
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{t('create_account')}</Text>
            <Text style={styles.subtitle}>{t('app_tagline')}</Text>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            <Input
              label={t('full_name')}
              placeholder="Ahmed Al Maktoum"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              autoCapitalize="words"
              required
            />
            
            <Input
              label={t('email')}
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />
            
            <Input
              label={t('phone_number')}
              placeholder="+971 50 123 4567"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
              keyboardType="phone-pad"
              required
            />
            
            <Input
              label={t('password')}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
              hint={t('password_too_short')}
              required
            />
            
            <Input
              label={t('confirm_password')}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              secureTextEntry
              required
            />
            
            {/* Venue Checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsVenue(!isVenue)}
            >
              <View style={[styles.checkbox, isVenue && styles.checkboxChecked]}>
                {isVenue && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>{t('i_am_venue')}</Text>
            </TouchableOpacity>
            
            <Button
              title={t('create_account')}
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
            />
          </View>
          
          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('already_have_account')}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>{t('sign_in')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  header: {
    marginBottom: spacing['2xl'],
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'left',
  },
  form: {
    marginBottom: spacing['2xl'],
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkmark: {
    color: colors.neutral.white,
    fontWeight: typography.fontWeight.bold,
    fontSize: 14,
  },
  checkboxLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  footerLink: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[500],
  },
});

export default RegisterScreen;
