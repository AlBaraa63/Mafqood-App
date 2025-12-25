/**
 * Storage Utility - Cross-platform secure storage wrapper
 * Uses expo-secure-store for native and AsyncStorage/localStorage for web
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Web fallback using localStorage
const webStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage might be full or unavailable
    }
  },
  async deleteItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  },
};

// Native storage using SecureStore
const nativeStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Storage might be unavailable
    }
  },
  async deleteItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore errors
    }
  },
};

// Export the appropriate storage based on platform
export const storage = Platform.OS === 'web' ? webStorage : nativeStorage;

export default storage;
