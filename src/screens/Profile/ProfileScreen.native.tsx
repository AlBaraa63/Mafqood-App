/**
 * Profile Screen - Native Mobile Design
 * Modern profile hub with animations, haptics, dynamic fonts
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StatusBar,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';

import { GlassCard, EnhancedButton } from '../../components/ui';
import { useDynamicStyles, useTranslation, useHaptics } from '../../hooks';
import { useAuthStore, useLanguageStore } from '../../hooks/useStore';
import { ProfileStackParamList } from '../../types';
import { colors, shadows } from '../../theme';
import { resetDatabase } from '../../api';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

interface MenuItem {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  labelKey?: string;
  labelText?: string;
  onPress: () => void;
  iconBg?: string;
  iconColor?: string;
}

// Menu Item Component
interface MenuItemCardProps {
  item: MenuItem;
  isLast: boolean;
  delay: number;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, isLast, delay }) => {
  const { typography, spacing, layout } = useDynamicStyles();
  const { t } = useTranslation();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
    haptics.light();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={item.onPress}>
        <Animated.View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              gap: spacing.md,
              borderBottomWidth: isLast ? 0 : 1,
              borderBottomColor: colors.neutral[100],
            },
            animatedStyle,
          ]}
        >
          <View
            style={{
              width: layout.avatarSm,
              height: layout.avatarSm,
              borderRadius: layout.avatarSm / 2,
              backgroundColor: item.iconBg || colors.primary[50],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name={item.icon}
              size={layout.iconMd}
              color={item.iconColor || colors.primary[600]}
            />
          </View>
          <Text style={[typography.body, { flex: 1 }]}>{item.labelText || (item.labelKey ? t(item.labelKey) : '')}</Text>
          <MaterialCommunityIcons
            name="chevron-right"
            size={layout.iconMd}
            color={colors.text.tertiary}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user, token, isGuest, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = useCallback(() => {
    haptics.warning();
    Alert.alert(t('logout'), t('logout_confirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: () => {
          haptics.success();
          logout();
        },
      },
    ]);
  }, [haptics, t, logout]);

  const handleLanguageToggle = useCallback(() => {
    haptics.selection();
    setLanguage(language === 'en' ? 'ar' : 'en');
  }, [haptics, language, setLanguage]);

  const handleDeleteData = useCallback(() => {
    if (isDeleting) return;
    Alert.alert(
      'Delete test data',
      'This will delete old test data from the server. Continue?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              haptics.warning();
              const result = await resetDatabase(token);
              if (result.success) {
                haptics.success();
                Alert.alert('Success', result.data?.message || 'Test data deleted.');
              } else {
                haptics.error();
                Alert.alert('Failed', result.error || 'Could not delete data.');
              }
            } catch (error: any) {
              haptics.error();
              Alert.alert('Error', error?.message || 'Could not delete data.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [haptics, isDeleting, t]);

  const menuItems: MenuItem[] = [
    {
      icon: 'pencil-outline',
      labelKey: 'edit_profile',
      onPress: () => {
        haptics.light();
        navigation.navigate('EditProfile');
      },
      iconBg: colors.primary[50],
      iconColor: colors.primary[600],
    },
    {
      icon: 'clipboard-text-outline',
      labelKey: 'my_reports',
      onPress: () => {
        haptics.light();
        navigation.navigate('MyReports');
      },
      iconBg: colors.accent[50],
      iconColor: colors.accent[600],
    },
    {
      icon: 'information-outline',
      labelKey: 'about_app',
      onPress: () => {
        haptics.light();
        navigation.navigate('About');
      },
      iconBg: colors.neutral[100],
      iconColor: colors.text.secondary,
    },
    {
      icon: 'trash-can-outline',
      labelText: 'Delete test data',
      onPress: handleDeleteData,
      iconBg: colors.error.light,
      iconColor: colors.error.main,
    },
  ];

  // Guest State
  if (isGuest) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
        <ScrollView
          contentContainerStyle={{
            flex: 1,
            padding: spacing.xl,
            justifyContent: 'center',
            gap: spacing.lg,
          }}
        >
          <Animated.View entering={ZoomIn.springify()} style={{ alignItems: 'center' }}>
            <View
              style={{
                width: layout.avatarLg * 1.5,
                height: layout.avatarLg * 1.5,
                borderRadius: layout.avatarLg,
                backgroundColor: colors.primary[50],
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons
                name="account-off-outline"
                size={layout.iconXl}
                color={colors.primary[500]}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(200).springify()} style={{ alignItems: 'center' }}>
            <Text style={[typography.h2, { textAlign: 'center' }]}>{t('guest_mode_limited')}</Text>
            <Text
              style={[
                typography.body,
                { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm },
              ]}
            >
              {t('guest_cannot_report')}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(300).springify()} style={{ gap: spacing.md }}>
            <EnhancedButton title={t('create_account')} onPress={() => {}} variant="primary" size="large" />
            <EnhancedButton title={t('login')} onPress={() => {}} variant="outline" size="large" />
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).springify()}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.sm,
                marginTop: spacing.lg,
              }}
              onPress={handleLanguageToggle}
            >
              <MaterialCommunityIcons name="earth" size={layout.iconMd} color={colors.text.secondary} />
              <Text style={[typography.body, { color: colors.text.primary }]}>{t('language')}</Text>
              <Text style={[typography.body, { color: colors.primary[500], fontWeight: '600' }]}>
                {language === 'en' ? 'English' : 'العربية'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.secondary} />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPadding,
          paddingTop: spacing.md,
          paddingBottom: spacing['4xl'],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <Animated.View entering={FadeInDown.springify()}>
          <GlassCard variant="elevated" style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              {/* Avatar */}
              <Animated.View entering={ZoomIn.delay(200).springify()}>
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={{
                      width: layout.avatarLg * 1.3,
                      height: layout.avatarLg * 1.3,
                      borderRadius: layout.avatarLg,
                      backgroundColor: colors.neutral[200],
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: layout.avatarLg * 1.3,
                      height: layout.avatarLg * 1.3,
                      borderRadius: layout.avatarLg,
                      backgroundColor: colors.primary[100],
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={[typography.hero, { color: colors.primary[600] }]}>
                      {user?.fullName?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
              </Animated.View>

              {/* User Info */}
              <View style={{ flex: 1 }}>
                <Text style={typography.h3}>{user?.fullName}</Text>
                <Text style={[typography.bodySmall, { color: colors.text.secondary, marginTop: spacing.xs }]}>
                  {user?.email}
                </Text>
                {user?.phone && (
                  <Text style={[typography.caption, { color: colors.text.tertiary, marginTop: spacing.xs }]}>
                    {user.phone}
                  </Text>
                )}
              </View>

              {/* Language Badge */}
              <TouchableOpacity
                onPress={handleLanguageToggle}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  backgroundColor: colors.accent[50],
                  paddingVertical: spacing.xs,
                  paddingHorizontal: spacing.sm,
                  borderRadius: layout.radiusFull,
                }}
              >
                <MaterialCommunityIcons name="earth" size={layout.iconSm} color={colors.accent[600]} />
                <Text style={[typography.labelSmall, { color: colors.accent[700] }]}>
                  {language === 'en' ? 'EN' : 'AR'}
                </Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Menu Items Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard variant="outlined" style={{ padding: 0, marginBottom: spacing.lg }}>
            {menuItems.map((item, index) => (
              <MenuItemCard
                key={item.labelKey}
                item={item}
                isLast={index === menuItems.length - 1}
                delay={150 + index * 50}
              />
            ))}

            {/* Language Toggle */}
            <MenuItemCard
              item={{
                icon: 'translate',
                labelKey: 'language_settings',
                onPress: handleLanguageToggle,
                iconBg: colors.highlight[50],
                iconColor: colors.highlight[600],
              }}
              isLast={true}
              delay={300}
            />
          </GlassCard>
        </Animated.View>

        {/* Logout Button */}
        <Animated.View entering={FadeInUp.delay(350).springify()}>
          <EnhancedButton
            title={t('logout')}
            onPress={handleLogout}
            variant="outline"
            size="large"
            icon="🚪"
            style={{ borderColor: colors.error.main }}
          />
        </Animated.View>

        {/* App Version */}
        <Animated.View entering={FadeIn.delay(400)}>
          <Text
            style={[
              typography.caption,
              { color: colors.text.tertiary, textAlign: 'center', marginTop: spacing.xl },
            ]}
          >
            {t('app_name')} v1.0.0
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
