import React, { createContext, useContext, useState } from 'react';

const I18nContext = createContext({
  locale: 'en',
  setLocale: () => {},
  t: (key, replacements = {}) => key,
  languages: ['en', 'es'],
});

export default I18nContext;

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  return context;
};

export const I18nProvider = ({ children }) => {
  const [locale, setLocale] = useState('en');

  const t = (key, replacements = {}) => {
    const translations = locales[locale] || locales['en'];
    let text = translations[key] || key;

    Object.entries(replacements).forEach(([rKey, value]) => {
      text = text.replace(new RegExp(`{${rKey}}`, 'g'), value);
    });

    return text;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, languages: ['en', 'es'] }}>
      {children}
    </I18nContext.Provider>
  );
};

const locales = {
  en: require('../locales/en.json'),
  es: require('../locales/es.json'),
};
