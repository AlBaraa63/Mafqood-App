/**
 * Profile Screen - Cyber-Luxe Edition
 * Modern profile & settings hub with glassmorphism
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  LinearGradient,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Button } from '../../components/common';
import { useTranslation } from '../../hooks';
import { useAuthStore, useLanguageStore } from '../../hooks/useStore';
import { ProfileStackParamList } from '../../types';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { resetDatabase } from '../../api';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

interface MenuItem {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  labelKey: string;
  onPress: () => void;
  rightContent?: React.ReactNode;
  iconColor?: string;
  iconBackground?: string;
  labelColor?: string;
  disabled?: boolean;
}

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user, isGuest, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const [isResetting, setIsResetting] = React.useState(false);
  
  const handleLogout = () => {
    Alert.alert(
      t('logout'),
      t('logout_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        { text: t('logout'), style: 'destructive', onPress: () => logout() },
      ]
    );
  };
  
  const handleLanguageToggle = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const handleResetAllData = () => {
    if (isResetting) return;

    Alert.alert(
      t('delete_all_data'),
      t('delete_all_data_confirm'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setIsResetting(true);
              const response = await resetDatabase();
              if (response.success) {
                Alert.alert(t('success'), response.data?.message || t('delete_all_data_success'));
              } else {
                Alert.alert(t('error_generic'), response.error || t('delete_all_data_error'));
              }
            } catch (error: any) {
              Alert.alert(t('error_generic'), error?.message || t('delete_all_data_error'));
            } finally {
              setIsResetting(false);
            }
          },
        },
      ]
    );
  };
  
  const menuItems: MenuItem[] = [
    {
      icon: 'pencil-outline',
      labelKey: 'edit_profile',
      onPress: () => navigation.navigate('EditProfile'),
      iconColor: colors.accent[500],
      iconBackground: `${colors.accent[500]}20`,
    },
    {
      icon: 'clipboard-text-outline',
      labelKey: 'my_reports',
      onPress: () => navigation.navigate('MyReports'),
      iconColor: colors.highlight[500],
      iconBackground: `${colors.highlight[500]}20`,
    },
    {
      icon: 'web',
      labelKey: 'about_app',
      onPress: () => navigation.navigate('About'),
      iconColor: colors.primary[400],
      iconBackground: `${colors.primary[400]}20`,
    },
    {
      icon: 'delete-forever-outline',
      labelKey: 'delete_all_data',
      onPress: handleResetAllData,
      iconColor: colors.error.main,
      iconBackground: colors.error.light,
      labelColor: colors.error.main,
      rightContent: isResetting ? <ActivityIndicator size="small" color={colors.error.main} /> : undefined,
      disabled: isResetting,
    },
  ];
  
  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.guestBackground}
        >
          <ScrollView contentContainerStyle={styles.guestContent}>
            <View style={styles.guestHeader}>
              <View style={styles.guestIconBox}>
                <MaterialCommunityIcons 
                  name="account-off-outline" 
                  size={48} 
                  color={colors.accent[500]} 
                />
              </View>
              <Text style={styles.guestTitle}>{t('guest_mode_limited')}</Text>
              <Text style={styles.guestSubtitle}>{t('guest_cannot_report')}</Text>
            </View>
            
            <Button
              title={t('create_account')}
              onPress={() => {}}
              fullWidth
            />
            
            <Button
              title={t('login')}
              onPress={() => {}}
              variant="outline"
              fullWidth
              style={styles.loginButton}
            />
            
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.guestLanguage, { borderColor: `${colors.accent[500]}40` }]}
            >
              <MaterialCommunityIcons 
                name="earth" 
                size={18} 
                color={colors.accent[500]} 
              />
              <Text style={styles.guestLanguageText}>{t('language')}</Text>
              <Text style={styles.guestLanguageValue}>
                {language === 'en' ? 'English' : 'العربية'}
              </Text>
            </LinearGradient>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header - Glassmorphic */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.profileCardGradient, shadows.lg]}
        >
          <View style={styles.profileCard}>
            <View style={styles.headerRow}>
              <View style={styles.avatarContainer}>
                {user?.avatarUrl ? (
                  <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
                ) : (
                  <LinearGradient
                    colors={[colors.accent[500], colors.accent[600]]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatarPlaceholder}
                  >
                    <Text style={styles.avatarInitial}>
                      {user?.fullName?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </LinearGradient>
                )}
              </View>
              <View style={styles.headerText}>
                <Text style={styles.userName}>{user?.fullName}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
                {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
              </View>
              <LinearGradient
                colors={['rgba(40, 179, 163, 0.3)', 'rgba(40, 179, 163, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.languagePill, { borderColor: `${colors.accent[500]}40` }]}
              >
                <MaterialCommunityIcons 
                  name="earth" 
                  size={16} 
                  color={colors.accent[500]} 
                />
                <Text style={styles.languageValue}>{language === 'en' ? 'EN' : 'AR'}</Text>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>
        
        {/* Menu Items - Glassmorphic */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.menuCardGradient, shadows.md]}
        >
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.labelKey}
                style={[
                  styles.menuItem,
                  index < menuItems.length - 1 && styles.menuItemBorder,
                  item.disabled && styles.menuItemDisabled,
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
                disabled={item.disabled}
              >
                <View
                  style={[
                    styles.menuIconBubble,
                    item.iconBackground ? { backgroundColor: item.iconBackground } : null,
                  ]}
                >
                  <MaterialCommunityIcons 
                    name={item.icon} 
                    size={18} 
                    color={item.iconColor || colors.accent[500]} 
                  />
                </View>
                <Text style={[
                  styles.menuLabel,
                  item.labelColor ? { color: item.labelColor } : null,
                ]}>
                  {t(item.labelKey)}
                </Text>
                {item.rightContent}
                <MaterialCommunityIcons 
                  name="chevron-right" 
                  size={18} 
                  color={colors.neutral[300]} 
                />
              </TouchableOpacity>
            ))}
            {/* Language toggle */}
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleLanguageToggle} 
              activeOpacity={0.7}
            >
              <View 
                style={[
                  styles.menuIconBubble, 
                  { backgroundColor: `${colors.accent[500]}20` }
                ]}
              >
                <MaterialCommunityIcons 
                  name="translate" 
                  size={18} 
                  color={colors.accent[500]} 
                />
              </View>
              <Text style={styles.menuLabel}>{t('language_settings')}</Text>
              <Text style={styles.languageValueInline}>
                {language === 'en' ? 'English' : 'العربية'}
              </Text>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={18} 
                color={colors.neutral[300]} 
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        {/* Logout Button */}
        <Button
          title={t('logout')}
          onPress={handleLogout}
          variant="outline"
          fullWidth
          style={styles.logoutButton}
          icon={<MaterialCommunityIcons name="logout" size={18} color={colors.highlight[500]} />}
        />
        
        {/* App Version */}
        <Text style={styles.version}>{t('app_name')} v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[500],
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  guestBackground: {
    flex: 1,
  },
  guestContent: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  guestHeader: {
    alignItems: 'center',
    gap: spacing.md,
  },
  guestIconBox: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  guestTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.neutral[100],
    textAlign: 'center',
  },
  loginButton: {
    marginTop: spacing.xs,
  },
  guestLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  guestLanguageText: {
    fontSize: typography.fontSize.md,
    color: colors.neutral.white,
  },
  guestLanguageValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent[500],
  },
  profileCardGradient: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  profileCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarContainer: {
    width: 72,
    height: 72,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[200],
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 30,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  userName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[200],
  },
  userPhone: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[300],
  },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  languageValue: {
    fontSize: typography.fontSize.xs,
    color: colors.accent[500],
    fontWeight: typography.fontWeight.semibold,
  },
  menuCardGradient: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  menuCard: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuItemDisabled: {
    opacity: 0.6,
  },
  menuIconBubble: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.neutral.white,
    fontWeight: typography.fontWeight.medium,
  },
  languageValueInline: {
    fontSize: typography.fontSize.sm,
    color: colors.accent[500],
    fontWeight: typography.fontWeight.semibold,
  },
  logoutButton: {
    borderColor: colors.highlight[500],
  },
  version: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.neutral[300],
    marginTop: spacing.xl,
  },
});

export default ProfileScreen;
