/**
 * Mafqood App - API Configuration
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

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
    console.warn('[API Config] Could not read expo config, using default:', defaultUrl);
  }
  
  console.log('[API Config] API_BASE_URL:', apiUrl);
  
  return apiUrl;
}

export const API_BASE_URL = getApiUrl();

export const API_ENDPOINTS = {
  // Auth
  login: '/api/auth/login',
  register: '/api/auth/register',
  logout: '/api/auth/logout',
  forgotPassword: '/api/auth/forgot-password',
  refreshToken: '/api/auth/refresh',
  
  // Items
  lostItems: '/api/lost',
  foundItems: '/api/found',
  myItems: '/api/items/me',
  itemDetail: (id: string) => `/api/items/${id}`,
  
  // Matches
  matches: '/api/matches',
  matchDetail: (id: string) => `/api/matches/${id}`,
  claimMatch: (id: string) => `/api/matches/${id}/claim`,
  
  // User
  profile: '/api/users/me',
  updateProfile: '/api/users/me',
  
  // Upload
  uploadImage: '/api/upload/image',
};

export const API_TIMEOUT = 30000; // 30 seconds

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  API_TIMEOUT,
};
