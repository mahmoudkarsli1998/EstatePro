import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files directly for bundling if preferred, 
// or use Backend to load them from /public/locales
import translationEN from './locales/en/translation.json';
import translationAR from './locales/ar/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  ar: {
    translation: translationAR
  }
};

// RTL languages
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/**
 * Get direction based on language
 * @param {string} lang - Language code
 * @returns {'ltr' | 'rtl'}
 */
export const getDirection = (lang) => {
  return RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
};

/**
 * Update the document direction and lang attribute
 * @param {string} lang - Language code
 */
export const updateDocumentDirection = (lang) => {
  const dir = getDirection(lang);
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
  
  // Add direction class to body for Tailwind RTL support
  if (dir === 'rtl') {
    document.body.classList.add('rtl');
    document.body.classList.remove('ltr');
  } else {
    document.body.classList.add('ltr');
    document.body.classList.remove('rtl');
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },
    // React i18next options
    react: {
      useSuspense: false,
    }
  });

// Update direction on initialization
const initialLang = i18n.language || localStorage.getItem('language') || 'en';
updateDocumentDirection(initialLang);

// Listen for language changes and update direction
i18n.on('languageChanged', (lng) => {
  updateDocumentDirection(lng);
  // Force a re-render by updating the body class
  document.body.classList.add('language-changed');
  setTimeout(() => document.body.classList.remove('language-changed'), 100);
});

// Export utilities
export { RTL_LANGUAGES };
export default i18n;
