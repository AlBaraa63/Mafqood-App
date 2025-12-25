/**
 * Custom Hooks Index
 */

export { useAuthStore, useLanguageStore, useReportFormStore, useOnboardingStore } from './useStore';

import { useCallback } from 'react';
import { useLanguageStore } from './useStore';
import { t, TranslationKey } from '../i18n/strings';

/**
 * Hook for translations
 */
export function useTranslation() {
  const { language } = useLanguageStore();
  
  const translate = useCallback(
    (key: TranslationKey | string, params?: Record<string, string | number>) => {
      return t(language, key, params);
    },
    [language]
  );
  
  return {
    t: translate,
    language,
    isRTL: language === 'ar',
  };
}

/**
 * Hook for formatting dates based on locale
 */
export function useFormatDate() {
  const { language } = useLanguageStore();

  const getLocale = useCallback(
    () => (language === 'ar' ? 'ar-AE' : 'en-AE'),
    [language]
  );
  
  const formatDate = useCallback(
    (dateString: string, options?: Intl.DateTimeFormatOptions) => {
      const date = new Date(dateString);
      
      return date.toLocaleDateString(getLocale(), {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options,
      });
    },
    [getLocale]
  );
  
  const formatTime = useCallback(
    (dateString: string) => {
      const date = new Date(dateString);
      
      return date.toLocaleTimeString(getLocale(), {
        hour: '2-digit',
        minute: '2-digit',
      });
    },
    [getLocale]
  );
  
  const formatDateTime = useCallback(
    (dateString: string) => {
      return `${formatDate(dateString)} ${formatTime(dateString)}`;
    },
    [formatDate, formatTime]
  );
  
  const formatRelative = useCallback(
    (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const dayMs = 1000 * 60 * 60 * 24;
      const diffDays = Math.round((date.getTime() - now.getTime()) / dayMs);
      const relativeFormatter = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' });
      
      if (Math.abs(diffDays) < 7) {
        return relativeFormatter.format(diffDays, 'day');
      }
      
      return formatDate(dateString);
    },
    [formatDate, getLocale]
  );
  
  return {
    formatDate,
    formatTime,
    formatDateTime,
    formatRelative,
  };
}

/**
 * Hook for validation
 */
export function useValidation() {
  const { t } = useTranslation();
  
  const validateEmail = useCallback(
    (email: string): string | null => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email) return t('required_field');
      if (!emailRegex.test(email)) return t('invalid_email');
      return null;
    },
    [t]
  );
  
  const validatePassword = useCallback(
    (password: string): string | null => {
      if (!password) return t('required_field');
      if (password.length < 8) return t('password_too_short');
      return null;
    },
    [t]
  );
  
  const validatePhone = useCallback(
    (phone: string): string | null => {
      // UAE phone format: +971 5X XXX XXXX or 05X XXX XXXX
      const phoneRegex = /^(\+971|00971|0)?5[0-9]{8}$/;
      const cleanPhone = phone.replace(/[\s-]/g, '');
      if (!phone) return t('required_field');
      if (!phoneRegex.test(cleanPhone)) return t('invalid_phone');
      return null;
    },
    [t]
  );
  
  const validateRequired = useCallback(
    (value: string): string | null => {
      if (!value || value.trim() === '') return t('required_field');
      return null;
    },
    [t]
  );
  
  const validatePasswordMatch = useCallback(
    (password: string, confirmPassword: string): string | null => {
      if (password !== confirmPassword) return t('passwords_dont_match');
      return null;
    },
    [t]
  );
  
  return {
    validateEmail,
    validatePassword,
    validatePhone,
    validateRequired,
    validatePasswordMatch,
  };
}
