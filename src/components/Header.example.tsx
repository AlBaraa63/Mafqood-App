/**
 * Header Component - Usage Examples
 * 
 * This file demonstrates various ways to use the Header component
 * in different screens across the Mafqood app.
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { Header } from './Header';
import { useAuthStore } from '../../hooks/useStore';
import { useNavigation } from '@react-navigation/native';

// ===== Example 1: Basic Usage with User Data =====
export const BasicHeaderExample = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();

  return (
    <Header
      avatarUrl={user?.avatarUrl}
      userName={user?.fullName}
      onProfilePress={() => navigation.navigate('ProfileTab')}
      onNotificationPress={() => console.log('Navigate to notifications')}
    />
  );
};

// ===== Example 2: With Notification Badge =====
export const HeaderWithNotificationBadge = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch notification count from your API
  React.useEffect(() => {
    // const fetchCount = async () => {
    //   const response = await api.getNotificationCount();
    //   setNotificationCount(response.count);
    // };
    // fetchCount();
  }, []);

  return (
    <Header
      avatarUrl={user?.avatarUrl}
      userName={user?.fullName}
      hasUnreadNotifications={notificationCount > 0}
      notificationCount={notificationCount}
      onProfilePress={() => navigation.navigate('ProfileTab')}
      onNotificationPress={() => navigation.navigate('NotificationsTab')}
    />
  );
};

// ===== Example 3: Guest User (No Avatar) =====
export const GuestUserHeader = () => {
  const navigation = useNavigation<any>();
  
  return (
    <Header
      userName="Guest User"
      onProfilePress={() => navigation.navigate('LoginScreen')}
      onNotificationPress={() => navigation.navigate('LoginScreen')}
    />
  );
};

// ===== Example 4: With State Management =====
export const StatefulHeaderExample = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [hasUnread, setHasUnread] = useState(false);
  const [count, setCount] = useState(0);

  const handleNotificationPress = () => {
    // Clear notifications when pressed
    setHasUnread(false);
    setCount(0);
    // Navigate to notifications screen
    navigation.navigate('NotificationsTab');
  };

  return (
    <Header
      avatarUrl={user?.avatarUrl}
      userName={user?.fullName || 'User'}
      hasUnreadNotifications={hasUnread}
      notificationCount={count}
      onProfilePress={() => navigation.navigate('ProfileTab')}
      onNotificationPress={handleNotificationPress}
    />
  );
};

// ===== Example 5: Integration with API =====
export const HeaderWithAPIIntegration = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();
  const [notificationData, setNotificationData] = useState({
    hasUnread: false,
    count: 0,
  });

  // Notification polling interval in milliseconds
  const POLLING_INTERVAL = 30 * 1000; // 30 seconds

  // Fetch notifications from API
  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Replace with your actual API call
        // const response = await api.getNotifications();
        // setNotificationData({
        //   hasUnread: response.hasUnread,
        //   count: response.unreadCount,
        // });
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications
    const interval = setInterval(fetchNotifications, POLLING_INTERVAL);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Header
      avatarUrl={user?.avatarUrl}
      userName={user?.fullName || 'User'}
      hasUnreadNotifications={notificationData.hasUnread}
      notificationCount={notificationData.count}
      onProfilePress={() => navigation.navigate('ProfileTab')}
      onNotificationPress={() => {
        // Mark notifications as read
        setNotificationData({ hasUnread: false, count: 0 });
        // Navigate to notifications
        navigation.navigate('NotificationsTab');
      }}
    />
  );
};

// ===== Example 6: Custom Styling Context =====
export const StyledHeaderExample = () => {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();

  return (
    <Header
      avatarUrl={user?.avatarUrl}
      userName={user?.fullName}
      size="large"
      backgroundColor="transparent"
      style={{ paddingVertical: 20 }}
      maxNotificationDisplay={999}
      onProfilePress={() => navigation.navigate('ProfileTab')}
      onNotificationPress={() => navigation.navigate('NotificationsTab')}
    />
  );
};
