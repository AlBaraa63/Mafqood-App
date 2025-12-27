/**
 * Notifications Screen - Cyber-Luxe Edition
 * Displays user notifications with filtering and mark as read functionality
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  LinearGradient,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, shadows } from '../../theme';
import { Loading, EmptyState } from '../../components/common';
import { useTranslation, useFormatDate } from '../../hooks';
import { MainTabParamList } from '../../types';

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

export const NotificationsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { formatRelative } = useFormatDate();
  const navigation = useNavigation<NativeStackNavigationProp<MainTabParamList>>();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await api.getNotifications();
      // setNotifications(response.data);
      
      // Mock data for demonstration
      setTimeout(() => {
        setNotifications([]);
        setIsLoading(false);
        setIsRefreshing(false);
      }, 500);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadNotifications();
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // TODO: Replace with actual API call
      // await api.markNotificationAsRead(notificationId);
      
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // TODO: Replace with actual API call
      // await api.markAllNotificationsAsRead();
      
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }

    // Navigate based on notification type
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
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'match':
        return { name: 'target' as const, color: colors.accent[500] };
      case 'message':
        return { name: 'message' as const, color: colors.primary[400] };
      case 'update':
        return { name: 'update' as const, color: colors.highlight[500] };
      case 'system':
        return { name: 'information' as const, color: colors.neutral[300] };
    }
  };

  const filteredNotifications = notifications.filter((notif) =>
    filter === 'all' ? true : !notif.read
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <LinearGradient
        colors={
          !item.read
            ? ['rgba(40, 179, 163, 0.15)', 'rgba(40, 179, 163, 0.05)']
            : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.notificationCardGradient,
          !item.read && { borderColor: `${colors.accent[500]}40` },
        ]}
      >
        <TouchableOpacity
          style={styles.notificationCard}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
          <View 
            style={[
              styles.iconContainer, 
              { backgroundColor: `${icon.color}25` }
            ]}
          >
            <MaterialCommunityIcons name={icon.name} size={24} color={icon.color} />
          </View>

          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <Text style={styles.title} numberOfLines={1}>
                {item.title}
              </Text>
              {!item.read && <View style={styles.unreadDot} />}
            </View>

            <Text style={styles.message} numberOfLines={2}>
              {item.message}
            </Text>

            <Text style={styles.timestamp}>{formatRelative(item.timestamp)}</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Loading text={t('loading')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary[500], colors.primary[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContainer}>
          <Text style={styles.screenTitle}>{t('notifications')}</Text>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllButton}
              onPress={markAllAsRead}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons 
                name="check-all" 
                size={16} 
                color={colors.accent[500]} 
              />
              <Text style={styles.markAllText}>{t('mark_all_read')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Filter Tabs - Glassmorphic */}
      <View style={styles.filterContainer}>
        <LinearGradient
          colors={
            filter === 'all'
              ? [colors.accent[500], colors.accent[600]]
              : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.filterTabGradient,
            {
              borderColor:
                filter === 'all'
                  ? colors.accent[500]
                  : 'rgba(255, 255, 255, 0.2)',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.filterTab}
            onPress={() => setFilter('all')}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.filterText,
                filter === 'all' && styles.activeFilterText,
              ]}
            >
              {t('all')} ({notifications.length})
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient
          colors={
            filter === 'unread'
              ? [colors.highlight[500], colors.highlight[600]]
              : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.filterTabGradient,
            {
              borderColor:
                filter === 'unread'
                  ? colors.highlight[500]
                  : 'rgba(255, 255, 255, 0.2)',
            },
          ]}
        >
          <TouchableOpacity
            style={styles.filterTab}
            onPress={() => setFilter('unread')}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.filterText,
                filter === 'unread' && styles.activeFilterText,
              ]}
            >
              {t('unread')} ({unreadCount})
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.accent[500]]}
            tintColor={colors.accent[500]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🔔"
            title={filter === 'all' ? t('no_notifications') : t('no_unread_notifications')}
            description={t('notifications_empty_desc')}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[500],
  },
  headerGradient: {
    paddingBottom: spacing.lg,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  screenTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  markAllText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent[500],
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  filterTabGradient: {
    flex: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  filterTab: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[300],
  },
  activeFilterText: {
    color: colors.neutral.white,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
    flexGrow: 1,
  },
  notificationCardGradient: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  notificationCard: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral.white,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent[500],
    marginLeft: spacing.sm,
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.neutral[200],
    marginBottom: spacing.xs,
    lineHeight: typography.fontSize.sm * 1.5,
    textAlign: 'left',
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.neutral[300],
  },
});
