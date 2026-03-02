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

  // Update SEO Meta Tags based on language
  const title = lang === 'ar' 
    ? 'إستيت برو | تكنولوجيا العقارات الفاخرة الحديثة | اكتشف عقارك المثالي بدقة الذكاء الاصطناعي'
    : 'EstatePro | Luxury modern real estate technology | Discover Your Perfect Property With AI Precision';
    
  const description = lang === 'ar'
    ? 'إستيت برو، المنصة الرائدة في تكنولوجيا العقارات الفاخرة. اكتشف عقارك المثالي بدقة الذكاء الاصطناعي في مصر والشرق الأوسط. شراء، بيع، وتأجير العقارات.'
    : 'Discover your perfect property with EstatePro. Luxury modern real estate technology driven by AI precision in Egypt and the MENA region. Buy, sell, and rent luxury homes.';

  document.title = title;
  
  const updateMeta = (selector, content) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute('content', content);
  };

  updateMeta('meta[name="description"]', description);
  updateMeta('meta[property="og:title"]', title);
  updateMeta('meta[property="og:description"]', description);
  updateMeta('meta[property="twitter:title"]', title);
  updateMeta('meta[property="twitter:description"]', description);
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
