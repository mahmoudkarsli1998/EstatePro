import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

// Currency definitions
export const currencies = {
  EGP: {
    code: 'EGP',
    symbol: 'ج.م',
    symbolEn: 'EGP',
    name: 'Egyptian Pound',
    nameAr: 'جنيه مصري',
    locale: 'ar-EG',
    position: 'after', // symbol position: 'before' or 'after'
    decimals: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  USD: {
    code: 'USD',
    symbol: '$',
    symbolEn: '$',
    name: 'US Dollar',
    nameAr: 'دولار أمريكي',
    locale: 'en-US',
    position: 'before',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  SAR: {
    code: 'SAR',
    symbol: 'ر.س',
    symbolEn: 'SAR',
    name: 'Saudi Riyal',
    nameAr: 'ريال سعودي',
    locale: 'ar-SA',
    position: 'after',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  AED: {
    code: 'AED',
    symbol: 'د.إ',
    symbolEn: 'AED',
    name: 'UAE Dirham',
    nameAr: 'درهم إماراتي',
    locale: 'ar-AE',
    position: 'after',
    decimals: 2,
    thousandsSeparator: ',',
    decimalSeparator: '.'
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    symbolEn: '€',
    name: 'Euro',
    nameAr: 'يورو',
    locale: 'de-DE',
    position: 'after',
    decimals: 2,
    thousandsSeparator: '.',
    decimalSeparator: ','
  }
};

// Default currency
const DEFAULT_CURRENCY = 'EGP';

// Create context
const CurrencyContext = createContext(null);

/**
 * Format a price value with the given currency
 * @param {number} amount - The price amount
 * @param {string} currencyCode - Currency code (EGP, USD, etc.)
 * @param {object} options - Formatting options
 * @param {boolean} options.compact - Use compact format (1.5M, 500K)
 * @param {boolean} options.showSymbol - Show currency symbol
 * @param {boolean} options.showCode - Use code instead of symbol
 * @param {string} options.language - Language for symbol (ar = ج.م, en = EGP)
 */
export const formatPrice = (amount, currencyCode = DEFAULT_CURRENCY, options = {}) => {
  const currency = currencies[currencyCode] || currencies[DEFAULT_CURRENCY];
  const { compact = false, showSymbol = true, showCode = false, language = 'ar' } = options;
  
  // Handle null/undefined
  if (amount == null || isNaN(amount)) {
    const sym = language === 'ar' ? currency.symbol : currency.symbolEn;
    return showSymbol ? `0 ${sym}` : '0';
  }
  
  let formattedNumber;
  
  if (compact && Math.abs(amount) >= 1000000) {
    // Format as millions (M)
    formattedNumber = (amount / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (compact && Math.abs(amount) >= 1000) {
    // Format as thousands (K)
    formattedNumber = (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  } else {
    // Standard formatting with locale
    formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: currency.decimals,
      maximumFractionDigits: currency.decimals
    }).format(amount);
  }
  
  // Build the output string
  if (!showSymbol && !showCode) {
    return formattedNumber;
  }
  
  // Select symbol based on language: Arabic = symbol (ج.م), English = symbolEn (EGP)
  const symbolToShow = showCode 
    ? currency.code 
    : (language === 'ar' ? currency.symbol : currency.symbolEn);
  
  if (currency.position === 'before') {
    return `${symbolToShow}${formattedNumber}`;
  } else {
    return `${formattedNumber} ${symbolToShow}`;
  }
};

/**
 * Format price range
 */
export const formatPriceRange = (min, max, currencyCode = DEFAULT_CURRENCY, options = {}) => {
  if (!min && !max) return '-';
  if (!max || min === max) return formatPrice(min, currencyCode, options);
  if (!min) return formatPrice(max, currencyCode, options);
  
  const minFormatted = formatPrice(min, currencyCode, { ...options, showSymbol: false });
  const maxFormatted = formatPrice(max, currencyCode, options);
  
  return `${minFormatted} - ${maxFormatted}`;
};

/**
 * Currency Provider Component
 */
export const CurrencyProvider = ({ children, defaultCurrency = DEFAULT_CURRENCY }) => {
  const [currentCurrency, setCurrentCurrency] = useState(defaultCurrency);
  
  const value = {
    currency: currentCurrency,
    currencyData: currencies[currentCurrency],
    currencies,
    setCurrency: setCurrentCurrency,
    getCurrency: () => currencies[currentCurrency] || currencies[DEFAULT_CURRENCY]
  };
  
  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

/**
 * Hook to use currency formatting with automatic language detection
 */
export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  const { i18n } = useTranslation();
  
  // Detect current language
  const currentLang = i18n?.language?.startsWith('ar') ? 'ar' : 'en';
  const currentCurrency = context?.currency || DEFAULT_CURRENCY;
  
  // Create language-aware format functions
  const format = useCallback((amount, options = {}) => {
    return formatPrice(amount, currentCurrency, { ...options, language: currentLang });
  }, [currentCurrency, currentLang]);
  
  const formatRange = useCallback((min, max, options = {}) => {
    return formatPriceRange(min, max, currentCurrency, { ...options, language: currentLang });
  }, [currentCurrency, currentLang]);
  
  const formatCompact = useCallback((amount) => {
    return formatPrice(amount, currentCurrency, { compact: true, language: currentLang });
  }, [currentCurrency, currentLang]);
  
  const getCurrency = useCallback(() => {
    return currencies[currentCurrency] || currencies[DEFAULT_CURRENCY];
  }, [currentCurrency]);
  
  // Fallback if used outside provider (for backwards compatibility)
  if (!context) {
    return {
      currency: DEFAULT_CURRENCY,
      currencyData: currencies[DEFAULT_CURRENCY],
      currencies,
      setCurrency: () => console.warn('CurrencyProvider not found'),
      format,
      formatRange,
      formatCompact,
      getCurrency,
      formatPrice: (amount, opts) => formatPrice(amount, DEFAULT_CURRENCY, { ...opts, language: currentLang })
    };
  }
  
  return {
    ...context,
    format,
    formatRange,
    formatCompact,
    getCurrency,
    formatPrice: (amount, opts) => formatPrice(amount, currentCurrency, { ...opts, language: currentLang })
  };
};

/**
 * Simple Price component for inline usage
 */
export const Price = ({ amount, compact = false, showCode = false, className = '' }) => {
  const { format, formatCompact } = useCurrency();
  
  const formatted = compact ? formatCompact(amount) : format(amount, { showCode });
  
  return (
    <span className={className} style={{ direction: 'ltr', unicodeBidi: 'embed' }}>
      {formatted}
    </span>
  );
};

export default CurrencyContext;

