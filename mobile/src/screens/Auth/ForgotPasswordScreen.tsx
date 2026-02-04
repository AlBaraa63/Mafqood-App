/**
 * Forgot Password Screen
 * Password reset request
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types';
import { Button, Input } from '../../components/common';
import { useTranslation, useValidation } from '../../hooks';
import api from '../../api';
import { colors, typography, spacing } from '../../theme';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { validateEmail } = useValidation();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleSubmit = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    setError(undefined);
    setIsLoading(true);
    
    try {
      const response = await api.forgotPassword(email);
      setIsLoading(false);
      setIsSubmitted(true);
    } catch (err) {
      setIsLoading(false);
      Alert.alert(t('error_generic'), t('error_generic'));
    }
  };
  
  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.successIcon}>📧</Text>
          <Text style={styles.successTitle}>{t('reset_password')}</Text>
          <Text style={styles.successMessage}>{t('reset_email_sent')}</Text>
          
          <Button
            title={t('back_to_login')}
            onPress={() => navigation.navigate('Login')}
            fullWidth
            style={styles.button}
          />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.icon}>🔐</Text>
            <Text style={styles.title}>{t('forgot_password_title')}</Text>
            <Text style={styles.description}>{t('forgot_password_desc')}</Text>
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            <Input
              label={t('email')}
              placeholder="email@example.com"
              value={email}
              onChangeText={setEmail}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <Button
              title={t('send_reset_link')}
              onPress={handleSubmit}
              loading={isLoading}
              fullWidth
            />
          </View>
          
          {/* Back to Login */}
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.backLinkText}>{t('back_to_login')}</Text>
          </TouchableOpacity>
        </View>
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
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  backIcon: {
    fontSize: 24,
    color: colors.text.primary,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: spacing.xl,
  },
  backLink: {
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
  },
  successIcon: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successMessage: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing['2xl'],
  },
  button: {
    marginTop: spacing.lg,
  },
});

export default ForgotPasswordScreen;
