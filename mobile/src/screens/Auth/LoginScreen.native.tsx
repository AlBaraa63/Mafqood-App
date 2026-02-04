/**
 * Login Screen - Native Mobile Design
 * Modern authentication with animations and haptics
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
  withSequence,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';

import { AuthStackParamList } from '../../types';
import { GlassCard, EnhancedButton, EnhancedInput } from '../../components/ui';
import { useDynamicStyles, useTranslation, useValidation, useHaptics } from '../../hooks';
import { useAuthStore } from '../../hooks/useStore';
import { colors } from '../../theme';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

// Logo Component with bounce animation
const AnimatedLogo: React.FC<{ size: number }> = ({ size }) => {
  const scale = useSharedValue(1);
  const haptics = useHaptics();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    haptics.light();
    scale.value = withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 10 })
    );
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        entering={ZoomIn.springify()}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primary[50],
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: colors.primary[100],
          },
          animatedStyle,
        ]}
      >
        <Text style={{ fontSize: size * 0.5 }}>🔍</Text>
      </Animated.View>
    </Pressable>
  );
};

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const { validateEmail, validatePassword } = useValidation();
  const { login, loginAsGuest, isLoading } = useAuthStore();
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [email, password, validateEmail, validatePassword]);

  const handleLogin = useCallback(async () => {
    haptics.light();
    if (!validate()) {
      haptics.error();
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      haptics.error();
      Alert.alert(
        t('login_failed') || 'Login Failed',
        result.error || t('error_generic') || 'Invalid email or password. Please try again.'
      );
    } else {
      haptics.success();
    }
  }, [haptics, validate, login, email, password, t]);

  const handleGuestLogin = useCallback(() => {
    haptics.medium();
    loginAsGuest();
  }, [haptics, loginAsGuest]);

  const handleForgotPassword = useCallback(() => {
    haptics.light();
    navigation.navigate('ForgotPassword');
  }, [haptics, navigation]);

  const handleRegister = useCallback(() => {
    haptics.light();
    navigation.navigate('Register');
  }, [haptics, navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            padding: spacing.xl,
            justifyContent: 'center',
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: spacing['3xl'] }}>
            <AnimatedLogo size={layout.avatarLg * 1.8} />

            <Animated.View entering={FadeInDown.delay(150).springify()}>
              <Text
                style={[
                  typography.hero,
                  { color: colors.primary[500], marginTop: spacing.lg },
                ]}
              >
                {t('app_name')}
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <Text
                style={[
                  typography.body,
                  { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm },
                ]}
              >
                {t('app_tagline')}
              </Text>
            </Animated.View>
          </View>

          {/* Form Card */}
          <Animated.View entering={FadeInUp.delay(250).springify()}>
            <GlassCard variant="elevated" style={{ marginBottom: spacing.xl }}>
              <View style={{ gap: spacing.md }}>
                <EnhancedInput
                  label={t('email')}
                  placeholder="email@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  error={errors.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="email-outline"
                />

                <View>
                  <EnhancedInput
                    label={t('password')}
                    placeholder="••••••••"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    error={errors.password}
                    secureTextEntry={!showPassword}
                    leftIcon="lock-outline"
                    rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    onRightIconPress={() => {
                      haptics.light();
                      setShowPassword(!showPassword);
                    }}
                  />

                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    style={{ alignSelf: 'flex-end', marginTop: spacing.xs }}
                  >
                    <Text style={[typography.labelSmall, { color: colors.primary[500] }]}>
                      {t('forgot_password')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Buttons */}
          <Animated.View entering={FadeInUp.delay(300).springify()} style={{ gap: spacing.md }}>
            <EnhancedButton
              title={t('login')}
              onPress={handleLogin}
              loading={isLoading}
              variant="primary"
              size="large"
              icon="→"
            />

            <EnhancedButton
              title={t('continue_as_guest')}
              onPress={handleGuestLogin}
              variant="ghost"
              size="large"
              icon="👤"
            />
          </Animated.View>

          {/* Register Link */}
          <Animated.View
            entering={FadeIn.delay(400)}
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: spacing.xs,
              marginTop: spacing.xl,
            }}
          >
            <Text style={[typography.body, { color: colors.text.secondary }]}>
              {t('dont_have_account')}
            </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={[typography.body, { fontWeight: '600', color: colors.primary[500] }]}>
                {t('create_account')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
