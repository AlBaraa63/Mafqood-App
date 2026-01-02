/**
 * Register Screen - Native Mobile Design
 * Modern registration with animations and enhanced inputs
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  StatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeInUp,
  FadeIn,
  ZoomIn,
} from 'react-native-reanimated';

import { AuthStackParamList } from '../../types';
import { GlassCard, EnhancedButton, EnhancedInput } from '../../components/ui';
import { useDynamicStyles, useTranslation, useValidation, useHaptics } from '../../hooks';
import { useAuthStore } from '../../hooks/useStore';
import { colors } from '../../theme';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

interface Props {
  navigation: RegisterScreenNavigationProp;
}

// Animated Checkbox Component
const AnimatedCheckbox: React.FC<{
  checked: boolean;
  label: string;
  onPress: () => void;
}> = ({ checked, label, onPress }) => {
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    haptics.selection();
    scale.value = withSpring(0.9, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.sm,
          },
          animatedStyle,
        ]}
      >
        <View
          style={{
            width: layout.iconMd * 1.2,
            height: layout.iconMd * 1.2,
            borderRadius: layout.radiusSm,
            borderWidth: 2,
            borderColor: checked ? colors.primary[500] : colors.neutral[300],
            backgroundColor: checked ? colors.primary[500] : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {checked && (
            <MaterialCommunityIcons name="check" size={layout.iconSm} color="white" />
          )}
        </View>
        <Text style={[typography.body, { color: colors.text.primary }]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const {
    validateEmail,
    validatePassword,
    validatePhone,
    validateRequired,
    validatePasswordMatch,
  } = useValidation();
  const { register, isLoading } = useAuthStore();
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isVenue, setIsVenue] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((): boolean => {
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
  }, [
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    validateRequired,
    validateEmail,
    validatePhone,
    validatePassword,
    validatePasswordMatch,
  ]);

  const handleRegister = useCallback(async () => {
    haptics.light();
    if (!validate()) {
      haptics.error();
      return;
    }

    const success = await register({
      fullName,
      email,
      phone,
      password,
      isVenue,
    });

    if (!success) {
      haptics.error();
      Alert.alert(t('error_generic'), t('error_generic'));
    } else {
      haptics.success();
    }
  }, [haptics, validate, register, fullName, email, phone, password, isVenue, t]);

  const handleBack = useCallback(() => {
    haptics.light();
    navigation.goBack();
  }, [haptics, navigation]);

  const handleLogin = useCallback(() => {
    haptics.light();
    navigation.navigate('Login');
  }, [haptics, navigation]);

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.secondary} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.screenPadding,
            paddingTop: spacing.md,
            paddingBottom: spacing['4xl'],
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.springify()}>
            <TouchableOpacity
              onPress={handleBack}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
                marginBottom: spacing.lg,
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

            <Text style={[typography.h1, { marginBottom: spacing.xs }]}>
              {t('create_account')}
            </Text>
            <Text
              style={[typography.body, { color: colors.text.secondary, marginBottom: spacing.xl }]}
            >
              {t('app_tagline')}
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View entering={FadeInUp.delay(100).springify()}>
            <GlassCard variant="elevated" style={{ marginBottom: spacing.lg }}>
              <View style={{ gap: spacing.md }}>
                <EnhancedInput
                  label={t('full_name')}
                  placeholder="Ahmed Al Maktoum"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    clearError('fullName');
                  }}
                  error={errors.fullName}
                  autoCapitalize="words"
                  leftIcon="account-outline"
                />

                <EnhancedInput
                  label={t('email')}
                  placeholder="email@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    clearError('email');
                  }}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="email-outline"
                />

                <EnhancedInput
                  label={t('phone_number')}
                  placeholder="+971 50 123 4567"
                  value={phone}
                  onChangeText={(text) => {
                    setPhone(text);
                    clearError('phone');
                  }}
                  error={errors.phone}
                  keyboardType="phone-pad"
                  leftIcon="phone-outline"
                />

                <EnhancedInput
                  label={t('password')}
                  placeholder="••••••••"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    clearError('password');
                  }}
                  error={errors.password}
                  secureTextEntry={!showPassword}
                  helperText={t('password_too_short')}
                  leftIcon="lock-outline"
                  rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  onRightIconPress={() => {
                    haptics.light();
                    setShowPassword(!showPassword);
                  }}
                />

                <EnhancedInput
                  label={t('confirm_password')}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    clearError('confirmPassword');
                  }}
                  error={errors.confirmPassword}
                  secureTextEntry={!showPassword}
                  leftIcon="lock-check-outline"
                />

                <AnimatedCheckbox
                  checked={isVenue}
                  label={t('i_am_venue')}
                  onPress={() => setIsVenue(!isVenue)}
                />
              </View>
            </GlassCard>
          </Animated.View>

          {/* Register Button */}
          <Animated.View entering={FadeInUp.delay(200).springify()}>
            <EnhancedButton
              title={t('create_account')}
              onPress={handleRegister}
              loading={isLoading}
              variant="primary"
              size="large"
              icon="→"
            />
          </Animated.View>

          {/* Login Link */}
          <Animated.View
            entering={FadeIn.delay(300)}
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: spacing.xs,
              marginTop: spacing.xl,
            }}
          >
            <Text style={[typography.body, { color: colors.text.secondary }]}>
              {t('already_have_account')}
            </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={[typography.body, { fontWeight: '600', color: colors.primary[500] }]}>
                {t('sign_in')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
