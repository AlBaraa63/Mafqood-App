/**
 * Profile Screen
 * Modern profile & settings hub
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

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

interface MenuItem {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  labelKey: string;
  onPress: () => void;
  rightContent?: React.ReactNode;
}

export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user, isGuest, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  
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
  
  const menuItems: MenuItem[] = [
    {
      icon: 'pencil-outline',
      labelKey: 'edit_profile',
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      icon: 'clipboard-text-outline',
      labelKey: 'my_reports',
      onPress: () => navigation.navigate('MyReports'),
    },
    {
      icon: 'web',
      labelKey: 'about_app',
      onPress: () => navigation.navigate('About'),
    },
  ];
  
  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.guestContent}>
          <View style={styles.guestHeader}>
            <MaterialCommunityIcons name="account-off-outline" size={48} color={colors.primary[500]} />
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
          
          <TouchableOpacity style={styles.guestLanguage} onPress={handleLanguageToggle}>
            <MaterialCommunityIcons name="earth" size={18} color={colors.text.secondary} />
            <Text style={styles.guestLanguageText}>{t('language')}</Text>
            <Text style={styles.guestLanguageValue}>
              {language === 'en' ? 'English' : 'العربية'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <Card style={styles.profileCard} variant="elevated">
          <View style={styles.headerRow}>
            <View style={styles.avatarContainer}>
              {user?.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {user?.fullName?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.headerText}>
              <Text style={styles.userName}>{user?.fullName}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
            </View>
            <View style={styles.languagePill}>
              <MaterialCommunityIcons name="earth" size={16} color={colors.accent[600]} />
              <Text style={styles.languageValue}>{language === 'en' ? 'EN' : 'AR'}</Text>
            </View>
          </View>
        </Card>
        
        {/* Menu Items */}
        <Card style={styles.menuCard} variant="outlined">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.labelKey}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconBubble}>
                <MaterialCommunityIcons name={item.icon} size={18} color={colors.primary[600]} />
              </View>
              <Text style={styles.menuLabel}>{t(item.labelKey)}</Text>
              {item.rightContent}
              <MaterialCommunityIcons name="chevron-right" size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
          {/* Language toggle */}
          <TouchableOpacity style={styles.menuItem} onPress={handleLanguageToggle} activeOpacity={0.8}>
            <View style={[styles.menuIconBubble, { backgroundColor: colors.accent[50] }]}>
              <MaterialCommunityIcons name="translate" size={18} color={colors.accent[600]} />
            </View>
            <Text style={styles.menuLabel}>{t('language_settings')}</Text>
            <Text style={styles.languageValueInline}>{language === 'en' ? 'English' : 'العربية'}</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        </Card>
        
        {/* Logout Button */}
        <Button
          title={t('logout')}
          onPress={handleLogout}
          variant="outline"
          fullWidth
          style={styles.logoutButton}
          icon={<MaterialCommunityIcons name="logout" size={18} color={colors.primary[500]} />}
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
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  guestContent: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  guestHeader: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  guestTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: spacing.xs,
  },
  guestLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  guestLanguageText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  guestLanguageValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary[500],
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
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 30,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  headerText: {
    flex: 1,
    gap: spacing.xs,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  userEmail: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  userPhone: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  languagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent[50],
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  languageValue: {
    fontSize: typography.fontSize.sm,
    color: colors.accent[700],
    fontWeight: typography.fontWeight.semibold,
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
    borderBottomColor: colors.neutral[200],
  },
  menuIconBubble: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  languageValueInline: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
    fontWeight: typography.fontWeight.medium,
  },
  logoutButton: {
    borderColor: colors.error.main,
  },
  version: {
    textAlign: 'center',
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xl,
  },
});

export default ProfileScreen;
