import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield, ChevronDown, ChevronUp } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'estatepro_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'estatepro_cookie_preferences';

/**
 * Cookie categories and their descriptions
 */
const COOKIE_CATEGORIES = {
  necessary: {
    name: 'Essential Cookies',
    nameAr: 'ملفات تعريف الارتباط الضرورية',
    description: 'Required for the website to function properly. Cannot be disabled.',
    descriptionAr: 'مطلوبة لعمل الموقع بشكل صحيح. لا يمكن تعطيلها.',
    required: true,
    default: true,
  },
  analytics: {
    name: 'Analytics Cookies',
    nameAr: 'ملفات تحليلية',
    description: 'Help us understand how visitors interact with our website.',
    descriptionAr: 'تساعدنا على فهم كيفية تفاعل الزوار مع موقعنا.',
    required: false,
    default: true,
  },
  functional: {
    name: 'Functional Cookies',
    nameAr: 'ملفات وظيفية',
    description: 'Enable personalized features like AI chat history and preferences.',
    descriptionAr: 'تمكن الميزات الشخصية مثل سجل الدردشة والتفضيلات.',
    required: false,
    default: true,
  },
  marketing: {
    name: 'Marketing Cookies',
    nameAr: 'ملفات تسويقية',
    description: 'Used to show relevant advertisements based on your interests.',
    descriptionAr: 'تستخدم لعرض إعلانات ذات صلة بناءً على اهتماماتك.',
    required: false,
    default: false,
  },
};

const CookieConsentBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    functional: true,
    marketing: false,
  });
  const [isArabic, setIsArabic] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        setPreferences(JSON.parse(savedPrefs));
      }
    }

    // Detect Arabic language
    const lang = document.documentElement.lang || navigator.language;
    setIsArabic(lang.startsWith('ar'));
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    };
    saveConsent(allAccepted);
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences);
  };

  const handleRejectNonEssential = () => {
    const essentialOnly = {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    };
    saveConsent(essentialOnly);
  };

  const saveConsent = (prefs) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setPreferences(prefs);
    setShowBanner(false);

    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: prefs }));
  };

  const togglePreference = (key) => {
    if (COOKIE_CATEGORIES[key].required) return;
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] animate-in fade-in duration-300" />

      {/* Banner */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 animate-in slide-in-from-bottom-10 fade-in duration-500"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-border/10 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-4 flex items-start gap-4">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Cookie size={28} className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-black text-textDark dark:text-white mb-2">
                {isArabic ? 'نحن نستخدم ملفات تعريف الارتباط 🍪' : 'We Use Cookies 🍪'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {isArabic
                  ? 'نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتخصيص المحتوى وتحليل استخدام الموقع. يمكنك تخصيص تفضيلاتك أدناه.'
                  : 'We use cookies to enhance your experience, personalize content, and analyze site usage. You can customize your preferences below.'}
              </p>
            </div>
          </div>

          {/* Details Toggle */}
          <div className="px-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors"
            >
              <Shield size={16} />
              {isArabic ? 'تخصيص التفضيلات' : 'Customize Preferences'}
              {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Cookie Categories (Expandable) */}
          {showDetails && (
            <div className="px-6 py-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
              {Object.entries(COOKIE_CATEGORIES).map(([key, category]) => (
                <div
                  key={key}
                  className={`p-4 rounded-2xl border transition-all ${
                    preferences[key]
                      ? 'bg-primary/5 border-primary/20'
                      : 'bg-gray-50 dark:bg-gray-800 border-border/10'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-textDark dark:text-white">
                          {isArabic ? category.nameAr : category.name}
                        </span>
                        {category.required && (
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-[10px] font-black uppercase rounded-full text-gray-600 dark:text-gray-300">
                            {isArabic ? 'مطلوب' : 'Required'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {isArabic ? category.descriptionAr : category.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences[key]}
                        onChange={() => togglePreference(key)}
                        disabled={category.required}
                        className="sr-only peer"
                      />
                      <div
                        className={`w-11 h-6 rounded-full peer transition-all ${
                          category.required
                            ? 'bg-primary cursor-not-allowed'
                            : 'bg-gray-300 dark:bg-gray-600 peer-checked:bg-primary'
                        } peer-focus:outline-none after:content-[''] after:absolute after:top-[2px] ${
                          isArabic ? 'after:right-[2px]' : 'after:left-[2px]'
                        } after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full`}
                      ></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="p-6 pt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRejectNonEssential}
              className="flex-1 py-3 px-6 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-2xl transition-all"
            >
              {isArabic ? 'الضروري فقط' : 'Essential Only'}
            </button>
            {showDetails && (
              <button
                onClick={handleAcceptSelected}
                className="flex-1 py-3 px-6 text-sm font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-2xl transition-all"
              >
                {isArabic ? 'حفظ التفضيلات' : 'Save Preferences'}
              </button>
            )}
            <button
              onClick={handleAcceptAll}
              className="flex-1 py-3 px-6 text-sm font-black text-white bg-primary hover:bg-primary-dark rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              {isArabic ? 'قبول الكل' : 'Accept All'}
            </button>
          </div>

          {/* Privacy Link */}
          <div className="px-6 pb-4 text-center">
            <a
              href="/privacy-policy"
              className="text-xs text-gray-400 hover:text-primary transition-colors"
            >
              {isArabic ? 'اقرأ سياسة الخصوصية' : 'Read our Privacy Policy'}
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Hook to check cookie preferences
 */
export const useCookieConsent = () => {
  const [consent, setConsent] = useState({
    given: false,
    preferences: {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    },
  });

  useEffect(() => {
    const checkConsent = () => {
      const hasConsent = localStorage.getItem(COOKIE_CONSENT_KEY) === 'true';
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);

      setConsent({
        given: hasConsent,
        preferences: savedPrefs
          ? JSON.parse(savedPrefs)
          : {
              necessary: true,
              analytics: false,
              functional: false,
              marketing: false,
            },
      });
    };

    checkConsent();

    // Listen for consent updates
    const handleUpdate = (e) => {
      setConsent({
        given: true,
        preferences: e.detail,
      });
    };

    window.addEventListener('cookieConsentUpdated', handleUpdate);
    return () => window.removeEventListener('cookieConsentUpdated', handleUpdate);
  }, []);

  return consent;
};

/**
 * Utility to check if a specific cookie category is allowed
 */
export const isCookieAllowed = (category) => {
  const prefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
  if (!prefs) return category === 'necessary';
  const parsed = JSON.parse(prefs);
  return parsed[category] === true;
};

export default CookieConsentBanner;
