import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SUPPORTED_LANGUAGES, TRANSLATIONS, LanguageOption, TranslationDict } from '../utils/i18n';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: TranslationDict;
  activeLangObj: LanguageOption;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<string>('en');

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        activeLangObj,
        supportedLanguages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
