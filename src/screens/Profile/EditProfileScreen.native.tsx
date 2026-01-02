/**
 * Edit Profile Screen - Native Mobile Design
 * Modern profile editing with enhanced inputs and animations
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';

import { GlassCard, EnhancedButton, EnhancedInput } from '../../components/ui';
import { useDynamicStyles, useTranslation, useValidation, useHaptics } from '../../hooks';
import { useAuthStore } from '../../hooks/useStore';
import { ProfileStackParamList, User } from '../../types';
import api from '../../api';
import { colors } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;

// Avatar Initial Component
const AvatarInitial: React.FC<{ name: string; size: number }> = ({ name, size }) => {
  const { typography } = useDynamicStyles();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.9, { damping: 10 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.primary[100],
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: colors.primary[200],
          },
          animatedStyle,
        ]}
      >
        <Text
          style={[
            typography.hero,
            {
              color: colors.primary[600],
              fontSize: size * 0.4,
              fontWeight: '700',
            },
          ]}
        >
          {name.charAt(0).toUpperCase()}
        </Text>
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: size * 0.15,
            backgroundColor: colors.primary[500],
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: colors.background.primary,
          }}
        >
          <MaterialCommunityIcons name="camera" size={size * 0.15} color="white" />
        </View>
      </Animated.View>
    </Pressable>
  );
};

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { validateEmail, validatePhone, validateRequired } = useValidation();
  const { user, setUser } = useAuthStore();
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (payload: Partial<User>) => api.updateProfile(payload),
    onSuccess: (response) => {
      if (response.success && response.data) {
        haptics.success();
        setUser(response.data);
        Alert.alert(t('edit_profile_title'), t('profile_updated'));
        navigation.goBack();
      } else {
        haptics.error();
        Alert.alert(t('error_generic'), response.error || t('error_generic'));
      }
    },
    onError: () => {
      haptics.error();
      Alert.alert(t('error_generic'), t('error_generic'));
    },
  });

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const nameError = validateRequired(fullName);
    const emailError = validateEmail(email);
    const phoneError = phone ? validatePhone(phone) : null;

    if (nameError) newErrors.fullName = nameError;
    if (emailError) newErrors.email = emailError;
    if (phoneError) newErrors.phone = phoneError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fullName, email, phone, validateRequired, validateEmail, validatePhone]);

  const handleSave = useCallback(() => {
    haptics.light();
    if (!validate()) {
      haptics.error();
      return;
    }
    mutation.mutate({ fullName, email, phone });
  }, [haptics, validate, mutation, fullName, email, phone]);

  const handleCancel = useCallback(() => {
    haptics.light();
    navigation.goBack();
  }, [haptics, navigation]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.secondary} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: spacing.screenPadding,
            paddingTop: spacing.lg,
            paddingBottom: spacing['4xl'],
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar Section */}
          <Animated.View
            entering={ZoomIn.springify()}
            style={{ alignItems: 'center', marginBottom: spacing.xl }}
          >
            <AvatarInitial name={fullName || '?'} size={layout.avatarLg * 1.8} />
            <Text
              style={[
                typography.caption,
                { color: colors.text.secondary, marginTop: spacing.sm },
              ]}
            >
              {t('tap_to_change_photo')}
            </Text>
          </Animated.View>

          {/* Title Section */}
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <Text style={[typography.h2, { marginBottom: spacing.xs }]}>
              {t('edit_profile_title')}
            </Text>
            <Text style={[typography.body, { color: colors.text.secondary, marginBottom: spacing.xl }]}>
              {t('app_tagline')}
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassCard variant="elevated" style={{ marginBottom: spacing.lg }}>
              <View style={{ gap: spacing.md }}>
                <EnhancedInput
                  label={t('full_name')}
                  placeholder="Ahmed Al Maktoum"
                  value={fullName}
                  onChangeText={(text) => {
                    setFullName(text);
                    if (errors.fullName) setErrors({ ...errors, fullName: '' });
                  }}
                  error={errors.fullName}
                  leftIcon="account-outline"
                />

                <EnhancedInput
                  label={t('email')}
                  placeholder="email@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: '' });
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
                    if (errors.phone) setErrors({ ...errors, phone: '' });
                  }}
                  error={errors.phone}
                  keyboardType="phone-pad"
                  leftIcon="phone-outline"
                />
              </View>
            </GlassCard>
          </Animated.View>

          {/* Action Buttons */}
          <Animated.View
            entering={FadeInUp.delay(300).springify()}
            style={{ flexDirection: 'row', gap: spacing.md }}
          >
            <View style={{ flex: 1 }}>
              <EnhancedButton
                title={t('cancel')}
                onPress={handleCancel}
                variant="outline"
                size="large"
              />
            </View>
            <View style={{ flex: 1 }}>
              <EnhancedButton
                title={t('save')}
                onPress={handleSave}
                loading={mutation.isPending}
                variant="primary"
                size="large"
                icon="✓"
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;
