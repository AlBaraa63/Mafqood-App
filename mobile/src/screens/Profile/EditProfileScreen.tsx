/**
 * Edit Profile Screen
 * Allows users to update their basic contact information
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { Button, Input } from '../../components/common';
import { useTranslation, useValidation } from '../../hooks';
import { useAuthStore } from '../../hooks/useStore';
import { ProfileStackParamList, User } from '../../types';
import api from '../../api';
import { colors, typography, spacing } from '../../theme';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { validateEmail, validatePhone, validateRequired } = useValidation();
  const { user, setUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (payload: Partial<User>) => api.updateProfile(payload),
    onSuccess: (response) => {
      if (response.success && response.data) {
        setUser(response.data);
        Alert.alert(t('edit_profile_title'), t('profile_updated'));
        navigation.goBack();
      } else {
        Alert.alert(t('error_generic'), response.error || t('error_generic'));
      }
    },
    onError: () => {
      Alert.alert(t('error_generic'), t('error_generic'));
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const nameError = validateRequired(fullName);
    const emailError = validateEmail(email);
    const phoneError = phone ? validatePhone(phone) : null;

    if (nameError) newErrors.fullName = nameError;
    if (emailError) newErrors.email = emailError;
    if (phoneError) newErrors.phone = phoneError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    mutation.mutate({ fullName, email, phone });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{t('edit_profile_title')}</Text>
        <Text style={styles.subtitle}>{t('app_tagline')}</Text>

        <Input
          label={t('full_name')}
          placeholder="Ahmed Al Maktoum"
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
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
        />

        <View style={styles.actions}>
          <Button
            title={t('cancel')}
            variant="outline"
            onPress={() => navigation.goBack()}
            style={styles.actionButton}
          />
          <Button
            title={t('save')}
            onPress={handleSave}
            loading={mutation.isPending}
            style={styles.actionButton}
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
  content: {
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing['2xl'],
    textAlign: 'left',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionButton: {
    flex: 1,
  },
});

export default EditProfileScreen;
