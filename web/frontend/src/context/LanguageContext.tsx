import React, { createContext, useContext, useEffect, useState } from "react";
import { SupportedLanguage, translate } from "../i18n/translations";

interface LanguageContextValue {
  lang: SupportedLanguage;
  dir: "ltr" | "rtl";
  setLang: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const DEFAULT_LANG: SupportedLanguage = "en";
const STORAGE_KEY = "lostfound_lang";

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<SupportedLanguage>(DEFAULT_LANG);

  // Load language from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLanguage | null;
    if (stored === "en" || stored === "ar") {
      setLangState(stored);
    }
  }, []);

  // Update document direction and save to localStorage when language changes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = (newLang: SupportedLanguage) => {
    setLangState(newLang);
  };

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  const value: LanguageContextValue = {
    lang,
    dir,
    setLang,
    t: (key: string) => translate(lang, key),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return ctx;
}
