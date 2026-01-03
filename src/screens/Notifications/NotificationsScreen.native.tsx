/**
 * Notifications Screen - Native Mobile Design
 * Animated notifications with haptics, swipe actions, dynamic fonts
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
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
  withTiming,
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOut,
  Layout,
  SlideOutRight,
} from 'react-native-reanimated';

import { GlassCard } from '../../components/ui';
import { Loading, EmptyState } from '../../components/common';
import { useDynamicStyles, useTranslation, useFormatDate, useHaptics } from '../../hooks';
import { MainTabParamList } from '../../types';
import { colors, shadows } from '../../theme';

type NotificationType = 'match' | 'message' | 'update' | 'system';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionId?: string;
}

// Filter Tab Button
interface FilterTabProps {
  label: string;
  count: number;
  isActive: boolean;
  onPress: () => void;
}

const FilterTab: React.FC<FilterTabProps> = ({ label, count, isActive, onPress }) => {
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    haptics.selection();
    onPress();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          {
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderRadius: layout.radiusFull,
            backgroundColor: isActive ? colors.primary[500] : 'transparent',
          },
          animatedStyle,
        ]}
      >
        <Text
          style={[
            typography.labelSmall,
            { color: isActive ? colors.neutral.white : colors.text.secondary },
          ]}
        >
          {label} ({count})
        </Text>
      </Animated.View>
    </Pressable>
  );
};

// Notification Card Component
interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  delay: number;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onPress, delay }) => {
  const { typography, spacing, layout } = useDynamicStyles();
  const { formatRelative } = useFormatDate();
  const haptics = useHaptics();
  const scale = useSharedValue(1);

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'match':
        return { name: 'target' as const, color: colors.accent[500], bg: colors.accent[50] };
      case 'message':
        return { name: 'message' as const, color: colors.primary[500], bg: colors.primary[50] };
      case 'update':
        return { name: 'update' as const, color: colors.highlight[500], bg: colors.highlight[50] };
      case 'system':
        return { name: 'information' as const, color: colors.text.secondary, bg: colors.neutral[100] };
    }
  };

  const icon = getNotificationIcon(notification.type);

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
    <Animated.View
      entering={FadeInRight.delay(delay).springify()}
      exiting={SlideOutRight}
      layout={Layout.springify()}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <Animated.View style={animatedStyle}>
          <GlassCard
            variant={notification.read ? 'outlined' : 'elevated'}
            style={{
              marginBottom: spacing.sm,
              borderLeftWidth: notification.read ? 0 : 3,
              borderLeftColor: icon.color,
            }}
          >
            <View style={{ flexDirection: 'row', gap: spacing.md }}>
              {/* Icon */}
              <View
                style={{
                  width: layout.avatarMd,
                  height: layout.avatarMd,
                  borderRadius: layout.avatarMd / 2,
                  backgroundColor: icon.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name={icon.name} size={layout.iconMd} color={icon.color} />
              </View>

              {/* Content */}
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
                  <Text
                    style={[
                      typography.bodySmall,
                      { fontWeight: notification.read ? '400' : '600', flex: 1 },
                    ]}
                    numberOfLines={1}
                  >
                    {notification.title}
                  </Text>
                  {!notification.read && (
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: colors.primary[500],
                      }}
                    />
                  )}
                </View>

                <Text
                  style={[
                    typography.caption,
                    { color: colors.text.secondary, marginTop: spacing.xs },
                  ]}
                  numberOfLines={2}
                >
                  {notification.message}
                </Text>

                <Text
                  style={[
                    typography.caption,
                    { color: colors.text.tertiary, marginTop: spacing.sm },
                  ]}
                >
                  {formatRelative(notification.timestamp)}
                </Text>
              </View>

              {/* Chevron */}
              <MaterialCommunityIcons
                name="chevron-right"
                size={layout.iconMd}
                color={colors.text.tertiary}
                style={{ alignSelf: 'center' }}
              />
            </View>
          </GlassCard>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

export const NotificationsScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<MainTabParamList>>();
  const { typography, spacing, layout } = useDynamicStyles();
  const haptics = useHaptics();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      // Import getNotifications from api
      const { getNotifications } = await import('../../api');
      const response = await getNotifications();
      
      if (response.success && response.data) {
        setNotifications(response.data);
      } else {
        setNotifications([]);
      }
      
      setIsLoading(false);
      setIsRefreshing(false);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = useCallback(() => {
    haptics.light();
    setIsRefreshing(true);
    loadNotifications();
  }, [loadNotifications, haptics]);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    haptics.success();
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  }, [haptics]);

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      haptics.light();
      if (!notification.read) {
        markAsRead(notification.id);
      }

      if (notification.actionId) {
        switch (notification.type) {
          case 'match':
            navigation.navigate('MatchesTab');
            break;
          case 'update':
            navigation.navigate('ProfileTab');
            break;
          default:
            break;
        }
      }
    },
    [haptics, markAsRead, navigation]
  );

  const filteredNotifications = notifications.filter((notif) =>
    filter === 'all' ? true : !notif.read
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Loading State
  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background.primary }}
        edges={['top']}
      >
        <StatusBar barStyle="dark-content" backgroundColor={colors.background.primary} />
        <View style={{ paddingHorizontal: spacing.screenPadding, paddingTop: spacing.md }}>
          <Text style={typography.h1}>{t('notifications')}</Text>
        </View>
        <Loading text={t('loading')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background.secondary} />

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.background.primary,
          paddingHorizontal: spacing.screenPadding,
          paddingTop: spacing.md,
          paddingBottom: spacing.md,
        }}
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={typography.h1}>{t('notifications')}</Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={markAllAsRead}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
              }}
            >
              <Text style={[typography.labelSmall, { color: colors.primary[500] }]}>
                {t('mark_all_read')}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Filter Tabs */}
        <Animated.View
          entering={FadeInDown.delay(100).springify()}
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            marginTop: spacing.md,
            backgroundColor: colors.neutral[100],
            borderRadius: layout.radiusFull,
            padding: spacing.xs,
          }}
        >
          <FilterTab
            label={t('all')}
            count={notifications.length}
            isActive={filter === 'all'}
            onPress={() => setFilter('all')}
          />
          <FilterTab
            label={t('unread')}
            count={unreadCount}
            isActive={filter === 'unread'}
            onPress={() => setFilter('unread')}
          />
        </Animated.View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={({ item, index }) => (
          <NotificationCard
            notification={item}
            onPress={() => handleNotificationPress(item)}
            delay={index * 50}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: spacing.screenPadding,
          paddingTop: spacing.md,
          paddingBottom: spacing['4xl'],
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.accent[500]]}
            tintColor={colors.accent[500]}
          />
        }
        ListEmptyComponent={
          <Animated.View entering={FadeIn.delay(200)} style={{ paddingTop: spacing['2xl'] }}>
            <View style={{ alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="bell-off-outline"
                size={64}
                color={colors.text.tertiary}
              />
              <Text style={[typography.h3, { marginTop: spacing.lg, textAlign: 'center' }]}>
                {filter === 'all' ? t('no_notifications') : t('no_unread_notifications')}
              </Text>
              <Text
                style={[
                  typography.body,
                  { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.sm },
                ]}
              >
                {t('notifications_empty_desc')}
              </Text>
            </View>
          </Animated.View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;
