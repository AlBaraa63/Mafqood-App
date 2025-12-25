/**
 * Header Component
 * Displays user profile picture and notification icon
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows, typography } from '../../theme';

type HeaderSize = 'small' | 'medium' | 'large';

interface HeaderProps {
  /**
   * User's avatar URL
   */
  avatarUrl?: string;
  /**
   * User's full name (used as fallback when avatar is not available)
   */
  userName?: string;
  /**
   * Whether there are unread notifications
   */
  hasUnreadNotifications?: boolean;
  /**
   * Number of unread notifications (optional badge)
   */
  notificationCount?: number;
  /**
   * Size variant for the header
   */
  size?: HeaderSize;
  /**
   * Maximum notification count to display before showing '99+'
   */
  maxNotificationDisplay?: number;
  /**
   * Custom background color
   */
  backgroundColor?: string;
  /**
   * Custom container style
   */
  style?: ViewStyle;
  /**
   * Callback when profile picture is pressed
   */
  onProfilePress?: () => void;
  /**
   * Callback when notification icon is pressed
   */
  onNotificationPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  avatarUrl,
  userName = 'User',
  hasUnreadNotifications = false,
  notificationCount = 0,
  size = 'medium',
  maxNotificationDisplay = 99,
  backgroundColor = colors.background.primary,
  style,
  onProfilePress,
  onNotificationPress,
}) => {
  // Get size-specific dimensions
  const getSizeDimensions = (sizeVariant: HeaderSize) => {
    switch (sizeVariant) {
      case 'small':
        return {
          avatarSize: spacing['4xl'],
          iconSize: spacing['2xl'],
          fontSize: typography.fontSize.sm,
          badgeSize: spacing.lg,
          badgeFontSize: typography.fontSize.xs - 2,
        };
      case 'large':
        return {
          avatarSize: spacing['5xl'],
          iconSize: spacing['3xl'],
          fontSize: typography.fontSize.lg,
          badgeSize: spacing['2xl'],
          badgeFontSize: typography.fontSize.sm,
        };
      case 'medium':
      default:
        return {
          avatarSize: 44,
          iconSize: 28,
          fontSize: typography.fontSize.md,
          badgeSize: spacing.xl,
          badgeFontSize: typography.fontSize.xs - 1,
        };
    }
  };

  const dimensions = getSizeDimensions(size);
  const avatarRadius = dimensions.avatarSize / 2;
  const badgeRadius = dimensions.badgeSize / 2;

  // Get initials from user name for fallback avatar
  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Format notification count display
  const formatNotificationCount = (count: number): string => {
    return count > maxNotificationDisplay ? `${maxNotificationDisplay}+` : count.toString();
  };

  return (
    <View style={[styles.container, { backgroundColor }, style]}>
      {/* Profile Picture */}
      <TouchableOpacity
        style={[
          styles.profileButton,
          { width: dimensions.avatarSize, height: dimensions.avatarSize },
        ]}
        onPress={onProfilePress}
        activeOpacity={0.7}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={[
              styles.avatar,
              {
                width: dimensions.avatarSize,
                height: dimensions.avatarSize,
                borderRadius: avatarRadius,
              },
            ]}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[
              styles.avatarFallback,
              {
                width: dimensions.avatarSize,
                height: dimensions.avatarSize,
                borderRadius: avatarRadius,
              },
            ]}
          >
            <Text style={[styles.avatarText, { fontSize: dimensions.fontSize }]}>
              {getInitials(userName)}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Notification Icon */}
      <TouchableOpacity
        style={[
          styles.notificationButton,
          { width: dimensions.avatarSize, height: dimensions.avatarSize },
        ]}
        onPress={onNotificationPress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={hasUnreadNotifications ? 'bell-badge' : 'bell-outline'}
          size={dimensions.iconSize}
          color={hasUnreadNotifications ? colors.primary[500] : colors.text.secondary}
        />
        {notificationCount > 0 && (
          <View
            style={[
              styles.badge,
              {
                minWidth: dimensions.badgeSize,
                height: dimensions.badgeSize,
                borderRadius: badgeRadius,
              },
            ]}
          >
            <Text style={[styles.badgeText, { fontSize: dimensions.badgeFontSize }]}>
              {formatNotificationCount(notificationCount)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  profileButton: {
    // Dynamic dimensions applied via inline style
  },
  avatar: {
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  avatarFallback: {
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  avatarText: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[600],
  },
  notificationButton: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colors.highlight[500],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    ...shadows.sm,
  },
  badgeText: {
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral.white,
  },
});
