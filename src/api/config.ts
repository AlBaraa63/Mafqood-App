/**
 * Mafqood App - API Configuration
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { logger } from '../utils';

// Backend URL - Update this based on your environment
// For local development: http://localhost:8000
// For Expo on physical device: http://YOUR_LOCAL_IP:8000

/**
 * Get the API base URL based on the platform and environment
 */
function getApiUrl(): string {
  if (!__DEV__) {
    // Production URL
    return 'https://api.mafqood.ae';
  }

  // Development URLs
  // For Android emulator, use 10.0.2.2 to access host machine's localhost
  // For iOS simulator, use localhost
  // For physical devices, use your machine's local IP address
  
  const localhost = Platform.select({
    ios: 'localhost',
    android: '10.0.2.2', // Android emulator's special IP for host machine
    default: 'localhost',
  });

  // Default fallback
  const defaultUrl = `http://${localhost}:8000`;
  
  // Try to get from expo config
  let apiUrl = defaultUrl;
  try {
    if (Constants.expoConfig?.extra?.apiUrl) {
      apiUrl = Constants.expoConfig.extra.apiUrl;
    }
  } catch (e) {
    logger.warn('Could not read expo config, using default:', defaultUrl);
  }
  
  logger.info('API_BASE_URL:', apiUrl);
  
  return apiUrl;
}

export const API_BASE_URL = getApiUrl();

// API version - can be switched to use versioned or legacy endpoints
const API_VERSION = 'v1'; // Change to '' for legacy endpoints

export const API_ENDPOINTS = {
  // Auth (no version prefix for auth routes)
  login: '/auth/login',
  register: '/auth/register',
  logout: '/auth/logout',
  forgotPassword: '/auth/forgot-password',
  refreshToken: '/auth/refresh',
  
  // Items (versioned API)
  lostItems: `/api/${API_VERSION}/lost`,
  foundItems: `/api/${API_VERSION}/found`,
  history: `/api/${API_VERSION}/history`,
  itemDetail: (id: string) => `/api/${API_VERSION}/items/${id}`,
  itemMatches: (id: string) => `/api/${API_VERSION}/items/${id}/matches`,
  deleteItem: (id: string) => `/api/${API_VERSION}/items/${id}`,
  
  // User
  profile: '/auth/users/me',
  updateProfile: '/auth/users/me',
  
  // Notifications (versioned API)
  notifications: `/api/${API_VERSION}/notifications`,
  markNotificationRead: (id: string) => `/api/${API_VERSION}/notifications/${id}/read`,
  markAllNotificationsRead: `/api/${API_VERSION}/notifications/read-all`,
  
  // Upload
  uploadImage: `/api/${API_VERSION}/upload/image`,

  // Admin/Test
  reset: '/api/reset',
  health: '/health',
};

export const API_TIMEOUT = 30000; // 30 seconds

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  API_TIMEOUT,
};
