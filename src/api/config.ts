/**
 * Mafqood Mobile - API Configuration
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API Base URL configuration
// For development:
// - Android Emulator: use 10.0.2.2 (maps to localhost on host machine)
// - iOS Simulator: use localhost
// - Physical device: use your computer's local IP address (from Expo)

const getDevApiUrl = () => {
  // Get the Expo dev server host (your computer's IP when using Expo Go)
  const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];
  
  if (expoHost) {
    // Physical device - use the same IP that Expo is using
    return `http://${expoHost}:8000`;
  }
  
  // Fallback for emulators
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
};

// Production URL (update when deployed)
const PROD_API_URL = 'https://api.mafqood.app';

// Use environment variable or fallback to dev URL
export const API_BASE_URL = __DEV__ ? getDevApiUrl() : PROD_API_URL;

// Log the API URL in development for debugging
if (__DEV__) {
  console.log('📡 API Base URL:', API_BASE_URL);
}

// API Endpoints
export const ENDPOINTS = {
  // Items
  LOST: '/api/lost',
  FOUND: '/api/found',
  HISTORY: '/api/history',
  RESET: '/api/reset',
  
  // Health
  HEALTH: '/health',
  ROOT: '/',
};

// Image upload constraints (matching backend)
export const IMAGE_CONFIG = {
  MAX_SIZE_MB: 10,
  MAX_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp'],
};

// Match threshold (70% similarity)
export const MATCH_THRESHOLD = 0.7;
export const HIGH_MATCH_THRESHOLD = 0.75;
