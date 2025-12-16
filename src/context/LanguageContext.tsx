/**
 * Mafqood Mobile - Language Context Provider
 * Provides i18n support with EN/AR toggle and RTL support
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, translate, SupportedLanguage } from '../i18n/translations';

interface LanguageContextType {
  lang: SupportedLanguage;
  language: SupportedLanguage; // Alias for lang
  dir: 'ltr' | 'rtl';
  t: (key: string) => string;
  setLanguage: (lang: SupportedLanguage) => Promise<void>;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_KEY = '@mafqood_language';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language preference on mount
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLang && (savedLang === 'en' || savedLang === 'ar')) {
        setLang(savedLang);
        updateRTL(savedLang);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateRTL = (newLang: SupportedLanguage) => {
    const isRTL = newLang === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      // Note: In a production app, you might need to reload the app for RTL changes
    }
  };

  const setLanguage = async (newLang: SupportedLanguage) => {
    try {
      // Update state immediately for responsive UI
      setLang(newLang);
      updateRTL(newLang);
      
      // Persist to storage
      await AsyncStorage.setItem(LANGUAGE_KEY, newLang);
      console.log('Language changed to:', newLang);
    } catch (error) {
      console.error('Error saving language:', error);
      // Revert on error
      setLang(lang);
    }
  };

  const t = (key: string): string => {
    return translate(lang, key);
  };

  const value: LanguageContextType = {
    lang,
    language: lang, // Alias for lang
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    t,
    setLanguage,
    isRTL: lang === 'ar',
  };

  // Don't render children until language is loaded
  if (isLoading) {
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

export default LanguageContext;
