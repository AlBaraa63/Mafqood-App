/**
 * Forgot Password Screen - Native Mobile Design
 * Modern password reset with animations and haptics
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';

import { AuthStackParamList } from '../../types';
import { GlassCard, EnhancedButton, EnhancedInput } from '../../components/ui';
import { useDynamicStyles, useTranslation, useValidation, useHaptics } from '../../hooks';
import api from '../../api';
import { colors } from '../../theme';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

interface Props {
  navigation: ForgotPasswordScreenNavigationProp;
}

export const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { validateEmail } = useValidation();
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = useCallback(async () => {
    haptics.light();
    const emailError = validateEmail(email);
    if (emailError) {
      haptics.error();
      setError(emailError);
      return;
    }

    setError(undefined);
    setIsLoading(true);

    try {
      await api.forgotPassword(email);
      haptics.success();
      setIsLoading(false);
      setIsSubmitted(true);
    } catch (err) {
      haptics.error();
      setIsLoading(false);
      Alert.alert(t('error_generic'), t('error_generic'));
    }
  }, [haptics, validateEmail, email, t]);

  const handleBack = useCallback(() => {
    haptics.light();
    navigation.goBack();
  }, [haptics, navigation]);

  const handleBackToLogin = useCallback(() => {
    haptics.light();
    navigation.navigate('Login');
  }, [haptics, navigation]);

  // Success State
  if (isSubmitted) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

        <View
          style={{
            flex: 1,
            padding: spacing.xl,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Success Icon */}
          <Animated.View entering={ZoomIn.springify()}>
            <View
              style={{
                width: layout.avatarLg * 2,
                height: layout.avatarLg * 2,
                borderRadius: layout.avatarLg,
                backgroundColor: colors.success.light,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xl,
              }}
            >
              <Text style={{ fontSize: layout.iconXl * 1.5 }}>📧</Text>
            </View>
          </Animated.View>

          {/* Success Message */}
          <Animated.View entering={FadeInUp.delay(150).springify()}>
            <Text
              style={[typography.h2, { textAlign: 'center', marginBottom: spacing.sm }]}
            >
              {t('reset_password')}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).springify()}>
            <Text
              style={[
                typography.body,
                {
                  textAlign: 'center',
                  color: colors.text.secondary,
                  marginBottom: spacing['2xl'],
                  lineHeight: 22,
                },
              ]}
            >
              {t('reset_email_sent')}
            </Text>
          </Animated.View>

          {/* Back to Login Button */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={{ width: '100%' }}>
            <EnhancedButton
              title={t('back_to_login')}
              onPress={handleBackToLogin}
              variant="primary"
              size="large"
              icon="←"
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            padding: spacing.xl,
            justifyContent: 'center',
          }}
        >
          {/* Back Button */}
          <Animated.View entering={FadeIn}>
            <TouchableOpacity
              onPress={handleBack}
              style={{
                position: 'absolute',
                top: -spacing['3xl'] * 2,
                left: 0,
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={layout.iconMd}
                color={colors.text.primary}
              />
              <Text style={[typography.body, { color: colors.text.primary }]}>
                {t('back')}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Icon */}
          <Animated.View entering={ZoomIn.springify()} style={{ alignItems: 'center' }}>
            <View
              style={{
                width: layout.avatarLg * 1.8,
                height: layout.avatarLg * 1.8,
                borderRadius: layout.avatarLg,
                backgroundColor: colors.primary[50],
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: spacing.xl,
              }}
            >
              <Text style={{ fontSize: layout.iconXl * 1.2 }}>🔐</Text>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text
              style={[typography.h2, { textAlign: 'center', marginBottom: spacing.sm }]}
            >
              {t('forgot_password_title')}
            </Text>
            <Text
              style={[
                typography.body,
                {
                  textAlign: 'center',
                  color: colors.text.secondary,
                  marginBottom: spacing.xl,
                  lineHeight: 22,
                },
              ]}
            >
              {t('forgot_password_desc')}
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View entering={FadeInUp.delay(200).springify()}>
            <GlassCard variant="elevated" style={{ marginBottom: spacing.lg }}>
              <EnhancedInput
                label={t('email')}
                placeholder="email@example.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError(undefined);
                }}
                error={error}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="email-outline"
              />
            </GlassCard>
          </Animated.View>

          {/* Submit Button */}
          <Animated.View entering={FadeInUp.delay(300).springify()}>
            <EnhancedButton
              title={t('send_reset_link')}
              onPress={handleSubmit}
              loading={isLoading}
              variant="primary"
              size="large"
              icon="→"
            />
          </Animated.View>

          {/* Back to Login Link */}
          <Animated.View entering={FadeIn.delay(400)} style={{ marginTop: spacing.xl }}>
            <TouchableOpacity onPress={handleBackToLogin} style={{ alignItems: 'center' }}>
              <Text
                style={[
                  typography.body,
                  { fontWeight: '600', color: colors.primary[500] },
                ]}
              >
                {t('back_to_login')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;
