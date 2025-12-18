import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => changeLanguage(i18n.language.startsWith('en') ? 'ar' : 'en')}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium text-white"
      >
        <Globe className="w-4 h-4" />
        <span>{i18n.language.startsWith('en') ? 'العربية' : 'English'}</span>
      </button>
    </div>
  );
};

export default LanguageSwitcher;
