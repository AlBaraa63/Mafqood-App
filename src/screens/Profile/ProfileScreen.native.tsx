/**
 * Profile Screen - Native Mobile Design
 * Enhanced with platform-specific patterns, SectionList, stats, and native polish
 */

import React, { useCallback, useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  StatusBar,
  Platform,
  TouchableHighlight,
  TouchableOpacity,
  SectionList,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
} from 'react-native-reanimated';

import { EnhancedButton } from '../../components/ui';
import { useDynamicStyles, useTranslation, useHaptics } from '../../hooks';
import { useAuthStore, useLanguageStore } from '../../hooks/useStore';
import { ProfileStackParamList } from '../../types';
import { resetDatabase, getUserStats, getNotifications } from '../../api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isIOS = Platform.OS === 'ios';

// Color palette
const colors = {
  primary: { 50: '#E0F2F7', 100: '#B3D9E8', 500: '#0B5FA8', 600: '#094E8A' },
  accent: { 50: '#FEF8F0', 600: '#B8905A', 700: '#9C7B40' },
  secondary: { 50: '#F0F4F8', 600: '#4A6FA5' },
  highlight: { 50: '#E0F9F7', 600: '#00B8B3' },
  error: { light: '#FFE8E8', main: '#DC2626' },
  warning: { light: '#FFF8E8', main: '#F59E0B' },
  info: { light: '#E8F4FF', main: '#3B82F6' },
  success: { light: '#E8F8E8', main: '#10B981' },
  white: '#FFFFFF',
  neutral: { 50: '#FAFAFA', 100: '#F3F4F6', 200: '#E5E7EB', 300: '#D1D5DB' },
  background: { primary: '#FFFFFF', secondary: '#F9FAFB' },
  text: { primary: '#111827', secondary: '#6B7280', tertiary: '#9CA3AF' },
};

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

// ============================================================================
// Platform-specific Icon Component
// ============================================================================
interface PlatformIconProps {
  iosName: keyof typeof Ionicons.glyphMap;
  androidName: keyof typeof MaterialCommunityIcons.glyphMap;
  size: number;
  color: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ iosName, androidName, size, color }) => {
  return isIOS ? (
    <Ionicons name={iosName} size={size} color={color} />
  ) : (
    <MaterialCommunityIcons name={androidName} size={size} color={color} />
  );
};

// ============================================================================
// Stats Summary Component
// ============================================================================
interface StatItemProps {
  value: string | number;
  label: string;
  delay?: number;
}

const StatItem: React.FC<StatItemProps> = ({ value, label, delay = 0 }) => {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).springify()}
      style={styles.statItem}
    >
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

const StatDivider: React.FC = () => (
  <View style={styles.statDivider} />
);

interface StatsSummaryProps {
  stats: {
    reports: number;
    matches: number;
    successRate: number;
    memberSince: string;
  };
}

const StatsSummary: React.FC<StatsSummaryProps> = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.statsCard}>
      <StatItem value={stats.reports} label={t('total_reports') || 'Reports'} delay={200} />
      <StatDivider />
      <StatItem value={stats.matches} label={t('matches') || 'Matches'} delay={250} />
      <StatDivider />
      <StatItem value={`${stats.successRate}%`} label={t('success_rate') || 'Success'} delay={300} />
      <StatDivider />
      <StatItem value={stats.memberSince} label={t('member_since') || 'Since'} delay={350} />
    </Animated.View>
  );
};

// ============================================================================
// Menu Item Types
// ============================================================================
interface MenuItem {
  id: string;
  iosIcon: keyof typeof Ionicons.glyphMap;
  androidIcon: keyof typeof MaterialCommunityIcons.glyphMap;
  labelKey?: string;
  labelText?: string;
  onPress: () => void;
  iconBg: string;
  iconColor: string;
  destructive?: boolean;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
}

interface MenuSection {
  title: string;
  data: MenuItem[];
}

// ============================================================================
// Native Menu Item Component
// ============================================================================
interface MenuItemRowProps {
  item: MenuItem;
  isFirst: boolean;
  isLast: boolean;
  index: number;
}

const MenuItemRow: React.FC<MenuItemRowProps> = ({ item, isFirst, isLast, index }) => {
  const { layout } = useDynamicStyles();
  const { t } = useTranslation();
  const haptics = useHaptics();

  const handlePress = useCallback(() => {
    haptics.light();
    item.onPress();
  }, [haptics, item]);

  const Wrapper = isIOS ? TouchableHighlight : TouchableOpacity;
  const wrapperProps = isIOS
    ? { underlayColor: colors.neutral[100], onPress: handlePress }
    : { onPress: handlePress, activeOpacity: 0.7 };

  const content = (
    <View
      style={[
        styles.menuItemContent,
        isFirst && styles.menuItemFirst,
        isLast && styles.menuItemLast,
        !isLast && styles.menuItemBorder,
      ]}
    >
      {/* Icon Container */}
      <View
        style={[
          styles.menuIconContainer,
          { backgroundColor: item.iconBg },
        ]}
      >
        <PlatformIcon
          iosName={item.iosIcon}
          androidName={item.androidIcon}
          size={layout.iconMd}
          color={item.iconColor}
        />
      </View>

      {/* Label */}
      <Text
        style={[
          styles.menuItemLabel,
          item.destructive && styles.menuItemLabelDestructive,
        ]}
      >
        {item.labelText || (item.labelKey ? t(item.labelKey) : '')}
      </Text>

      {/* Right Element or Chevron */}
      {item.rightElement ? (
        item.rightElement
      ) : item.showChevron !== false ? (
        <PlatformIcon
          iosName="chevron-forward"
          androidName="chevron-right"
          size={20}
          color={colors.text.tertiary}
        />
      ) : null}
    </View>
  );

  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 30).springify()}>
      <Wrapper {...(wrapperProps as any)}>{content}</Wrapper>
    </Animated.View>
  );
};

// ============================================================================
// Section Header Component
// ============================================================================
interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionHeaderText}>{title}</Text>
  </View>
);

// ============================================================================
// Profile Header Component
// ============================================================================
interface ProfileHeaderProps {
  user: any;
  onAvatarPress?: () => void;
  onLanguageToggle: () => void;
  language: string;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onAvatarPress,
  onLanguageToggle,
  language,
}) => {
  const haptics = useHaptics();

  const handleAvatarPress = useCallback(() => {
    haptics.light();
    onAvatarPress?.();
  }, [haptics, onAvatarPress]);

  const Touchable = isIOS ? TouchableHighlight : TouchableOpacity;

  return (
    <Animated.View entering={FadeInDown.springify()} style={styles.headerCard}>
      <View style={styles.headerContent}>
        {/* Avatar */}
        <Touchable
          onPress={handleAvatarPress}
          {...(isIOS ? { underlayColor: colors.neutral[50] } : { activeOpacity: 0.8 })}
          style={styles.avatarTouchable}
        >
          <Animated.View entering={ZoomIn.delay(200).springify()}>
            {user?.avatarUrl ? (
              <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {user?.fullName?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
            )}
            {/* Edit Badge */}
            <View style={styles.editBadge}>
              <PlatformIcon
                iosName="pencil"
                androidName="pencil"
                size={12}
                color={colors.white}
              />
            </View>
          </Animated.View>
        </Touchable>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{user?.fullName}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
          {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
        </View>

        {/* Language Badge */}
        <TouchableOpacity
          onPress={onLanguageToggle}
          style={styles.languageBadge}
          activeOpacity={0.7}
        >
          <PlatformIcon
            iosName="globe-outline"
            androidName="earth"
            size={16}
            color={colors.accent[600]}
          />
          <Text style={styles.languageText}>{language === 'en' ? 'EN' : 'AR'}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

// ============================================================================
// Main Profile Screen Component
// ============================================================================
export const ProfileScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user, token, isGuest, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'auto'>('auto');
  const [userStats, setUserStats] = useState({
    reports: 0,
    matches: 0,
    successRate: 0,
    memberSince: new Date().getFullYear().toString(),
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Load user stats from backend
  const loadUserStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      const response = await getUserStats();
      if (response.success && response.data) {
        setUserStats(response.data);
      }
    } catch (error) {
      console.error('Failed to load user stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Load stats on mount
  useEffect(() => {
    if (!isGuest) {
      loadUserStats();
    }
  }, [isGuest, loadUserStats]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    haptics.light();
    // Reload user stats
    await loadUserStats();
    setRefreshing(false);
    haptics.success();
  }, [haptics, loadUserStats]);

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
      t('delete_test_data') || 'Delete test data',
      t('delete_test_data_confirm') || 'This will delete old test data from the server. Continue?',
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete') || 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              haptics.warning();
              const result = await resetDatabase(token);
              if (result.success) {
                haptics.success();
                Alert.alert(t('success') || 'Success', result.data?.message || 'Test data deleted.');
              } else {
                haptics.error();
                Alert.alert(t('failed') || 'Failed', result.error || 'Could not delete data.');
              }
            } catch (error: any) {
              haptics.error();
              Alert.alert(t('error') || 'Error', error?.message || 'Could not delete data.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  }, [haptics, isDeleting, t, token]);

  // Menu sections with platform-specific icons
  const menuSections: MenuSection[] = useMemo(() => [
    {
      title: t('profile_settings') || 'PROFILE',
      data: [
        {
          id: 'edit',
          iosIcon: 'person-circle-outline',
          androidIcon: 'account-edit-outline',
          labelKey: 'edit_profile',
          onPress: () => {
            haptics.light();
            navigation.navigate('EditProfile');
          },
          iconBg: colors.primary[50],
          iconColor: colors.primary[600],
        },
        {
          id: 'reports',
          iosIcon: 'document-text-outline',
          androidIcon: 'clipboard-text-outline',
          labelKey: 'my_reports',
          onPress: () => {
            haptics.light();
            navigation.navigate('MyReports');
          },
          iconBg: colors.accent[50],
          iconColor: colors.accent[600],
        },
      ],
    },
    {
      title: t('app_settings') || 'SETTINGS',
      data: [
        {
          id: 'language',
          iosIcon: 'globe-outline',
          androidIcon: 'translate',
          labelKey: 'language',
          onPress: handleLanguageToggle,
          iconBg: colors.highlight[50],
          iconColor: colors.highlight[600],
          showChevron: false,
          rightElement: (
            <View style={styles.languageToggle}>
              <Text style={styles.languageToggleText}>
                {language === 'en' ? 'English' : 'العربية'}
              </Text>
              <PlatformIcon
                iosName="chevron-expand"
                androidName="swap-horizontal"
                size={16}
                color={colors.text.tertiary}
              />
            </View>
          ),
        },
        {
          id: 'theme',
          iosIcon: 'moon-outline',
          androidIcon: 'theme-light-dark',
          labelKey: 'theme',
          onPress: () => {
            haptics.selection();
            const modes: ('light' | 'dark' | 'auto')[] = ['light', 'dark', 'auto'];
            const nextIndex = (modes.indexOf(themeMode) + 1) % modes.length;
            setThemeMode(modes[nextIndex]);
          },
          iconBg: colors.secondary[50],
          iconColor: colors.secondary[600],
          showChevron: false,
          rightElement: (
            <View style={styles.themeToggle}>
              <Text style={styles.themeToggleText}>
                {themeMode === 'light' ? '☀️ Light' : themeMode === 'dark' ? '🌙 Dark' : '🔄 Auto'}
              </Text>
            </View>
          ),
        },
        {
          id: 'notifications',
          iosIcon: 'notifications-outline',
          androidIcon: 'bell-outline',
          labelKey: 'notifications',
          onPress: () => {
            haptics.light();
            // Navigate to notifications tab
            navigation.getParent()?.navigate('Notifications' as never);
          },
          iconBg: colors.warning.light,
          iconColor: colors.warning.main,
        },
      ],
    },
    {
      title: t('about') || 'ABOUT',
      data: [
        {
          id: 'about',
          iosIcon: 'information-circle-outline',
          androidIcon: 'information-outline',
          labelKey: 'about_app',
          onPress: () => {
            haptics.light();
            navigation.navigate('About');
          },
          iconBg: colors.neutral[100],
          iconColor: colors.text.secondary,
        },
        {
          id: 'help',
          iosIcon: 'help-circle-outline',
          androidIcon: 'help-circle-outline',
          labelKey: 'help_support',
          onPress: () => {
            haptics.light();
            // Open help modal with contact options
            Alert.alert(
              t('help_support') || 'Help & Support',
              'Contact us:\n\nEmail: support@mafqood.ae\nPhone: +971 4 123 4567\n\nOr visit our website for FAQ and guides.',
              [
                { text: t('cancel'), style: 'cancel' },
                { 
                  text: 'Email Support',
                  onPress: () => {
                    // In real app: Linking.openURL('mailto:support@mafqood.ae')
                  }
                },
              ]
            );
          },
          iconBg: colors.info.light,
          iconColor: colors.info.main,
        },
        {
          id: 'delete_data',
          iosIcon: 'trash-outline',
          androidIcon: 'trash-can-outline',
          labelText: t('delete_test_data') || 'Delete test data',
          onPress: handleDeleteData,
          iconBg: colors.error.light,
          iconColor: colors.error.main,
          destructive: true,
        },
      ],
    },
  ], [t, haptics, navigation, language, themeMode, handleLanguageToggle, handleDeleteData]);

  // Guest State
  if (isGuest) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
        <SectionList
          sections={[]}
          ListHeaderComponent={() => (
            <View style={styles.guestContainer}>
              <Animated.View entering={ZoomIn.springify()} style={styles.guestIconContainer}>
                <View style={styles.guestIconCircle}>
                  <PlatformIcon
                    iosName="person-outline"
                    androidName="account-off-outline"
                    size={64}
                    color={colors.primary[500]}
                  />
                </View>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.guestTextContainer}>
                <Text style={styles.guestTitle}>{t('guest_mode_limited')}</Text>
                <Text style={styles.guestSubtitle}>{t('guest_cannot_report')}</Text>
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.guestButtons}>
                <EnhancedButton
                  title={t('create_account')}
                  onPress={() => {}}
                  variant="primary"
                  size="large"
                />
                <EnhancedButton
                  title={t('login')}
                  onPress={() => {}}
                  variant="outline"
                  size="large"
                />
              </Animated.View>

              <Animated.View entering={FadeInUp.delay(400).springify()}>
                <TouchableOpacity
                  style={styles.guestLanguageButton}
                  onPress={handleLanguageToggle}
                  activeOpacity={0.7}
                >
                  <PlatformIcon
                    iosName="globe-outline"
                    androidName="earth"
                    size={20}
                    color={colors.text.secondary}
                  />
                  <Text style={styles.guestLanguageLabel}>{t('language')}</Text>
                  <Text style={styles.guestLanguageValue}>
                    {language === 'en' ? 'English' : 'العربية'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
          renderItem={() => null}
          keyExtractor={() => 'guest'}
          contentContainerStyle={styles.guestContent}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.containerSecondary} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.secondary} />

      {/* Large Title Header */}
      <Animated.View entering={FadeIn.springify()} style={styles.largeTitleContainer}>
        <Text style={styles.largeTitle}>{t('profile')}</Text>
      </Animated.View>

      <SectionList
        sections={menuSections}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={() => (
          <>
            {/* Profile Header Card */}
            <ProfileHeader
              user={user}
              onAvatarPress={() => navigation.navigate('EditProfile')}
              onLanguageToggle={handleLanguageToggle}
              language={language}
            />

            {/* Stats Summary */}
            <StatsSummary stats={userStats} />
          </>
        )}
        renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
        renderItem={({ item, index, section }) => (
          <MenuItemRow
            item={item}
            isFirst={index === 0}
            isLast={index === section.data.length - 1}
            index={index}
          />
        )}
        stickySectionHeadersEnabled={false}
        ListFooterComponent={() => (
          <View style={styles.footer}>
            {/* Logout Button */}
            <Animated.View entering={FadeInUp.delay(400).springify()}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <PlatformIcon
                  iosName="log-out-outline"
                  androidName="logout"
                  size={20}
                  color={colors.error.main}
                />
                <Text style={styles.logoutText}>{t('logout')}</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* App Version */}
            <Animated.View entering={FadeIn.delay(500)}>
              <Text style={styles.versionText}>{t('app_name')} v1.0.0</Text>
            </Animated.View>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary[500]}
            colors={[colors.primary[500]]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

// ============================================================================
// StyleSheet
// ============================================================================
const styles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  containerSecondary: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Large Title Header
  largeTitleContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 0.4,
  },

  // Profile Header Card
  headerCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatarTouchable: {
    borderRadius: 999,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[200],
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary[600],
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
  },
  userEmail: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accent[50],
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent[700],
  },

  // Stats Summary
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.neutral[200],
  },

  // Section Header
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Menu Items
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemFirst: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  menuItemLast: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  menuItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.neutral[200],
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  menuItemLabelDestructive: {
    color: colors.error.main,
  },

  // Language Toggle
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  languageToggleText: {
    fontSize: 15,
    color: colors.text.secondary,
  },

  // Theme Toggle
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeToggleText: {
    fontSize: 15,
    color: colors.text.secondary,
  },

  // Footer
  footer: {
    marginTop: 32,
    gap: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.error.light,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.error.main + '40',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error.main,
  },
  versionText: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: 'center',
  },

  // Guest State
  guestContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  guestContent: {
    flexGrow: 1,
  },
  guestIconContainer: {
    alignItems: 'center',
  },
  guestIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestTextContainer: {
    alignItems: 'center',
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  guestButtons: {
    width: '100%',
    gap: 12,
  },
  guestLanguageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guestLanguageLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  guestLanguageValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[500],
  },
});

export default ProfileScreen;
