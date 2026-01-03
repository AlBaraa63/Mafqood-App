/**
 * App Store - Zustand Store for Global State
 * Handles auth, language, and app-wide state
 */

import { create } from 'zustand';
import { I18nManager, Platform } from 'react-native';
import { User, AuthState, ItemFormData, ItemType, ContactMethod } from '../types';
import { storage } from '../utils/storage';
import { SupportedLanguage } from '../i18n/strings';
import api from '../api';

// ===== Auth Store =====

interface AuthStore extends AuthState {
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setIsGuest: (isGuest: boolean) => void;
  setLoading: (loading: boolean) => void;
  
  // Auth Operations
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: { fullName: string; email: string; phone: string; password: string; isVenue?: boolean }) => Promise<boolean>;
  logout: () => Promise<void>;
  loginAsGuest: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isGuest: false,
  isLoading: true,
  isAuthenticated: false,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  setIsGuest: (isGuest) => set({ isGuest }),
  setLoading: (isLoading) => set({ isLoading }),
  
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.login({ email, password });
      if (response.success && response.data) {
        const { user, token } = response.data;
        await storage.setItem('authToken', token);
        set({ user, token, isAuthenticated: true, isGuest: false, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },
  
  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.register(data);
      if (response.success && response.data) {
        const { user, token } = response.data;
        await storage.setItem('authToken', token);
        set({ user, token, isAuthenticated: true, isGuest: false, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      set({ isLoading: false });
      return false;
    }
  },
  
  logout: async () => {
    await storage.deleteItem('authToken');
    await api.logout();
    set({ user: null, token: null, isAuthenticated: false, isGuest: false });
  },
  
  loginAsGuest: () => {
    set({ isGuest: true, isAuthenticated: false, user: null, token: null, isLoading: false });
  },
  
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await storage.getItem('authToken');
      if (token) {
        // Validate token with backend
        const response = await api.getProfile(token);
        if (response.success && response.data) {
          set({ user: response.data, token, isAuthenticated: true, isLoading: false });
          return;
        }
        // Token is invalid or expired, clear it
        await storage.deleteItem('authToken');
      }
      // No token or invalid token - user needs to login
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid token on error
      await storage.deleteItem('authToken');
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// ===== Language Store =====

interface LanguageStore {
  language: SupportedLanguage;
  isRTL: boolean;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: 'en',
  isRTL: false,
  
  setLanguage: async (lang) => {
    const isRTL = lang === 'ar';
    
    // Update RTL layout
    if (Platform.OS !== 'web') {
      // Native: Use I18nManager
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.allowRTL(isRTL);
        I18nManager.forceRTL(isRTL);
        // Note: App needs to restart for RTL changes to take effect
      }
    } else {
      // Web: Set dir attribute on document
      if (typeof document !== 'undefined') {
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      }
    }
    
    await storage.setItem('appLanguage', lang);
    set({ language: lang, isRTL });
  },
  
  loadLanguage: async () => {
    try {
      const savedLang = await storage.getItem('appLanguage');
      if (savedLang === 'ar' || savedLang === 'en') {
        const isRTL = savedLang === 'ar';
        
        // Set direction on web
        if (Platform.OS === 'web' && typeof document !== 'undefined') {
          document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        }
        
        set({ language: savedLang, isRTL });
      }
    } catch (error) {
      // Keep default language
    }
  },
}));

// ===== Report Form Store =====

const initialFormData: ItemFormData = {
  type: 'lost',
  imageUri: undefined,
  imageConfirmed: false,
  category: undefined,
  title: '',
  description: '',
  brand: '',
  color: '',
  dateTime: new Date().toISOString(),
  location: '',
  locationDetail: '',
  contactMethod: 'in_app',
  contactPhone: '',
  contactEmail: '',
  termsAccepted: false,
};

interface ReportFormStore {
  formData: ItemFormData;
  currentStep: number;
  
  // Actions
  setFormData: (data: Partial<ItemFormData>) => void;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
  setType: (type: ItemType) => void;
}

export const useReportFormStore = create<ReportFormStore>((set) => ({
  formData: { ...initialFormData },
  currentStep: 1,
  
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  
  setCurrentStep: (step) => set({ currentStep: step }),
  
  resetForm: () =>
    set({
      formData: { ...initialFormData },
      currentStep: 1,
    }),
  
  setType: (type) =>
    set((state) => ({
      formData: { ...state.formData, type },
    })),
}));

// ===== Onboarding Store =====

interface OnboardingStore {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (seen: boolean) => Promise<void>;
  checkOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  hasSeenOnboarding: false,
  
  setHasSeenOnboarding: async (seen) => {
    await storage.setItem('hasSeenOnboarding', seen ? 'true' : 'false');
    set({ hasSeenOnboarding: seen });
  },
  
  checkOnboarding: async () => {
    try {
      const seen = await storage.getItem('hasSeenOnboarding');
      set({ hasSeenOnboarding: seen === 'true' });
    } catch (error) {
      set({ hasSeenOnboarding: false });
    }
  },
}));
