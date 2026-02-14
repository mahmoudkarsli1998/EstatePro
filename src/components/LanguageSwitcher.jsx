import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Direction is automatically updated by the i18n.on('languageChanged') listener in i18n.js
  };

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('en') ? 'ar' : 'en';
    changeLanguage(newLang);
  };

  return (
    <div className="relative group">
      <button
        onClick={toggleLanguage}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg 
          hover:bg-black/5 dark:hover:bg-white/10 
          transition-colors text-sm font-medium 
          text-textDark dark:text-white
          ${isRTL ? 'flex-row-reverse' : ''}
        `}
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        <span>{i18n.language.startsWith('en') ? 'العربية' : 'English'}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${isRTL ? 'rotate-90' : '-rotate-90'}`} />
      </button>
      
      {/* Dropdown for direct language selection */}
      <div className={`
        absolute top-full mt-1 py-1 min-w-[120px] 
        bg-white dark:bg-gray-800 rounded-lg shadow-lg 
        border border-border/20 dark:border-gray-700
        opacity-0 invisible group-hover:opacity-100 group-hover:visible 
        transition-all z-50
        ${isRTL ? 'right-0 text-right' : 'left-0 text-left'}
      `}>
        <button
          onClick={() => changeLanguage('en')}
          className={`
            w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700
            ${i18n.language.startsWith('en') ? 'text-primary font-bold' : 'text-gray-700 dark:text-gray-300'}
            ${isRTL ? 'text-right' : 'text-left'}
          `}
        >
          English
        </button>
        <button
          onClick={() => changeLanguage('ar')}
          className={`
            w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700
            ${i18n.language.startsWith('ar') ? 'text-primary font-bold' : 'text-gray-700 dark:text-gray-300'}
            ${isRTL ? 'text-right' : 'text-left'}
          `}
        >
          العربية
        </button>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
