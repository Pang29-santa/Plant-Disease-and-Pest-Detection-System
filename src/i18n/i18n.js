import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import th from './locales/th.json';
import en from './locales/en.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      th: { translation: th },
      en: { translation: en },
    },
    fallbackLng: 'th',
    debug: false,
    detection: {
      // ลำดับการ detect ภาษา: querystring (?lang=) → localStorage → navigator
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',       // ?lang=th หรือ ?lang=en
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
