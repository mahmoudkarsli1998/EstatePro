import React, { useState, useEffect } from 'react';
import { Cookie, Settings } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'estatepro_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'estatepro_cookie_preferences';

/**
 * A small floating button to re-open cookie settings
 * Can be placed in footer or as a floating widget
 */
const CookieSettingsButton = ({ variant = 'floating' }) => {
  const [hasConsent, setHasConsent] = useState(true);

  useEffect(() => {
    setHasConsent(localStorage.getItem(COOKIE_CONSENT_KEY) === 'true');
  }, []);

  const openSettings = () => {
    // Clear consent to show the banner again
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    window.location.reload();
  };

  // Don't show if user hasn't given consent yet (banner will show)
  if (!hasConsent) return null;

  if (variant === 'text') {
    return (
      <button
        onClick={openSettings}
        className="text-xs text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
      >
        <Cookie size={12} />
        Cookie Settings
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={openSettings}
        className="p-2 text-gray-400 hover:text-primary transition-colors"
        title="Cookie Settings"
      >
        <Cookie size={16} />
      </button>
    );
  }

  // Default: floating button
  return (
    <button
      onClick={openSettings}
      className="fixed bottom-6 left-6 z-[9990] w-12 h-12 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-border/10 flex items-center justify-center text-gray-500 hover:text-primary hover:scale-110 transition-all group"
      title="Cookie Settings"
    >
      <Cookie size={20} />
      <span className="absolute left-full ml-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg border border-border/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Cookie Settings
      </span>
    </button>
  );
};

export default CookieSettingsButton;
